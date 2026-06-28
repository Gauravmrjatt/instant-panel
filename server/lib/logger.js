const pino = require("pino");

const isDev = process.env.NODE_ENV !== "production";
const level = process.env.LOG_LEVEL || (isDev ? "debug" : "info");

const logger = pino({
  level,
  ...(isDev && process.env.LOG_FORMAT !== "json" && {
    transport: { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
  }),
});

module.exports = logger;
