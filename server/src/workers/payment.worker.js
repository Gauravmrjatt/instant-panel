const mongoose = require("mongoose");
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

      if (task.lead) {
        if (typeof task.lead.userId === "string") task.lead.userId = new mongoose.Types.ObjectId(task.lead.userId);
        if (typeof task.lead.campId === "string") task.lead.campId = new mongoose.Types.ObjectId(task.lead.campId);
        if (typeof task.lead.clickId === "string") task.lead.clickId = new mongoose.Types.ObjectId(task.lead.clickId);
      }

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

      incrementCapCounters(camp._id || camp._id, lead.event).catch((e) =>
        logger.error({ err: e, click: lead.click, event: lead.event }, "PaymentWorker >> incrementCapCounters failed")
      );

      logger.info({ click: lead.click, event: lead.event }, "PaymentWorker >> Processed postback payment");
    });
    logger.info("PaymentWorker >> Started");
  } catch (error) {
    logger.error({ err: error }, "PaymentWorker >> Failed to start");
  }
}

module.exports = { startPaymentWorker };
