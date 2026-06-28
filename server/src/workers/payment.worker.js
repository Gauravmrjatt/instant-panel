const {
  createQueue,
  consumeMessages,
} = require("../../lib/rabbitMQ");
const handlePayment = require("../../lib/handlePostBackPayments");
const { incrementCapCounters } = require("../../modules/postback/service");
const Lead = require("../../modules/leads/model");
const logger = require("../../lib/logger");

const QUEUE_NAME = "payment_processing";

async function startPaymentWorker() {
  try {
    await createQueue(QUEUE_NAME);
    await consumeMessages(QUEUE_NAME, async (taskString) => {
      const task = JSON.parse(taskString);
      if (task.type !== "postback_payment") return;

      const { userId, eventData, lead, tg, camp, dailyApprovedLeads, totalApprovedLeads, clicktoconv } = task;

      try {
        await handlePayment(userId, eventData, lead, tg, camp, dailyApprovedLeads, totalApprovedLeads, clicktoconv);
      } catch (err) {
        if (err.code === 11000) {
          logger.warn({ clickId: lead.clickId, event: lead.event }, "PaymentWorker >> Duplicate key — already processed, acking");
          return;
        }
        throw err;
      }

      await incrementCapCounters(camp._id || camp._id, lead.event);

      logger.info({ click: lead.click, event: lead.event }, "PaymentWorker >> Processed postback payment");
    });
    logger.info("PaymentWorker >> Started");
  } catch (error) {
    logger.error({ err: error }, "PaymentWorker >> Failed to start");
  }
}

module.exports = { startPaymentWorker };
