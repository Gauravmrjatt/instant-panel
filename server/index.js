const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");
const { startWorkers, flushAll, getWorkerTimers } = require("./src/workers");
const { closeConnection } = require("./lib/rabbitMQ");

const PORT = process.env.PORT || 5000;

let server;

mongoose
  .connect(process.env.DB_URL, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ DB Connected..");
    server = app.listen(PORT, () => {
      console.log(`🚀 Express running on http://localhost:${PORT}`);
    });
    startWorkers();
  })
  .catch((err) => console.log("❌ DB Error", err));

async function shutdown(signal) {
  console.log(`\n${signal} received — starting graceful shutdown`);

  // 1. Stop accepting new requests
  if (server) {
    server.close(() => console.log("HTTP server closed"));
  }

  // 2. Clear flush timers and drain buffers
  getWorkerTimers().forEach((t) => clearInterval(t));
  await flushAll();
  console.log("Worker buffers flushed");

  // 3. Close RabbitMQ
  try {
    await closeConnection();
    console.log("RabbitMQ disconnected");
  } catch (err) {
    console.warn("RabbitMQ close error:", err.message);
  }

  // 4. Disconnect MongoDB
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (err) {
    console.warn("MongoDB disconnect error:", err.message);
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
