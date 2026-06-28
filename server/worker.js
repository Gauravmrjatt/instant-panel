const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const { connectToRabbitMQ, closeConnection } = require("./lib/rabbitMQ");
const logger = require("./lib/logger");

const WORKER_TYPE = process.env.WORKER_TYPE || process.argv[2];

if (!WORKER_TYPE) {
  logger.fatal("Usage: node worker.js <click|postback|lead-payment>");
  process.exit(1);
}

const POOL_SIZES = { click: 48, postback: 96, "lead-payment": 10, payment: 10 };
const poolSize = POOL_SIZES[WORKER_TYPE] || 5;

let cleanup;

async function main() {
  logger.info({ workerType: WORKER_TYPE, pid: process.pid, poolSize }, "Worker started");

  await mongoose.connect(process.env.DB_URL, {
    maxPoolSize: poolSize,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await connectToRabbitMQ();

  switch (WORKER_TYPE) {
    case "click": {
      const { startClickWorker, stopClickWorker } = require("./src/workers/click.worker");
      await startClickWorker();
      cleanup = async () => {
        await stopClickWorker();
        await closeConnection();
        await mongoose.disconnect();
      };
      break;
    }
    case "postback": {
      const { startPostbackWorker } = require("./src/workers/postback.worker");
      await startPostbackWorker();
      cleanup = async () => {
        await closeConnection();
        await mongoose.disconnect();
      };
      break;
    }
    case "lead-payment": {
      const { startLeadWorker, stopLeadWorker } = require("./src/workers/lead.worker");
      const { startPaymentWorker } = require("./src/workers/payment.worker");
      await startLeadWorker();
      startPaymentWorker();
      cleanup = async () => {
        await stopLeadWorker();
        await closeConnection();
        await mongoose.disconnect();
      };
      break;
    }
    case "payment": {
      const { startPaymentWorker } = require("./src/workers/payment.worker");
      startPaymentWorker();
      cleanup = async () => {
        await closeConnection();
        await mongoose.disconnect();
      };
      break;
    }
    default:
      logger.fatal({ workerType: WORKER_TYPE }, "Unknown worker type");
      process.exit(1);
  }

  logger.info({ workerType: WORKER_TYPE }, "Worker ready");
}

process.on("unhandledRejection", (reason) => {
  logger.error({ workerType: WORKER_TYPE, reason: reason?.message || reason }, "Unhandled rejection — not crashing");
});
process.on("uncaughtException", (err) => {
  logger.error({ workerType: WORKER_TYPE, err: err?.message }, "Uncaught exception — not crashing");
});

main().catch((err) => {
  logger.fatal({ workerType: WORKER_TYPE, err }, "Worker fatal error");
  process.exit(1);
});

async function shutdown() {
  logger.info({ workerType: WORKER_TYPE }, "Worker shutting down...");
  try { if (cleanup) await cleanup(); } catch {}
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
