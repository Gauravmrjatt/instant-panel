const cluster = require("cluster");
const os = require("os");
const mongoose = require("mongoose");
require("dotenv").config();

const NUM_WORKERS = parseInt(process.env.CLUSTER_WORKERS, 10) || os.availableParallelism();

if (cluster.isPrimary) {
  console.log(`👑 Primary ${process.pid} forking ${NUM_WORKERS} workers`);

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.warn(`💀 Worker ${worker.process.pid} died (${signal || code}) — restarting`);
    cluster.fork();
  });

  process.on("SIGINT", () => { for (const id in cluster.workers) cluster.workers[id].kill(); process.exit(0); });
  process.on("SIGTERM", () => { for (const id in cluster.workers) cluster.workers[id].kill(); process.exit(0); });

} else {
  const app = require("./app");
  const { startWorkers, stopWorkers } = require("./src/workers");
  const { closeConnection } = require("./lib/rabbitMQ");

  const PORT = process.env.PORT || 5000;
  let server;

  mongoose
    .connect(process.env.DB_URL, {
      maxPoolSize: Math.ceil(50 / NUM_WORKERS),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      if (process.env.NODE_ENV !== "test") console.log(`✅ Worker ${process.pid} — DB Connected`);
      server = app.listen(PORT, () => {
        if (process.env.NODE_ENV !== "test") console.log(`🚀 Worker ${process.pid} — Express on http://localhost:${PORT}`);
      });
      startWorkers();
    })
    .catch((err) => console.log(`❌ Worker ${process.pid} — DB Error`, err));

  async function shutdown(signal) {
    if (server) server.close(() => {});
    await stopWorkers();
    try { await closeConnection(); } catch {}
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error(`Unhandled Rejection [${process.pid}]:`, reason);
  });
}
