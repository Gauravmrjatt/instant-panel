const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const promClient = require("prom-client");
const responseTime = require("response-time");
const logger = require("./lib/logger");

const routes = require("./middlewares/routes");

const app = express();

app.set("trust proxy", 1);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let inFlight = 0;
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10) || 500;
app.use((req, res, next) => {
  if (inFlight > MAX_CONCURRENT) {
    return res.status(503).json({ status: false, msg: "Server busy, try again" });
  }
  inFlight++;
  res.on("finish", () => inFlight--);
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  exposedHeaders: ["Authorization"],
  allowedHeaders: ["Authorization", "Content-Type"],
}));

const collectDefaultMetrics = promClient.collectDefaultMetrics;

new promClient.AggregatorRegistry();

function normPath(p) {
  return p.replace(/\/[a-f0-9]{24}/g, '/:id').replace(/\/\d+/g, '/:id');
}

const reqResTime = new promClient.Histogram({
  name: "http_express_req_res_time",
  help: "HTTP express request-response time",
  labelNames: ["method", "path", "status_code"],
});

const totalRequests = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status_code"],
});

const activeConnections = new promClient.Gauge({
  name: "http_active_connections",
  help: "Number of active HTTP connections",
});

collectDefaultMetrics({ register: promClient.register });

app.use((req, res, next) => {
  activeConnections.inc();
  res.on("finish", () => activeConnections.dec());
  next();
});

app.use(
  responseTime((req, res, time) => {
    const p = normPath(req.path);
    reqResTime.labels(req.method, p, res.statusCode).observe(time);
    totalRequests.labels(req.method, p, res.statusCode).inc();
  }),
);

// app.use((req, res, next) => {
//   const start = Date.now();
//   res.on("finish", () => {
//     logger.info({
//       method: req.method,
//       path: normPath(req.path),
//       status: res.statusCode,
//       duration: Date.now() - start,
//       pid: process.pid,
//     }, "request");
//   });
//   next();
// });

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// Compression
app.use(compression());

// Rate limiting (disabled in test)

  // const apiLimiter = rateLimit({
  //   windowMs: 60 * 1000,
  //   max: 100,
  //   message: { status: false, msg: "Too many requests" },
  //   standardHeaders: true,
  //   legacyHeaders: false,
  // });

  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { status: false, msg: "Too many login attempts" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/auth/", authLimiter);


app.use("/", routes);

app.get("/metrics", async (req, res) => {
  try {
    res.setHeader("Content-Type", promClient.register.contentType);
    res.send(await promClient.register.metrics());
  } catch (err) {
    res.status(500).send("Error");
  }
});

module.exports = app;
