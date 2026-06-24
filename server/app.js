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

const routes = require("./middlewares/routes");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  exposedHeaders: ["Authorization"],
  allowedHeaders: ["Authorization", "Content-Type"],
}));

const collectDefaultMetrics = promClient.collectDefaultMetrics;

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
    reqResTime.labels(req.method, req.path, res.statusCode).observe(time);
    totalRequests.labels(req.method, req.path, res.statusCode).inc();
  }),
);

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// Compression
app.use(compression());

// Rate limiting (disabled in test)
if (process.env.NODE_ENV !== "test") {
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
}

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
