const { connectToRabbitMQ, createQueue, consumeMessages, channelEmitter } = require("../../lib/rabbitMQ");
const service = require("../../modules/postback/service");
const logger = require("../../lib/logger");

const QUEUE = "postback_processing";
let started = false;

const campCache = new Map();
const CAMP_CACHE_TTL = 60_000;

function getCachedCampaign(token) {
  const entry = campCache.get(token);
  if (entry && Date.now() - entry.ts < CAMP_CACHE_TTL) return entry.data;
  campCache.delete(token);
  return null;
}

function setCachedCampaign(token, data) {
  campCache.set(token, { data, ts: Date.now() });
  if (campCache.size > 5000) {
    const oldest = [...campCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) campCache.delete(oldest[0]);
  }
}

async function startPostbackWorker() {
  if (started) return;
  started = true;
  await connectToRabbitMQ();
  await createQueue(QUEUE);
  await consumeMessages(QUEUE, async (taskString) => {
    const task = JSON.parse(taskString);
    const { type } = task;

    if (type === "global") {
      const user = await service.resolvePostbackUser(task.PostbackToken);
      if (!user) return;
      const clickDoc = await service.resolvePostbackClick(task.click, user._id);
      if (!clickDoc) return;
      const result = await service.processPostback({ user, clickDoc, event: task.event, ip: task.ip, query: task.query });
      logger.info({ result, click: task.click }, "PostbackWorker >> Process result");
      return;
    }

    if (type === "campaign") {
      const t0 = Date.now();
      let cached = getCachedCampaign(task.CampaignToken);
      let camp = cached?.camp || null;
      let user = cached?.user || null;

      if (!camp) {
        const resolved = await service.resolveCampaignPostback(task.CampaignToken);
        camp = resolved?.camp || null;
        user = resolved?.user || null;
        if (camp) setCachedCampaign(task.CampaignToken, { camp, user });
      }
      const t1 = Date.now();

      if (!camp || !user) {
        logger.warn({ CampaignToken: task.CampaignToken, click: task.click }, "PostbackWorker >> Campaign not found, acking");
        return;
      }
      const clickDoc = await service.resolvePostbackClick(task.click, user._id);
      if (!clickDoc) {
        logger.warn({ click: task.click, userId: user._id }, "PostbackWorker >> Click not found, acking");
        return;
      }
      const campId = camp._id?.toString?.() || camp._id;
      const clickCampId = clickDoc.campId._id?.toString?.() || clickDoc.campId._id;
      if (clickCampId !== campId) {
        logger.warn({ click: task.click, CampaignToken: task.CampaignToken, clickCampId, campId }, "PostbackWorker >> Click not from this campaign, acking");
        return;
      }
      const t2 = Date.now();
      const result = await service.processPostback({ user, clickDoc, event: task.event, ip: task.ip, query: task.query });
      const t3 = Date.now();
      logger.info({ result, click: task.click, campMs: t1 - t0, clickMs: t2 - t1, procMs: t3 - t2, totalMs: t3 - t0 }, "PostbackWorker >> Process result");
      return;
    }

    logger.warn({ type }, "PostbackWorker >> Unknown message type");
  });

  logger.info("PostbackWorker >> Started");
}

module.exports = { startPostbackWorker };
