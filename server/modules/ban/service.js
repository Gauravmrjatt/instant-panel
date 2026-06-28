const Ban = require("./model");
const redisClient = require("../../lib/redisClient");

async function getBannedNumbers(userId) {
  const bans = await Ban.find({ userId }).lean();
  return { status: true, data: bans };
}

async function banNumber(userId, user, number) {
  const existing = await Ban.findOne({ userId, number: number.trim().toLowerCase() });
  if (existing) return { status: false, msg: "Already banned" };
  await new Ban({ userId, user, number: number.trim().toLowerCase() }).save();
  redisClient.del(`banCheck:${userId}:${number.trim().toLowerCase()}`).catch(() => {});
  return { status: true, msg: "Number banned successfully" };
}

async function unbanNumber(userId, id) {
  const ban = await Ban.findByIdAndDelete(id);
  if (ban) {
    redisClient.del(`banCheck:${userId}:${ban.number}`).catch(() => {});
  }
  return { status: true, msg: "Number unbanned successfully" };
}

async function unbanAll(userId) {
  await Ban.deleteMany({ userId });
  const keys = await redisClient.keys(`banCheck:${userId}:*`).catch(() => []);
  if (keys.length > 0) redisClient.del(...keys).catch(() => {});
  return { status: true, msg: "All numbers unbanned" };
}

async function unbanBatch(userId, ids) {
  const bans = await Ban.find({ _id: { $in: ids }, userId }).lean();
  await Ban.deleteMany({ _id: { $in: ids }, userId });
  for (const ban of bans) {
    redisClient.del(`banCheck:${userId}:${ban.number}`).catch(() => {});
  }
  return { status: true, msg: "Selected numbers unbanned" };
}

module.exports = { getBannedNumbers, banNumber, unbanNumber, unbanAll, unbanBatch };
