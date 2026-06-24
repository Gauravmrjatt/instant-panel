const Campaign = require("../campaigns/model");
const Leads = require("../leads/model");
const Clicks = require("../clicks/model");
const Payments = require("../payments/model");
const redisClient = require("../../lib/redisClient");

async function getReportsData(userId, range) {
  const rangeHash = range ? JSON.stringify(range) : "all";
  const cacheKey = `reports:${userId}:${rangeHash}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  let match = { userId };
  if (range && range != `""`) {
    const { from, to } = JSON.parse(range);
    const fromDate = new Date(from.year, from.month - 1, from.day);
    const toDate = new Date(to.year, to.month - 1, to.day);
    if (from && to) {
      match = { userId, createdAt: (fromDate === toDate) ? { $eq: fromDate } : { $gte: fromDate, $lte: toDate } };
    }
  }

  const countResults = await Campaign.aggregate([
    { $match: match },
    { $lookup: { from: "leads", localField: "_id", foreignField: "campId", as: "leadsCount" } },
    { $lookup: { from: "clicks", localField: "_id", foreignField: "campId", as: "clicksCount" } },
    { $lookup: { from: "payments", localField: "_id", foreignField: "campId", as: "payments" } },
    { $sort: { createdAt: -1 } },
    { $project: { _id: 1, campaignId: "$_id", leadsCount: { $size: "$leadsCount" }, clicksCount: { $size: "$clicksCount" }, totalAmount: { $sum: "$payments.amount" }, name: 1, offerID: 1 } },
  ]);

  const data = countResults.map(({ campaignId, leadsCount, clicksCount, totalAmount, name, offerID }) => ({
    id: campaignId, leadsCount, clicksCount, totalAmount, name, offerID,
    cr: Math.round(clicksCount !== 0 ? (leadsCount / clicksCount) * 100 : 0),
  }));

  await redisClient.setEx(cacheKey, 300, JSON.stringify(data));
  return data;
}

async function getNewReportData(userId, id) {
  const [campaign, leadsCount, clicksCount, payments] = await Promise.all([
    Campaign.findOne({ _id: id, userId }).select(["name", "offerID"]),
    Leads.countDocuments({ campId: id }),
    Clicks.countDocuments({ campId: id }),
    Payments.find({ campId: id }).select("amount"),
  ]);

  if (!campaign) return null;

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    _id: campaign._id,
    campaignId: campaign._id,
    leadsCount,
    clicksCount,
    totalAmount,
    name: campaign.name,
    offerID: campaign.offerID,
    cr: Math.round(clicksCount !== 0 ? (leadsCount / clicksCount) * 100 : 0),
  };
}

module.exports = { getReportsData, getNewReportData };