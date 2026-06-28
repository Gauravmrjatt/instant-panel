const User = require("./model");
const Logins = require("../auth/model");
const myDetails = require("../../myDetails.json");
const jwt = require("jsonwebtoken");

async function getUserProfile(userId) {
  const user = await User.findOne({ userId }).lean();
  if (!user) return { status: false, msg: "User not found" };
  const { password, ...userData } = user;
  return { status: true, data: userData };
}

async function getUserSessions(userId) {
  const sessions = await Logins.find({ userId }).sort({ createdAt: -1 }).lean();
  return { status: true, data: sessions };
}

async function uploadProfileImage(userId, filename) {
  const user = await User.findOneAndUpdate({ userId }, { profileImg: filename });
  if (!user) return { status: false, msg: "User not found" };
  const token = jwt.sign({ userId: user.userId, loginToken: user.loginToken }, myDetails.enc_secret);
  return { status: true, msg: "Profile image uploaded", token, image: filename };
}

function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
}

module.exports = { getUserProfile, getUserSessions, uploadProfileImage, getClientIp };
