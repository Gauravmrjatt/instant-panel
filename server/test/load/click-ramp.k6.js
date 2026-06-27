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
const CAMP_ID = __ENV.CAMP_ID || "6a3e3ff7c93fcb99cf20e47c";

export default function () {
  const uid = `k6_${__VU}_${__ITER}`;
  const url = `${BASE_URL}/api/v1/tracking/${CAMP_ID}/?aff_click_id=${uid}&sub_aff_id=perf_test&userIp=10.0.0.${(__VU % 254) + 1}&device=k6bot&number=1`;

  const res = http.get(url, {
    tags: { name: "click_track" },
    timeout: "10s",
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has url": (r) => {
      try { return r.json("url") !== undefined; } catch { return false; }
    },
  });
}
