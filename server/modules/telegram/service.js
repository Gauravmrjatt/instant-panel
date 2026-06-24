const User = require("../users/model");

async function getTelegramAlert(userId) {
  const user = await User.findOne({ userId }).select("tgId").lean();
  if (!user) return { status: false, msg: "User not found" };
  return { status: true, data: user.tgId || {} };
}

async function updateTelegramAlert(userId, tgData) {
  const user = await User.findOneAndUpdate({ userId }, { tgId: tgData }, { new: true });
  if (!user) return { status: false, msg: "User not found" };
  return { status: true, msg: "Telegram alert updated", data: user.tgId };
}

module.exports = { getTelegramAlert, updateTelegramAlert };
