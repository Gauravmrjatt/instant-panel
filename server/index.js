const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const promClient = require("prom-client");
const responseTime = require("response-time");

const routes = require("./middlewares/routes");

const app = express();

// ✅ Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
console.log(process.env.CORS_ORIGIN || "ni")
// ✅ MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => console.log("✅ DB Connected.."))
  .catch(err => console.log("❌ DB Error", err));

// ================= METRICS =================
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

// Active connections
app.use((req, res, next) => {
  activeConnections.inc();
  res.on("finish", () => activeConnections.dec());
  next();
});

// Response time
app.use(
  responseTime((req, res, time) => {
    reqResTime.labels(req.method, req.path, res.statusCode).observe(time);
    totalRequests.labels(req.method, req.path, res.statusCode).inc();
  })
);

// ================= ROUTES =================
app.use("/api", routes);

// ================= METRICS ROUTE =================
app.get("/metrics", async (req, res) => {
  try {
    res.setHeader("Content-Type", promClient.register.contentType);
    res.send(await promClient.register.metrics());
  } catch (err) {
    res.status(500).send("Error");
  }
});

// ================= START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Express running on http://localhost:${PORT}`);
});