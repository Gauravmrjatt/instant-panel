const Campaign = require("../campaigns/model");
const Click = require("../clicks/model");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const DeviceDetector = require("node-device-detector");
const redisClient = require("../../lib/redisClient");
const { sendToQueue } = require("../../lib/rabbitMQ");
const { LRUCache } = require("lru-cache");
const logger = require("../../lib/logger");

const detector = new DeviceDetector({ clientIndexes: true, deviceIndexes: true, deviceAliasCode: false });
const generateUUID = () => uuidv4().replace(/-/g, "");

const deviceCache = new LRUCache({ max: 5000 });

function detectDevice(ua) {
  if (!ua) return { status: false, msg: "No device info provided" };
  const cached = deviceCache.get(ua);
  if (cached) return cached;
  const result = detector.detect(ua);
  deviceCache.set(ua, result);
  return result;
}

const campaignCache = new LRUCache({ max: 500, ttl: 60_000 });

async function getCampaign(campId) {
  const local = campaignCache.get(campId);
  if (local) return local;

  try {
    const cached = await redisClient.get(`campaign:${campId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      campaignCache.set(campId, parsed);
      return parsed;
    }
  } catch {
    logger.warn("Redis unavailable — falling back to MongoDB for campaign lookup");
  }

  const campInfo = await Campaign.findOne({ _id: campId }).select("userId tracking").exec();
  if (campInfo) {
    const obj = campInfo.toObject();
    campaignCache.set(campId, obj);
    try {
      await redisClient.setEx(`campaign:${campId}`, 3600, JSON.stringify(obj));
    } catch {
      logger.warn("Redis unavailable — skipping campaign cache set");
    }
  }
  return campInfo;
}

async function processClick(campInfo, aff_click_id, sub_aff_id, userIp, deviceQuery, req) {
  const click = generateUUID();
  const ip = userIp || requestIp.getClientIp(req);
  const device = detectDevice(deviceQuery);

  const clickDoc = {
    userId: campInfo.userId, campId: campInfo._id, click, user: aff_click_id.trim().toLowerCase(),
    refer: sub_aff_id.trim().toLowerCase(), ip, device, number: req.query.number, params: req.query,
  };

  try {
    sendToQueue("click_buffer", JSON.stringify(clickDoc));
  } catch (err) {
    logger.warn("RabbitMQ unavailable — saving click directly to DB");
    await Click.create(clickDoc);
  }

  return click;
}

function clearCampaignCache(campId) {
  campaignCache.delete(campId);
}

module.exports = { getCampaign, processClick, clearCampaignCache };
