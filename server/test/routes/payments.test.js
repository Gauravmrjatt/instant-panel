jest.mock("../../lib/redisClient");

const request = require("supertest");
const app = require("../../app");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign, createClick, createLead, createPayment, createGatewaySettings } = require("../helpers/factory");

jest.mock("../../lib/handelManualPayments", () => jest.fn(() => Promise.resolve()));

describe("Payment Routes", () => {
  let auth, token, camp, click, lead;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    token = auth.token;
    camp = await createCampaign(auth.user._id, auth.user.userName);
    click = await createClick(auth.user._id, camp._id, auth.user.userName);
    lead = await createLead(auth.user._id, camp._id, click._id);
    await createGatewaySettings(auth.user._id, auth.user.userName);
  });

  const req = (method, path) =>
    request(app)[method](path).set("Authorization", "Bearer " + token);

  describe("GET /get/payments", () => {
    it("should return payment list", async () => {
      await createPayment(auth.user._id, camp._id, click._id);
      const res = await req("get", "/get/payments");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.count).toBe(1);
    });
  });

  describe("POST /update/payment", () => {
    it("should process payment for lead", async () => {
      const res = await req("post", "/update/payment").send({
        ID: lead._id,
        getEvent: "lead",
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should reject without required fields", async () => {
      const res = await req("post", "/update/payment").send({});
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });
});
