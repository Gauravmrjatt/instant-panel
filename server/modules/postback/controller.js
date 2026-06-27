const service = require("./service");
const { sendToQueue } = require("../../lib/rabbitMQ");
const redisClient = require("../../lib/redisClient");

async function getConfig(req, res) {
  try {
    const result = await service.getPostbackConfig(req.user.db, req.protocol, req.get("host"));
    res.json(result);
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", err: error });
  }
}

function publishToQueue(type, payload) {
  const message = JSON.stringify({ type, ...payload });
  try {
    sendToQueue("postback_processing", message);
  } catch (err) {
    console.error("postback queue unavailable, falling back to sync processing:", err.message);
    processPostbackSync(type, payload).catch(e => console.error("sync postback fallback error:", e));
  }
}

async function processPostbackSync(type, payload) {
  if (type === "global") {
    const user = await service.resolvePostbackUser(payload.PostbackToken);
    if (!user) return;
    const clickDoc = await service.resolvePostbackClick(payload.click, user._id);
    if (!clickDoc) return;
    await service.processPostback({ user, clickDoc, event: payload.event, ip: payload.ip, query: payload.query });
  } else if (type === "campaign") {
    const { camp, user } = await service.resolveCampaignPostback(payload.CampaignToken);
    if (!camp || !user) return;
    const clickDoc = await service.resolvePostbackClick(payload.click, user._id);
    if (!clickDoc) return;
    if (clickDoc.campId.postbackToken !== payload.CampaignToken) return;
    await service.processPostback({ user, clickDoc, event: payload.event, ip: payload.ip, query: payload.query });
  }
}

module.exports = { getConfig, toggleGlobal, regenerateToken, handleGlobalPostback, handleCampaignPostback };
