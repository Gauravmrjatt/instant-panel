const { connectToRabbitMQ, createQueue, getChannel, channelEmitter } = require("../../lib/rabbitMQ");
const service = require("../../modules/postback/service");

const QUEUE = "postback_processing";
let consumerActive = false;

async function setupConsumer() {
  if (consumerActive) return;
  const channel = await getChannel();
  await channel.prefetch(50);
  const handler = async (msg) => {
    if (!msg) return;
    try {
      const task = JSON.parse(msg.content.toString());
      const { type } = task;

      if (type === "global") {
        const user = await service.resolvePostbackUser(task.PostbackToken);
        if (!user) {
          channel.ack(msg);
          return;
        }
        const clickDoc = await service.resolvePostbackClick(task.click, user._id);
        if (!clickDoc) {
          channel.ack(msg);
          return;
        }
        await service.processPostback({ user, clickDoc, event: task.event, ip: task.ip, query: task.query });
      } else if (type === "campaign") {
        const { camp, user } = await service.resolveCampaignPostback(task.CampaignToken);
        if (!camp || !user) {
          channel.ack(msg);
          return;
        }
        const clickDoc = await service.resolvePostbackClick(task.click, user._id);
        if (!clickDoc) {
          channel.ack(msg);
          return;
        }
        if (clickDoc.campId.postbackToken !== task.CampaignToken) {
          channel.ack(msg);
          return;
        }
        await service.processPostback({ user, clickDoc, event: task.event, ip: task.ip, query: task.query });
      }

      channel.ack(msg);
    } catch (err) {
      console.error("PostbackWorker >> Processing error:", err.message);
      channel.nack(msg, false, true);
    }
  };
  await channel.consume(QUEUE, handler, { noAck: false });
  consumerActive = true;
  console.log("PostbackWorker >> Consumer registered");
}

async function startPostbackWorker() {
  await connectToRabbitMQ();
  await createQueue(QUEUE);
  await setupConsumer();

  channelEmitter.on("reconnected", async () => {
    consumerActive = false;
    await setupConsumer();
  });

  console.log("PostbackWorker >> Started");
}

module.exports = { startPostbackWorker };
