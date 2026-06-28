const CustomAmount = require("./model");
const redisClient = require("../../lib/redisClient");

async function createCustomAmount(userId, user, data) {
  const { number, name, event, campId, userAmount, referAmount, userComment, referComment, referInstant } = data;
  const existing = await CustomAmount.findOne({ number, event, campId });
  if (existing) return { status: false, msg: "Custom amount already exists for this number/campaign/event" };
  await new CustomAmount({ userId, user, number, name, event, campId, userAmount, referAmount, userComment, referComment, referInstant }).save();
  redisClient.del(`customAmount:${campId}:${event}:${number.trim().toLowerCase()}`).catch(() => {});
  return { status: true, msg: "Custom Amount added successfully" };
}

async function getCustomAmounts(userId) {
  const data = await CustomAmount.find({ userId }).populate("campId", "name offerID").lean();
  return { status: true, data };
}

async function deleteCustomAmount(id) {
  const item = await CustomAmount.findByIdAndDelete(id);
  if (item) {
    redisClient.del(`customAmount:${item.campId}:${item.event}:${item.number.trim().toLowerCase()}`).catch(() => {});
  }
  return { status: true, msg: "Deleted Successfully" };
}

async function deleteAllCustomAmounts(userId) {
  const items = await CustomAmount.find({ userId }).lean();
  await CustomAmount.deleteMany({ userId });
  for (const item of items) {
    redisClient.del(`customAmount:${item.campId}:${item.event}:${item.number.trim().toLowerCase()}`).catch(() => {});
  }
  return { status: true, msg: "All deleted" };
}

async function deleteBatchCustomAmounts(ids) {
  const items = await CustomAmount.find({ _id: { $in: ids } }).lean();
  await CustomAmount.deleteMany({ _id: { $in: ids } });
  for (const item of items) {
    redisClient.del(`customAmount:${item.campId}:${item.event}:${item.number.trim().toLowerCase()}`).catch(() => {});
  }
  return { status: true, msg: "Selected deleted" };
}

module.exports = { createCustomAmount, getCustomAmounts, deleteCustomAmount, deleteAllCustomAmounts, deleteBatchCustomAmounts };
