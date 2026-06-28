const { connectToRabbitMQ, createQueue, getChannel, channelEmitter } = require("../../lib/rabbitMQ");
const Lead = require("../../modules/leads/model");
const redisClient = require("../../lib/redisClient");
const logger = require("../../lib/logger");

const QUEUE = "lead_write";
const BATCH_SIZE = 200;
const FLUSH_INTERVAL = 200;

let buffer = [];
let flushTimer = null;
let consumerActive = false;
let channel = null;
let consumerTag = null;

async function flushLeads() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  const messages = batch.map((b) => b.msg);
  const leadDocs = batch.map((b) => b.data);
  try {
    await Lead.insertMany(leadDocs, { ordered: false });
    const userIds = [...new Set(leadDocs.map(l => l.userId?.toString()).filter(Boolean))];
    await Promise.all(userIds.map(id => redisClient.del(`dashboard:${id}`).catch(() => {})));
    messages.forEach((msg) => channel.ack(msg));
    logger.info({ count: batch.length }, "LeadWorker >> Flushed leads");
  } catch (err) {
    if (err.code === 11000) {
      messages.forEach((msg) => channel.ack(msg));
      logger.info({ count: batch.length, duplicates: err.writeErrors?.length || 0 }, "LeadWorker >> Flushed leads (duplicates skipped)");
    } else {
      messages.forEach((msg) => channel.nack(msg, false, true));
    }
  }
}

async function setupConsumer() {
  if (consumerActive) return;
  channel = await getChannel();
  await channel.prefetch(BATCH_SIZE);
  const handler = async (msg) => {
    if (!msg) return;
    try {
      const leadData = JSON.parse(msg.content.toString());
      buffer.push({ data: leadData, msg });
      if (buffer.length >= BATCH_SIZE) {
        await flushLeads();
      }
    } catch (err) {
      logger.error({ err: err.message }, "LeadWorker >> Parse error");
      channel.nack(msg, false, true);
    }
  };
  const result = await channel.consume(QUEUE, handler, { noAck: false });
  consumerTag = result.consumerTag;
  consumerActive = true;
  logger.info("LeadWorker >> Consumer registered");
}

async function startLeadWorker() {
  await connectToRabbitMQ();
  await createQueue(QUEUE);

  flushTimer = setInterval(flushLeads, FLUSH_INTERVAL);
  await setupConsumer();

  channelEmitter.on("reconnected", async () => {
    consumerActive = false;
    try { await setupConsumer(); } catch (err) {
      logger.error({ err: err.message }, "LeadWorker >> Failed to re-setup consumer on reconnect");
    }
  });

  logger.info("LeadWorker >> Started");
}

async function stopLeadWorker() {
  clearInterval(flushTimer);
  flushTimer = null;
  if (consumerTag && channel) {
    try { await channel.cancel(consumerTag); } catch {}
    consumerTag = null;
  }
  await flushLeads();
  consumerActive = false;
}

module.exports = { startLeadWorker, stopLeadWorker, flushLeads, getLeadBuffer: () => buffer, getLeadFlushTimer: () => flushTimer };