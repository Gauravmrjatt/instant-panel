import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 100 },
    { duration: "15s", target: 100 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

const CAMP_ID = "6a3b89f0e5ffe03013f34509";
const BASE_URL = "http://localhost:3001";

export default function () {
  const url = `${BASE_URL}/api/v1/click/${CAMP_ID}?aff_click_id=load_test&sub_aff_id=refer_test&userIp=1.2.3.4&device=k6bot&number=999`;

  const res = http.get(url);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "has click_id": (r) => r.json().url !== undefined,
  });
}
