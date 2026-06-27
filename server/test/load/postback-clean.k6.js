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
  scenarios: {
    sustained: {
      executor: "constant-arrival-rate",
      rate: 50,
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const idx = (__VU * 100 + __ITER) % clickIds.length;
  const clickId = clickIds[idx];
  const url = `${BASE_URL}/api/v1/postback/${POSTBACK_TOKEN}/${EVENT}?click=${clickId}`;

  const res = http.get(url, {
    tags: { name: "global_postback" },
    timeout: "5s",
  });

  check(res, {
    "status 200 or 202": (r) => r.status === 200 || r.status === 202,
  });
}
