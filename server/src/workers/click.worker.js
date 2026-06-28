const { connectToRabbitMQ, createQueue, getChannel, channelEmitter } = require("../../lib/rabbitMQ");
const Click = require("../../modules/clicks/model");
const logger = require("../../lib/logger");

const QUEUE = "click_buffer";
const BATCH_SIZE = 1000;
const FLUSH_INTERVAL = 200;

let buffer = [];
let flushTimer = null;
let consumerActive = false;
let channel = null;
let consumerTag = null;

async function flushClicks() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  const messages = batch.map((b) => b.msg);
  const clickDocs = batch.map((b) => b.data);
  try {
    await Click.insertMany(clickDocs, { ordered: false });
    messages.forEach((msg) => channel.ack(msg));
    logger.info({ count: batch.length }, "ClickWorker >> Flushed clicks");
  } catch (err) {
    if (err.code === 11000) {
      messages.forEach((msg) => channel.ack(msg));
      logger.info({ count: batch.length, duplicates: err.writeErrors?.length || 0 }, "ClickWorker >> Flushed clicks (duplicates skipped)");
    } else {
      messages.forEach((msg) => channel.nack(msg, false, true));
      logger.error({ err: err.message }, "ClickWorker >> Insert error");
    }
  }
}

async function setupConsumer() {
  if (consumerActive) return;
  channel = await getChannel();
  await channel.prefetch(BATCH_SIZE * 8);
  const handler = async (msg) => {
    if (!msg) return;
    try {
      const clickData = JSON.parse(msg.content.toString());
      buffer.push({ data: clickData, msg });
      if (buffer.length >= BATCH_SIZE) {
        await flushClicks();
      }
    } catch (err) {
      logger.error({ err: err.message }, "ClickWorker >> Parse error");
      channel.nack(msg, false, true);
    }
  };
  const result = await channel.consume(QUEUE, handler, { noAck: false });
  consumerTag = result.consumerTag;
  consumerActive = true;
  logger.info("ClickWorker >> Consumer registered");
}

async function startClickWorker() {
  await connectToRabbitMQ();
  await createQueue(QUEUE);

  flushTimer = setInterval(flushClicks, FLUSH_INTERVAL);
  await setupConsumer();

  channelEmitter.on("reconnected", async () => {
    consumerActive = false;
    try { await setupConsumer(); } catch (err) {
      logger.error({ err: err.message }, "ClickWorker >> Failed to re-setup consumer on reconnect");
    }
  });

  logger.info("ClickWorker >> Started");
}

async function stopClickWorker() {
  clearInterval(flushTimer);
  flushTimer = null;
  if (consumerTag && channel) {
    try { await channel.cancel(consumerTag); } catch {}
    consumerTag = null;
  }
  await flushClicks();
  consumerActive = false;
}

module.exports = { startClickWorker, stopClickWorker, flushClicks, getClickBuffer: () => buffer, getClickFlushTimer: () => flushTimer };