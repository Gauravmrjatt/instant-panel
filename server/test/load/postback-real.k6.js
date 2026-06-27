import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

const clickIds = new SharedArray("clicks", function () {
  return JSON.parse(open("/tmp/k6_click_ids.json"));
});

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const POSTBACK_TOKEN = __ENV.POSTBACK_TOKEN || "5ba0fa1ffc";
const EVENT = "abc";

export const options = {
  stages: [
    { duration: "10s", target: 50 },
    { duration: "10s", target: 100 },
    { duration: "10s", target: 200 },
    { duration: "15s", target: 200 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const clickId = clickIds[__VU % clickIds.length];
  const url = `${BASE_URL}/api/v1/postback/${POSTBACK_TOKEN}/${EVENT}?click=${clickId}`;

  const res = http.get(url, {
    tags: { name: "global_postback" },
    timeout: "10s",
  });

  check(res, {
    "status is 200 or 202": (r) => r.status === 200 || r.status === 202,
    "accepted": (r) => r.json("msg") === "Postback accepted for processing" || r.json("status") !== undefined,
  });
}
