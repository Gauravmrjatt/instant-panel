var details = require("../myDetails.json");
var jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { LRUCache } = require("lru-cache");
const User = require("../modules/users/model");
const redisClient = require("../lib/redisClient");
const logger = require("../lib/logger");

const authCache = new LRUCache({ max: 2000, ttl: 300_000 });

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
    const loginToken = req.user.loginToken;

    const cachedUser = authCache.get(loginToken);
    if (cachedUser) {
      req.user.db = cachedUser;
      return next();
    }

    const cacheKey = `session:${loginToken}`;
    const redisCached = await redisClient.get(cacheKey);
    if (redisCached) {
      const parsed = JSON.parse(redisCached);
      if (parsed._id) parsed._id = new mongoose.Types.ObjectId(parsed._id);
      authCache.set(loginToken, parsed);
      req.user.db = parsed;
      return next();
    }

    const UserDbData = await User.findOne({ loginToken }).lean();
    if (!UserDbData) {
      return res.status(401).json({ status: false, msg: "Session expired", redirect: "/logout" });
    }

    authCache.set(loginToken, UserDbData);
    await redisClient.setEx(cacheKey, 900, JSON.stringify(UserDbData));
    req.user.db = UserDbData;
    return next();
  } catch (err) {
    logger.error({ err }, "Auth cache error");
    const UserDbData = await User.findOne({ loginToken: req.user.loginToken }).lean();
    if (!UserDbData) {
      return res.status(401).json({ status: false, msg: "Session expired", redirect: "/logout" });
    }
    req.user.db = UserDbData;
    return next();
  }
};

async function clearAuthCache(loginToken) {
  if (!loginToken) return;
  authCache.delete(loginToken);
  await redisClient.del(`session:${loginToken}`).catch(() => {});
}

module.exports = { authValid, authValidWithDb, clearAuthCache };
