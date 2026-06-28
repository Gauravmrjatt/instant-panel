import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    postbacks: {
      executor: "ramping-arrival-rate",
      startRate: 50,
      timeUnit: "1s",
      preAllocatedVUs: 300,
      maxVUs: 5000,
      stages: [
        { target: 50, duration: "30s" },
        { target: 100, duration: "30s" },
        { target: 200, duration: "30s" },
        { target: 500, duration: "30s" },
        { target: 1000, duration: "30s" },
        { target: 2000, duration: "30s" },
        { target: 3000, duration: "30s" },
        { target: 5000, duration: "30s" },
      ],
    },
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const CAMP_ID = "6a3e3ff7c93fcb99cf20e47c";
const EVENT = __ENV.EVENT || "abc";

export default function () {
  const uid = `k6_${__VU}_${__ITER}`;
  const url = `${BASE_URL}/api/v1/campaigns/${CAMP_ID}/postback/${EVENT}?click=${uid}&p1=test`;

  const res = http.get(url, {
    tags: { name: "postback_endpoint" },
    timeout: "10s",
  });

  check(res, {
    "status is 202": (r) => r.status === 202,
  });

  if (__VU === 1 && __ITER < 3) {
    console.log(`status=${res.status} body=${res.body}`);
  }
}
