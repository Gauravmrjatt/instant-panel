const redis = require("redis");

// Create a Redis client with optimized settings
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1", // Default host for development
    port: process.env.REDIS_PORT || 6379, // Default port for Redis
    reconnectStrategy: (retries) => {
      // Reconnect after an increasing delay with a max of 3 seconds
      if (retries > 10) {
        console.error("Too many retries to connect to Redis");
        return new Error("Retry limit reached");
      }
      return Math.min(retries * 100, 3000); // Delay before retrying
    },
    timeout: 5000, // Socket timeout to prevent indefinite hanging
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
    await redisClient.quit(); // Quit the Redis client properly
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
