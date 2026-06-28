const cluster = require("cluster");
const http = require("http");
const os = require("os");
const path = require("path");
const { fork } = require("child_process");
const mongoose = require("mongoose");
require("dotenv").config();
const logger = require("./lib/logger");

const NUM_HTTP_WORKERS = parseInt(process.env.CLUSTER_WORKERS, 10) || Math.max(1, os.availableParallelism() - 3);
const BG_WORKER_TYPES = ["click", "postback", "postback", "postback", "postback", "postback", "postback", "postback", "postback", "lead-payment", "payment", "payment"];
const METRICS_PORT = parseInt(process.env.METRICS_PORT, 10) || 9092;

if (cluster.isPrimary) {
  const bgWorkers = [];
  let shuttingDown = false;
  logger.info({ pid: process.pid, httpWorkers: NUM_HTTP_WORKERS, bgWorkers: BG_WORKER_TYPES }, "Primary started");

  for (let i = 0; i < NUM_HTTP_WORKERS; i++) cluster.fork();

  cluster.on("exit", (worker) => {
    if (shuttingDown) return;
    logger.warn({ pid: worker.process.pid }, "HTTP worker died — restarting");
    cluster.fork();
  });

  for (const type of BG_WORKER_TYPES) {
    const child = fork(path.join(__dirname, "worker.js"), [type], {
      env: { ...process.env, WORKER_TYPE: type },
      stdio: "inherit",
    });
    child.on("exit", (code, signal) => {
      if (shuttingDown) return;
      logger.warn({ workerType: type, signal, code }, "Background worker died — restarting");
      const newChild = fork(path.join(__dirname, "worker.js"), [type], {
        env: { ...process.env, WORKER_TYPE: type },
        stdio: "inherit",
      });
      const idx = bgWorkers.indexOf(child);
      if (idx !== -1) bgWorkers[idx] = newChild;
    });
    bgWorkers.push(child);
  }

  const promClient = require("prom-client");
  const aggregatorRegistry = new promClient.AggregatorRegistry();
  http.createServer(async (req, res) => {
    if (req.url === "/metrics") {
      try {
        const metrics = await Promise.race([
          aggregatorRegistry.clusterMetrics(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Cluster metrics timeout")), 5000)),
        ]);
        res.setHeader("Content-Type", aggregatorRegistry.contentType);
        res.end(metrics);
      } catch (err) {
        logger.warn({ err: err.message }, "Primary metrics aggregation — timeout, falling back to per-worker scrape");
        res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
        res.end("# Primary cluster metrics aggregation timed out after 5s.\n# Scrape individual HTTP workers at /metrics for per-instance data.\n# Or configure Prometheus to scrape all cluster workers individually.\n");
      }
    } else {
      res.statusCode = 404;
      res.end();
    }
  }).listen(METRICS_PORT, () => {
    logger.info({ port: METRICS_PORT }, "Primary metrics server listening");
  });

  async function shutdown() {
    shuttingDown = true;
    logger.info("Primary >> Shutting down all workers...");
    for (const w of bgWorkers) try { w.kill(); } catch {}
    for (const id in cluster.workers) try { cluster.workers[id].kill(); } catch {}
    setTimeout(() => process.exit(0), 3000).unref();
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} else {
  const app = require("./app");
  const { closeConnection, assertQueues } = require("./lib/rabbitMQ");

  const PORT = process.env.PORT || 5000;
  let server;

  mongoose
    .connect(process.env.DB_URL, {
      maxPoolSize: Math.ceil(200 / NUM_HTTP_WORKERS),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(async () => {
      if (process.env.NODE_ENV !== "test") logger.info({ pid: process.pid }, "HTTP Worker — DB connected");
      try {
        const { connectToRabbitMQ } = require("./lib/rabbitMQ");
        await connectToRabbitMQ();
        await assertQueues();
      } catch (err) {
        logger.error({ pid: process.pid, err: err.message }, "HTTP Worker — RMQ not available");
      }
      server = app.listen(PORT, () => {
        if (process.env.NODE_ENV !== "test") logger.info({ pid: process.pid, port: PORT }, "HTTP Worker — Express listening");
      });
    })
    .catch((err) => logger.error({ pid: process.pid, err }, "HTTP Worker — DB connection error"));

  async function shutdown() {
    if (server) server.close(() => {});
    try { await closeConnection(); } catch {}
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("unhandledRejection", (reason) => {
    logger.error({ pid: process.pid, reason }, "Unhandled Rejection");
  });
}
