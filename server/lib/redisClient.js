const redis = require("redis");

// Create a Redis client with a connection URL
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379", // Use REDIS_URL from env or default
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Too many retries to connect to Redis");
        return new Error("Retry limit reached");
      }
      return Math.min(retries * 100, 3000); // Delay before retrying
    },
    timeout: 5000, // Socket timeout
  },
});

// Event listeners for connection handling
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

redisClient.on("end", () => {
  console.warn("Redis connection closed");
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
  try {
    await redisClient.quit();
    console.log("Redis client gracefully disconnected");
    process.exit(0);
  } catch (err) {
    console.error("Error during Redis disconnection:", err);
    process.exit(1);
  }
});

// Connect to the Redis server
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

module.exports = redisClient;
