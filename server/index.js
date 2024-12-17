// const express = require("express");
// const bodyParser = require("body-parser");
// const next = require("next");
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();
// const routes = require("./middlewares/routes");
// const path = require("path");
// const mongoose = require("mongoose");
// const { authValid, authValidWithDb } = require("./middlewares/auth");
// require("dotenv").config();
// const cookieParser = require("cookie-parser");

// const promClient = require("prom-client");
// const collectDefaultMetrics = promClient.collectDefaultMetrics;
// const responseTime = require("response-time");

// // Histogram to track request-response time
// const reqResTime = new promClient.Histogram({
//   name: "http_express_req_res_time",
//   help: "HTTP express request-response time",
//   labelNames: ["method", "path", "status_code"],
//   buckets: [1, 2, 3, 5, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000],
// });

// // Counter to track total requests
// const totalRequests = new promClient.Counter({
//   name: "http_requests_total",
//   help: "Total number of HTTP requests",
//   labelNames: ["method", "path", "status_code"],
// });

// // Gauge for active connections
// const activeConnections = new promClient.Gauge({
//   name: "http_active_connections",
//   help: "Number of active HTTP connections",
// });

// app
//   .prepare()
//   .then(() => {
//     const server = express();
//     server.use(bodyParser.json());
//     server.use(bodyParser.urlencoded({ extended: true }));
//     server.use(cookieParser());

//     mongoose.connect(process.env.DB_URL).then(
//       () => {
//         console.log("connected");
//       },
//       (err) => {
//         console.log(err);
//       }
//     );

//     // Collect default metrics
//     collectDefaultMetrics({ register: promClient.register });

//     // Middleware to track active connections
//     server.use((req, res, next) => {
//       activeConnections.inc();
//       res.on("finish", () => activeConnections.dec());
//       next();
//     });

//     // Middleware to measure response time and count requests
//     server.use(
//       responseTime((req, res, time) => {
//         reqResTime
//           .labels({
//             method: req.method,
//             path: req.path,
//             status_code: res.statusCode,
//           })
//           .observe(time);
//         totalRequests
//           .labels({
//             method: req.method,
//             path: req.path,
//             status_code: res.statusCode,
//           })
//           .inc();
//       })
//     );

//     server.use(routes);

//     // Metrics endpoint with optional basic authentication
//     server.get("/metrics", async (req, res, next) => {
//       const authHeader = req.headers.authorization;
//       const validToken = process.env.METRICS_AUTH_TOKEN;

//       if (
//         validToken &&
//         (!authHeader || authHeader !== `Bearer ${validToken}`)
//       ) {
//         res.status(403).send("Forbidden");
//         return;
//       }

//       try {
//         res.setHeader("Content-Type", promClient.register.contentType);
//         const metrics = await promClient.register.metrics();
//         res.send(metrics);
//       } catch (err) {
//         console.error("Failed to get metrics", err);
//         res.status(500).send("Internal Server Error");
//       }
//     });

//     server.use("/static", express.static(path.join(__dirname, "public")));

//     // Frontend pages with auth
//     server.get("/dashboard", authValid, authValidWithDb, (req, res) => {
//       return handle(req, res);
//     });
//     server.get("/dashboard/profile", authValid, authValidWithDb, (req, res) => {
//       return handle(req, res);
//     });
//     server.get(
//       "/dashboard/campaigns",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/liveCampaigns",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/postBack",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/pay-to-user",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/geteway-settings",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/ban-number",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/bannedNumber",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/telegram-alerts",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/payments",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/camp/click/:id",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/camp/edit/:id",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get(
//       "/dashboard/camp/view/:id",
//       authValid,
//       authValidWithDb,
//       (req, res) => {
//         return handle(req, res);
//       }
//     );
//     server.get("/auth/devices", authValid, authValidWithDb, (req, res) => {
//       return handle(req, res);
//     });

//     server.get("*", (req, res) => {
//       return handle(req, res);
//     });

//     server.listen(process.env.PORT, (err) => {
//       if (err) throw err;
//       console.log("> Ready on http://localhost:" + process.env.PORT);
//     });
//   })
//   .catch((ex) => {
//     console.log(ex.stack);
//     process.exit(1);
//   });

// process.on("uncaughtException", function (err) {
//   console.log(err);
//   console.log("Node NOT Exiting...");
// });

const express = require("express");
const bodyParser = require("body-parser");
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const routes = require("./middlewares/routes");
const path = require("path");
const mongoose = require("mongoose");
const { authValid, authValidWithDb } = require("./middlewares/auth");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const promClient = require("prom-client");
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const responseTime = require("response-time");

// Histogram to track request-response time
const reqResTime = new promClient.Histogram({
  name: "http_express_req_res_time",
  help: "HTTP express request-response time",
  labelNames: ["method", "path", "status_code", "query", "body"],
  buckets: [
    1, 2, 3, 5, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 40000,
    100000,
  ],
});

// Counter to track total requests
const totalRequests = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status_code"],
});

// Gauge for active connections
const activeConnections = new promClient.Gauge({
  name: "http_active_connections",
  help: "Number of active HTTP connections",
});

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(cookieParser());

    mongoose.connect(process.env.DB_URL).then(
      () => {
        console.log("connected");
      },
      (err) => {
        console.log(err);
      }
    );

    // Collect default metrics
    collectDefaultMetrics({ register: promClient.register });

    // Middleware to track active connections
    server.use((req, res, next) => {
      activeConnections.inc();
      res.on("finish", () => activeConnections.dec());
      next();
    });

    // Middleware to measure response time and count requests
    server.use(
      responseTime((req, res, time) => {
        reqResTime
          .labels({
            method: req.method,
            path: req.originalUrl.split("?")[0],
            status_code: res.statusCode,
          })
          .observe(time);
        totalRequests
          .labels({
            method: req.method,
            path: req.originalUrl.split("?")[0],
            status_code: res.statusCode,
          })
          .inc();
      })
    );

    server.use(routes);

    // Metrics endpoint with optional basic authentication
    server.get("/metrics", async (req, res, next) => {
      const authHeader = req.headers.authorization;
      const validToken = process.env.METRICS_AUTH_TOKEN;

      if (
        validToken &&
        (!authHeader || authHeader !== `Bearer ${validToken}`)
      ) {
        res.status(403).send("Forbidden");
        return;
      }

      try {
        res.setHeader("Content-Type", promClient.register.contentType);
        const metrics = await promClient.register.metrics();
        res.send(metrics);
      } catch (err) {
        console.error("Failed to get metrics", err);
        res.status(500).send("Internal Server Error");
      }
    });

    server.use("/static", express.static(path.join(__dirname, "public")));

    // Frontend pages with auth
    server.get("/dashboard", authValid, authValidWithDb, (req, res) => {
      return handle(req, res);
    });
    server.get("/dashboard/profile", authValid, authValidWithDb, (req, res) => {
      return handle(req, res);
    });
    server.get(
      "/dashboard/campaigns",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/liveCampaigns",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/postBack",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/pay-to-user",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/geteway-settings",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/ban-number",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/bannedNumber",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/telegram-alerts",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/payments",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/camp/click/:id",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/camp/edit/:id",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get(
      "/dashboard/camp/view/:id",
      authValid,
      authValidWithDb,
      (req, res) => {
        return handle(req, res);
      }
    );
    server.get("/auth/devices", authValid, authValidWithDb, (req, res) => {
      return handle(req, res);
    });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(process.env.PORT, (err) => {
      if (err) throw err;
      console.log("> Ready on http://localhost:" + process.env.PORT);
    });
  })
  .catch((ex) => {
    console.log(ex.stack);
    process.exit(1);
  });

process.on("uncaughtException", function (err) {
  console.log(err);
  console.log("Node NOT Exiting...");
});
