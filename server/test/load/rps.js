import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    clicks: {
      executor: "ramping-arrival-rate",
      startRate: 100,
      timeUnit: "1s",
      preAllocatedVUs: 500,
      maxVUs: 10000,
      stages: [
        { target: 1000, duration: "30s" },
        { target: 3000, duration: "30s" },
        { target: 5000, duration: "30s" },
        { target: 8000, duration: "30s" },
        { target: 10000, duration: "30s" },
        { target: 12000, duration: "30s" },
        { target: 15000, duration: "30s" },
        { target: 20000, duration: "30s" },
        { target: 25000, duration: "30s" },
        { target: 30000, duration: "30s" },
      ],
    },
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const CAMPAIGN_ID = __ENV.CAMP_ID || "6a3e3ff7c93fcb99cf20e47c";

export default function () {
  const uid = `k6_${__VU}_${__ITER}`;
  const url =
    `${BASE_URL}/api/v1/tracking/${CAMPAIGN_ID}/` +
    `?aff_click_id=${uid}` +
    `&sub_aff_id=refer_test` +
    `&userIp=10.0.0.${(__VU % 254) + 1}` +
    `&device=k6` +
    `&number=1`;

  const res = http.get(url, {
    tags: {
      name: "tracking_endpoint", // prevents high-cardinality URL metrics
    },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  if (__VU === 1 && __ITER < 3) {
    console.log(`status=${res.status} body=${res.body}`);
  }
}