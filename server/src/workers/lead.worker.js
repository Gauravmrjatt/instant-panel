const { connectToRabbitMQ, createQueue, getChannel, channelEmitter } = require("../../lib/rabbitMQ");
const Lead = require("../../modules/leads/model");
const redisClient = require("../../lib/redisClient");

const QUEUE = "lead_write";
const BATCH_SIZE = 200;
const FLUSH_INTERVAL = 200;

let buffer = [];
let flushTimer = null;
let consumerActive = false;

async function flushLeads() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  try {
    await Lead.insertMany(batch, { ordered: false });
    const userIds = [...new Set(batch.map(l => l.userId?.toString()).filter(Boolean))];
    await Promise.all(userIds.map(id => redisClient.del(`dashboard:${id}`).catch(() => {})));
    console.log(`LeadWorker >> Flushed ${batch.length} leads`);
  } catch (err) {
    console.error("LeadWorker >> Insert error:", err.message);
  }
}

async function setupConsumer() {
  if (consumerActive) return;
  const channel = await getChannel();
  await channel.prefetch(BATCH_SIZE);
  const handler = async (msg) => {
    if (!msg) return;
    try {
      const leadData = JSON.parse(msg.content.toString());
      buffer.push(leadData);
      channel.ack(msg);
      if (buffer.length >= BATCH_SIZE) {
        await flushLeads();
      }
    } catch (err) {
      console.error("LeadWorker >> Parse error:", err.message);
      channel.nack(msg, false, true);
    }
  };
  await channel.consume(QUEUE, handler, { noAck: false });
  consumerActive = true;
  console.log("LeadWorker >> Consumer registered");
}

async function startLeadWorker() {
  await connectToRabbitMQ();
  await createQueue(QUEUE);

  flushTimer = setInterval(flushLeads, FLUSH_INTERVAL);
  await setupConsumer();

  channelEmitter.on("reconnected", async () => {
    consumerActive = false;
    await setupConsumer();
  });

  console.log("LeadWorker >> Started (buffer: 200/200ms)");
}

module.exports = { startLeadWorker, flushLeads, getLeadBuffer: () => buffer, getLeadFlushTimer: () => flushTimer };