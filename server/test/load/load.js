// load-test.js
const TOTAL_REQUESTS = 20000;
const CAMP_ID = "6a3b89f0e5ffe03013f34509";
const BASE_URL = "http://localhost:3001";

const userNumber = "1234567890";
const referNumber = "9876543210";
const ip = "127.0.0.1";
const userAgent = "LoadTestBot/1.0";
const number = "1234567890";

let successCount = 0;
let failCount = 0;
let timeouts = 0;

async function countClicks() {
  const mongoose = require("mongoose");
  require("dotenv").config();
  await mongoose.connect(process.env.DB_URL);
  const count = await mongoose.connection.db.collection("clicks").countDocuments();
  await mongoose.disconnect();
  return count;
}

async function hitEndpoint(i) {
  const url =
    `${BASE_URL}/api/v1/click/${CAMP_ID}?aff_click_id=${encodeURIComponent(userNumber + "_" + i)}` +
    `&sub_aff_id=${encodeURIComponent(referNumber)}` +
    `&userIp=${encodeURIComponent(ip)}` +
    `&device=${encodeURIComponent(userAgent)}` +
    `&number=${encodeURIComponent(number)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.status === 200) successCount++;
    else failCount++;
    return res.status;
  } catch (err) {
    if (err.name === "AbortError") timeouts++;
    else failCount++;
    return null;
  }
}

async function main() {
  console.log(`Starting load test: ${TOTAL_REQUESTS} requests to ${BASE_URL}/api/v1/click/${CAMP_ID}`);
  console.log(`Target campaign: ${CAMP_ID}`);
  console.log("");

  const clicksBefore = await countClicks();
  console.log(`Clicks in DB before test: ${clicksBefore}`);

  const start = Date.now();

  // Send all requests in parallel (burst)
  const requests = Array.from(
    { length: TOTAL_REQUESTS },
    (_, i) => hitEndpoint(i + 1)
  );

  await Promise.allSettled(requests);

  const elapsed = Date.now() - start;
  const rps = Math.round((TOTAL_REQUESTS / elapsed) * 1000);

  // Wait for ClickWorker to flush remaining buffer (200ms interval + margin)
  console.log("\nWaiting 2s for ClickWorker to flush buffer...");
  await new Promise(r => setTimeout(r, 2000));

  const clicksAfter = await countClicks();
  const clicksInserted = clicksAfter - clicksBefore;

  console.log("\n========== RESULTS ==========");
  console.log(`Total requests:        ${TOTAL_REQUESTS}`);
  console.log(`Successful (200):      ${successCount}`);
  console.log(`Failed (conn err):     ${failCount}`);
  console.log(`Timeouts:              ${timeouts}`);
  console.log(`Total time:            ${elapsed} ms`);
  console.log(`Requests/sec (total):  ${rps}`);
  console.log(`Requests/sec (success):${Math.round((successCount / elapsed) * 1000)}`);
  console.log("");

  console.log(`Clicks in DB before:   ${clicksBefore}`);
  console.log(`Clicks in DB after:    ${clicksAfter}`);
  console.log(`Clicks inserted:       ${clicksInserted}`);
  const pipelineLoss = successCount > 0 ? ((successCount - clicksInserted) / successCount * 100).toFixed(2) : "N/A";
  console.log(`Queue pipeline loss:   ${pipelineLoss}%`);
  console.log("=============================");
}

main().catch(console.error);
