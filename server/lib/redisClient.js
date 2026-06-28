const redis = require("redis");
const logger = require("./logger");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error("Too many retries to connect to Redis");
        return new Error("Retry limit reached");
      }
      return Math.min(retries * 100, 3000);
    },
    timeout: 5000,
  },
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

redisClient.on("error", (err) => {
  logger.error({ err }, "Redis client error");
});

redisClient.on("end", () => {
  logger.warn("Redis connection closed");
});

process.on("SIGINT", async () => {
  try { await redisClient.quit(); } catch {}
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error({ err }, "Failed to connect to Redis");
  }
})();

module.exports = redisClient;
