const { connectToRabbitMQ, createQueue, getChannel, channelEmitter } = require("../../lib/rabbitMQ");
const Click = require("../../modules/clicks/model");

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
    console.log(`ClickWorker >> Flushed ${batch.length} clicks`);
  } catch (err) {
    if (err.code === 11000) {
      messages.forEach((msg) => channel.ack(msg));
      console.log(`ClickWorker >> Flushed ${batch.length} clicks (${err.writeErrors?.length || 0} duplicates skipped)`);
    } else {
      messages.forEach((msg) => channel.nack(msg, false, true));
      console.error("ClickWorker >> Insert error:", err.message);
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
      console.error("ClickWorker >> Parse error:", err.message);
      channel.nack(msg, false, true);
    }
  };
  const result = await channel.consume(QUEUE, handler, { noAck: false });
  consumerTag = result.consumerTag;
  consumerActive = true;
  console.log("ClickWorker >> Consumer registered");
}

async function startClickWorker() {
  await connectToRabbitMQ();
  await createQueue(QUEUE);

  flushTimer = setInterval(flushClicks, FLUSH_INTERVAL);
  await setupConsumer();

  channelEmitter.on("reconnected", async () => {
    consumerActive = false;
    await setupConsumer();
  });

  console.log("ClickWorker >> Started (buffer: 500/100ms)");
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