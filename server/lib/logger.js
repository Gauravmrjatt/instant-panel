const pino = require("pino");
const pinoLoki = require("pino-loki");

const transport = pinoLoki({
  host: process.env.LOKI_URL, // Loki endpoint
  basicAuth: null, // Add basic auth if needed
  labels: { app: "instant-panel" }, // Labels for logs
  json: true,
  interval: 5, // Batch interval in seconds
});

const logger = pino(transport);

module.exports = logger;
