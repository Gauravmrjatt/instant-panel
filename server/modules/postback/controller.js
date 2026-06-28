const service = require("./service");
const { sendToQueue } = require("../../lib/rabbitMQ");
const redisClient = require("../../lib/redisClient");
const logger = require("../../lib/logger");

async function getConfig(req, res) {
  try {
    const result = await service.getPostbackConfig(req.user.db, req.protocol, req.get("host"));
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, "getConfig error");
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function toggleGlobal(req, res) {
  try {
    const oldToken = req.user.db.PostbackToken;
    const result = await service.toggleGlobalPostback(req.user.loginToken);
    service.clearUserCache(oldToken);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Error in updating postback key" });
  }
}

async function regenerateToken(req, res) {
  try {
    const oldToken = req.user.db.PostbackToken;
    const result = await service.regeneratePostbackToken(req.user.db._id);
    service.clearUserCache(oldToken);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Error while updating key" });
  }
}

async function handleGlobalPostback(req, res) {
  try {
    const PostbackToken = req.params.token || req.params.PostbackToken;
    const { event } = req.params;
    const { click } = req.query;
    const ip = req.ip;

    if (!PostbackToken || !click) return res.json({ status: false, msg: "PostbackToken and click are required" });
    if (!event) return res.json({ status: false, msg: "Event is required" });

    publishToQueue("global", { PostbackToken, event, click, ip, query: req.query });
    return res.status(202).json({ status: true, msg: "Postback accepted for processing" });
  } catch (error) {
    logger.error({ err: error }, "handleGlobalPostback error");
    res.json({ status: false, msg: "Something went wrong", err: error });
  }
}

async function handleCampaignPostback(req, res) {
  try {
    const CampaignToken = req.params.campaignId || req.params.CampaignToken;
    const { event } = req.params;
    const { click } = req.query;
    const ip = req.ip;

    if (!CampaignToken || !click) return res.json({ status: false, msg: "CampaignToken and click are required" });
    if (!event) return res.json({ status: false, msg: "Event is required" });

    publishToQueue("campaign", { CampaignToken, event, click, ip, query: req.query });
    return res.status(202).json({ status: true, msg: "Postback accepted for processing" });
  } catch (error) {
    logger.error({ err: error }, "handleCampaignPostback error");
    res.json({ status: false, msg: "Something went wrong", err: error });
  }
}

function publishToQueue(type, payload) {
  const message = JSON.stringify({ type, ...payload });
  try {
    sendToQueue("postback_processing", message);
  } catch (err) {
    logger.warn({ err: err.message, type, click: payload.click }, "RMQ unavailable — falling back to sync processing");
    processPostbackSync(type, payload).catch(e => logger.error({ err: e }, "sync postback fallback error"));
  }
}

async function processPostbackSync(type, payload) {
  const t0 = Date.now();
  if (type === "global") {
    const user = await service.resolvePostbackUser(payload.PostbackToken);
    if (!user) return;
    const clickDoc = await service.resolvePostbackClick(payload.click, user._id);
    if (!clickDoc) return;
    const result = await service.processPostback({ user, clickDoc, event: payload.event, ip: payload.ip, query: payload.query });
    logger.warn({ click: payload.click, type, ms: Date.now() - t0 }, "Sync fallback — global postback completed");
    return;
  } else if (type === "campaign") {
    const { camp, user } = await service.resolveCampaignPostback(payload.CampaignToken);
    if (!camp || !user) return;
    const clickDoc = await service.resolvePostbackClick(payload.click, user._id);
    if (!clickDoc) return;
    const campId = camp._id?.toString?.() || camp._id;
    const clickCampId = clickDoc.campId._id?.toString?.() || clickDoc.campId._id;
    if (clickCampId !== campId) return;
    const result = await service.processPostback({ user, clickDoc, event: payload.event, ip: payload.ip, query: payload.query });
    logger.warn({ click: payload.click, type, ms: Date.now() - t0 }, "Sync fallback — campaign postback completed");
    return;
  }
}

module.exports = { getConfig, toggleGlobal, regenerateToken, handleGlobalPostback, handleCampaignPostback };
