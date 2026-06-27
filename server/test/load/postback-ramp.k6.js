import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    ramp_to_break: {
      executor: "ramping-arrival-rate",
      startRate: 50,
      timeUnit: "1s",
      preAllocatedVUs: 300,
      maxVUs: 5000,
      stages: [
        { duration: "30s", target: 200 },
        { duration: "30s", target: 500 },
        { duration: "30s", target: 1000 },
        { duration: "30s", target: 2000 },
        { duration: "30s", target: 3000 },
        { duration: "30s", target: 5000 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<5000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const POSTBACK_TOKEN = __ENV.POSTBACK_TOKEN || "5ba0fa1ffc";
const EVENT = __ENV.EVENT || "abc";

export default function () {
  const clickId = `k6_click_${__VU}_${__ITER}`;
  const url = `${BASE_URL}/api/v1/postback/${POSTBACK_TOKEN}/${EVENT}?click=${clickId}`;

  const res = http.get(url, {
    tags: { name: "global_postback" },
    timeout: "10s",
  });

  check(res, {
    "status is 200 or 202": (r) => r.status === 200 || r.status === 202,
    "accepted": (r) => {
      try { return r.json("status") !== undefined; } catch { return false; }
    },
  });
}
