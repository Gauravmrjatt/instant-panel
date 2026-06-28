import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    ramp_find_breakpoint: {
      executor: "ramping-arrival-rate",
      startRate: 50,
      timeUnit: "1s",
      preAllocatedVUs: 200,
      maxVUs: 2000,
      stages: [
        { duration: "30s", target: 200 },
        { duration: "30s", target: 500 },
        { duration: "30s", target: 1000 },
        { duration: "30s", target: 2000 },
        { duration: "30s", target: 5000 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<10000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";
const POSTBACK_TOKEN = __ENV.POSTBACK_TOKEN || "test_postback_token";
const EVENT = "lead";

const CLICK_IDS = (__ENV.CLICK_IDS || "click_1,click_2,click_3,click_4,click_5").split(",");

export default function () {
  const clickId = CLICK_IDS[__VU % CLICK_IDS.length] + "_" + __ITER;
  const url = `${BASE_URL}/api/v1/postback/${POSTBACK_TOKEN}/${EVENT}?click=${clickId}`;

  const res = http.get(url, {
    tags: { name: "global_postback" },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}
