const { connectToRabbitMQ, createQueue, getChannel, channelEmitter } = require("../../lib/rabbitMQ");
const Click = require("../../modules/clicks/model");

const QUEUE = "click_buffer";
const BATCH_SIZE = 500;
const FLUSH_INTERVAL = 100;

let buffer = [];
let flushTimer = null;
let consumerActive = false;

async function flushClicks() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  try {
    await Click.insertMany(batch, { ordered: false });
    console.log(`ClickWorker >> Flushed ${batch.length} clicks`);
  } catch (err) {
    console.error("ClickWorker >> Insert error:", err.message);
  }
}

async function setupConsumer() {
  if (consumerActive) return;
  const channel = await getChannel();
  await channel.prefetch(BATCH_SIZE);
  const handler = async (msg) => {
    if (!msg) return;
    try {
      const clickData = JSON.parse(msg.content.toString());
      buffer.push(clickData);
      channel.ack(msg);
      if (buffer.length >= BATCH_SIZE) {
        await flushClicks();
      }
    } catch (err) {
      console.error("ClickWorker >> Parse error:", err.message);
      channel.nack(msg, false, true);
    }
  };
  await channel.consume(QUEUE, handler, { noAck: false });
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

module.exports = { startClickWorker, flushClicks, getClickBuffer: () => buffer, getClickFlushTimer: () => flushTimer };