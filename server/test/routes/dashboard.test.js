jest.mock("../../lib/redisClient");

const request = require("supertest");
const app = require("../../app");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign, createClick, createLead, createPayment } = require("../helpers/factory");

describe("Dashboard Routes", () => {
  let auth, token, camp, click;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    token = auth.token;
    camp = await createCampaign(auth.user._id, auth.user.userName);
    click = await createClick(auth.user._id, camp._id, auth.user.userName);
  });

  const req = (method, path) =>
    request(app)[method](path).set("Authorization", "Bearer " + token);

  describe("GET /get/dashboard", () => {
    it("should return dashboard data for premium user", async () => {
      const res = await req("get", "/get/dashboard");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body).toHaveProperty("leads");
      expect(res.body).toHaveProperty("payments");
      expect(res.body).toHaveProperty("camp");
    });
  });

  describe("POST /get/dashboard", () => {
    it("should return filtered dashboard data by date", async () => {
      const res = await req("post", "/get/dashboard").send({
        date: {
          from: { year: 2024, month: 1, day: 1 },
          to: { year: 2026, month: 12, day: 31 },
        },
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });
});
