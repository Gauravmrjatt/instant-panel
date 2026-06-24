const Ban = require("./model");

async function getBannedNumbers(userId) {
  const bans = await Ban.find({ userId }).lean();
  return { status: true, data: bans };
}

async function banNumber(userId, user, number) {
  const existing = await Ban.findOne({ userId, number: number.trim().toLowerCase() });
  if (existing) return { status: false, msg: "Already banned" };
  await new Ban({ userId, user, number: number.trim().toLowerCase() }).save();
  return { status: true, msg: "Number banned successfully" };
}

async function unbanNumber(userId, id) {
  await Ban.findByIdAndDelete(id);
  return { status: true, msg: "Number unbanned successfully" };
}

async function unbanAll(userId) {
  await Ban.deleteMany({ userId });
  return { status: true, msg: "All numbers unbanned" };
}

async function unbanBatch(userId, ids) {
  await Ban.deleteMany({ _id: { $in: ids }, userId });
  return { status: true, msg: "Selected numbers unbanned" };
}

module.exports = { getBannedNumbers, banNumber, unbanNumber, unbanAll, unbanBatch };
