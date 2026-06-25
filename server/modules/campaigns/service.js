const Campaign = require("./model");
const redisClient = require("../../lib/redisClient");
const { v4: uuidv4 } = require("uuid");

async function createCampaign(userId, user, data) {
  const { offerID } = data;
  const newCampaign = new Campaign({
    userId, user, ...data,
    postbackToken: uuidv4(),
    uniqueOfferID: { offerID, user },
  });
  try {
    const camp = await newCampaign.save();
    await Promise.all([
      redisClient.setEx(`campaign:${camp._id}`, 3600, JSON.stringify({ _id: camp._id, userId, tracking: data.tracking })),
      redisClient.del(`dashboard:${userId}`),
      redisClient.del(`campaigns:${userId}`),
    ]);
    return { status: true, msg: "campaign added successfully", id: camp._id };
  } catch (error) {
    if (error.message.includes("uniqueOfferID_1 dup key")) {
      return { status: false, msg: "duplicate offerid" };
    }
    return { status: false, msg: "somthing went wrong", error: error.message };
  }
}

async function getCampaigns(userId) {
  const cacheKey = `campaigns:${userId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return { status: true, data: JSON.parse(cached) };
  const campaigns = await Campaign.find({ userId }).sort({ createdAt: -1 }).lean();
  await redisClient.setEx(cacheKey, 300, JSON.stringify(campaigns));
  return { status: true, data: campaigns };
}

async function getCampaignById(userId, id) {
  if (!id) return { status: false, message: "Missing _id field" };
  const campaign = await Campaign.findOne({ userId, _id: id }).lean();
  return { status: true, data: campaign };
}

async function updateCampaign(userId, id, data) {
  if (!id) return { status: false, message: "Missing _id field" };
  await Campaign.findByIdAndUpdate({ userId, _id: id }, { ...data });
  await Promise.all([
    redisClient.del(`campaign:${id}`),
    redisClient.del(`campaigns:${userId}`),
  ]);
  return { status: true, data: {} };
}

async function deleteCampaign(userId, id) {
  if (!id) return { status: false, message: "Missing _id field" };
  await Campaign.findByIdAndDelete({ userId, _id: id });
  await Promise.all([
    redisClient.del(`campaign:${id}`),
    redisClient.del(`dashboard:${userId}`),
    redisClient.del(`campaigns:${userId}`),
  ]);
  return { status: true, msg: "Deleted Successfully" };
}

async function searchCampaigns(userId, text) {
  if (!text) return { status: false, msg: "text missing" };
  const campaigns = await Campaign.find({ userId, $or: [{ name: { $regex: text, $options: "i" } }] }).lean();
  return { status: true, data: campaigns };
}

module.exports = { createCampaign, getCampaigns, getCampaignById, updateCampaign, deleteCampaign, searchCampaigns };
