const { startClickWorker, stopClickWorker, flushClicks, getClickFlushTimer, getClickBuffer } = require("./click.worker");
const { startLeadWorker, stopLeadWorker, flushLeads, getLeadFlushTimer, getLeadBuffer } = require("./lead.worker");
const { startPostbackWorker } = require("./postback.worker");

async function startWorkers() {
  if (process.env.NODE_ENV !== "test") {
    try {
      await startClickWorker();
      console.log("Workers >> Click worker started");
    } catch (err) {
      console.error("Workers >> Click worker failed:", err.message);
    }

    try {
      require("./payment.worker");
    } catch (err) {
      console.error("Workers >> Payment worker failed:", err.message);
    }

    try {
      await startLeadWorker();
      console.log("Workers >> Lead worker started");
    } catch (err) {
      console.error("Workers >> Lead worker failed:", err.message);
    }

    try {
      await startPostbackWorker();
      console.log("Workers >> Postback worker started");
    } catch (err) {
      console.error("Workers >> Postback worker failed:", err.message);
    }
  }
}

async function stopWorkers() {
  await Promise.all([stopClickWorker(), stopLeadWorker()]);
}

module.exports = { startWorkers, stopWorkers, getClickBuffer, getLeadBuffer };