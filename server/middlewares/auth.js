var details = require("../myDetails.json");
var jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../modules/users/model");
const redisClient = require("../lib/redisClient");

const authValid = (req, res, next) => {
 
  const token =
    req.cookies.jwt_token ||
    req.headers["authorization"]?.split(" ")[1] ||
    req.headers["x-access-token"] ||
    req.body?.token ||
    req.query?.token || null;

  if (!token) {
    return res.status(401).json({
      status: false,
      msg: "Authentication required",
      redirect: "/logout",
    });
  }
  try {
    const decoded = jwt.verify(token, details.enc_secret);
    req.user = decoded;
  } catch (err) {
    return res
      .status(401)
      .json({ status: false, msg: "Invalid token", redirect: "/logout" });
  }
  return next();
};

const authValidWithDb = async (req, res, next) => {
  try {
    const cacheKey = `session:${req.user.loginToken}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed._id) parsed._id = new mongoose.Types.ObjectId(parsed._id);
      req.user.db = parsed;
      return next();
    }

    const UserDbData = await User.findOne({ loginToken: req.user.loginToken }).lean();
    if (!UserDbData) {
      return res.status(401).json({ status: false, msg: "Session expired", redirect: "/logout" });
    }

    await redisClient.setEx(cacheKey, 900, JSON.stringify(UserDbData));
    req.user.db = UserDbData;
    return next();
  } catch (err) {
    console.error("Auth cache error:", err);
    // Fallback to DB query without cache
    const UserDbData = await User.findOne({ loginToken: req.user.loginToken }).lean();
    if (!UserDbData) {
      return res.status(401).json({ status: false, msg: "Session expired", redirect: "/logout" });
    }
    req.user.db = UserDbData;
    return next();
  }
};

module.exports = { authValid, authValidWithDb };
