import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    clicks: {
      executor: "constant-arrival-rate",
      rate: 10000, 
      timeUnit: "1s",
      duration: "15s",
      preAllocatedVUs: 500,
      maxVUs: 2000,
    },
  },
};

const BASE_URL = "http://localhost:3001";
const CAMPAIGN_ID = "6a3b89f0e5ffe03013f34509";

export default function () {
  const url =
    `${BASE_URL}/api/v1/click/${CAMPAIGN_ID}` +
    `?aff_click_id=rps_load_test` +
    `&sub_aff_id=refer_test` +
    `&userIp=1.2.3.4` +
    `&device=k6` +
    `&number=9999999999`;

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