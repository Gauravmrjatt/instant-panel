const http = require("http");
const url = require("url");

const PORT = parseInt(process.env.MOCK_GW_PORT || "3099", 10);

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (pathname === "/pay" || pathname === "/nogetway.php") {
    const { num, amo, com, guid, "order-id": orderId } = query;
    const now = new Date().toISOString();

    console.log(`[${now}] MOCK GATEWAY >> num=${num} amo=${amo} order-id=${orderId} guid=${guid}`);

    const response = {
      status: "SUCCESS",
      statusMessage: "Payment processed successfully",
      message: "OK",
      txId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      amount: amo,
      number: num,
      orderId: orderId || "none",
    };

    res.statusCode = 200;
    res.end(JSON.stringify(response));
    return;
  }

  if (pathname === "/health" || pathname === "/") {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: "ok", service: "mock-gateway" }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ status: "ERROR", message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Mock payment gateway listening on port ${PORT}`);
});

process.on("SIGINT", () => { server.close(); process.exit(0); });
process.on("SIGTERM", () => { server.close(); process.exit(0); });
