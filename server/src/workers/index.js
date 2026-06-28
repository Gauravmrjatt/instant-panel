const { startClickWorker, stopClickWorker, flushClicks, getClickFlushTimer, getClickBuffer } = require("./click.worker");
const { startLeadWorker, stopLeadWorker, flushLeads, getLeadFlushTimer, getLeadBuffer } = require("./lead.worker");
const { startPostbackWorker } = require("./postback.worker");
const logger = require("../../lib/logger");

async function startWorkers() {
  if (process.env.NODE_ENV !== "test") {
    try {
      await startClickWorker();
      logger.info("Workers >> Click worker started");
    } catch (err) {
      logger.error({ err: err.message }, "Workers >> Click worker failed");
    }

    try {
      require("./payment.worker");
    } catch (err) {
      logger.error({ err: err.message }, "Workers >> Payment worker failed");
    }

    try {
      await startLeadWorker();
      logger.info("Workers >> Lead worker started");
    } catch (err) {
      logger.error({ err: err.message }, "Workers >> Lead worker failed");
    }

    try {
      await startPostbackWorker();
      logger.info("Workers >> Postback worker started");
    } catch (err) {
      logger.error({ err: err.message }, "Workers >> Postback worker failed");
    }
  }
}

async function stopWorkers() {
  await Promise.all([stopClickWorker(), stopLeadWorker()]);
}

module.exports = { startWorkers, stopWorkers, getClickBuffer, getLeadBuffer };