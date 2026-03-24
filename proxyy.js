const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors")
const app = express();
   app.use(cors({
      origin: "http://localhost:3001",
      credentials: true,
    }))
// Proxy ALL routes
app.use(
  "/",
  function (req, res, next) {
    console.log(req.url);
    next();
  },
  createProxyMiddleware({
    target: "https://panel4.logicpay.in",
    changeOrigin: true,
    secure: true,

    // logs (optional)
    onProxyReq: (proxyReq, req, res) => {
      console.log(`${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
    },

    onError: (err, req, res) => {
      console.error("Proxy error:", err.message);
      res.status(500).send("Proxy error");
    },
  })
);

app.listen(3000, () => {
  console.log("Proxy running at http://localhost:3000");
});