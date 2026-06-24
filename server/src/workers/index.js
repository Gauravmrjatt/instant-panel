const { startClickWorker, flushClicks, getClickFlushTimer, getClickBuffer } = require("./click.worker");
const { startLeadWorker, flushLeads, getLeadFlushTimer, getLeadBuffer } = require("./lead.worker");

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
  }
}

async function flushAll() {
  await Promise.all([flushClicks(), flushLeads()]);
}

function getWorkerTimers() {
  return [getClickFlushTimer(), getLeadFlushTimer()].filter(Boolean);
}

module.exports = { startWorkers, flushAll, getWorkerTimers, getClickBuffer, getLeadBuffer };