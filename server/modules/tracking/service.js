const Campaign = require("../campaigns/model");
const Click = require("../clicks/model");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const redisClient = require("../../lib/redisClient");
const { LRUCache } = require("lru-cache");
const logger = require("../../lib/logger");

const generateUUID = () => uuidv4().replace(/-/g, "");

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

// ── In-process batch click buffer ──────────────────────────
const clickBuffer = [];
const BATCH_MAX = 2000;
const BATCH_INTERVAL = 500;
let flushTimer = null;

function flushClicks() {
  const batch = clickBuffer.splice(0);
  if (batch.length === 0) return;
  Click.insertMany(batch, { ordered: false }).catch((err) => {
    logger.error({ err, count: batch.length }, "Failed to flush click batch — falling back to individual inserts");
    batch.forEach((doc) => Click.create(doc).catch((e) => logger.error({ err: e, click: doc.click }, "Failed to save click")));
  });
}

function bufferClick(clickDoc) {
  clickBuffer.push(clickDoc);
  if (clickBuffer.length >= BATCH_MAX) {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = null;
    flushClicks();
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushClicks();
    }, BATCH_INTERVAL);
  }
}

// Flush remaining on shutdown
process.on("beforeExit", () => { if (flushTimer) clearTimeout(flushTimer); flushClicks(); });
// ──────────────────────────────────────────────────────────

async function processClick(campInfo, aff_click_id, sub_aff_id, userIp, deviceQuery, req) {
  const click = generateUUID();
  const ip = userIp || requestIp.getClientIp(req);

  const clickDoc = {
    userId: campInfo.userId, campId: campInfo._id, click, user: aff_click_id.trim().toLowerCase(),
    refer: sub_aff_id.trim().toLowerCase(), ip, device: {}, number: req.query.number, params: req.query,
  };

  bufferClick(clickDoc);

  return click;
}

function clearCampaignCache(campId) {
  campaignCache.delete(campId);
}

module.exports = { getCampaign, processClick, clearCampaignCache };
