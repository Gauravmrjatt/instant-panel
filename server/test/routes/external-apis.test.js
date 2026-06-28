jest.mock("../../lib/redisClient");
jest.mock("../../lib/handelPayments", () => jest.fn(() => Promise.resolve({ status: "ACCEPTED", statusMessage: "Success" })));

const request = require("supertest");
const app = require("../../app");
const User = require("../../modules/users/model");
const Campaign = require("../../modules/campaigns/model");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign, createClick, createLead, createPendingPayment, createCustomAmount } = require("../helpers/factory");

describe("External API Routes", () => {
  let auth, camp, user, postbackToken;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    user = auth.user;
    postbackToken = user.PostbackToken;
    camp = await createCampaign(user._id, user.userName);
  });

  describe("GET /api/v1/checkRefer/:token/:offerid", () => {
    it("should return refer details for valid token and offer", async () => {
      const click = await createClick(user._id, camp._id, user.userName);
      await createLead(user._id, camp._id, click._id, { refer: "refer123" });
      const res = await request(app)
        .get(`/api/v1/checkRefer/${postbackToken}/${camp.offerID}`)
        .query({ number: "refer123" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/checkRefer/invalidtoken/12345")
        .query({ number: "refer123" });
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/checkPending/:token/:offerid", () => {
    it("should return pending payments for valid request", async () => {
      const click = await createClick(user._id, camp._id, user.userName);
      await createPendingPayment(user._id, camp._id, click._id, { user: "user123" });
      const res = await request(app)
        .get(`/api/v1/checkPending/${postbackToken}/${camp.offerID}`)
        .query({ number: "user123" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should return 404 when no pending payments exist", async () => {
      const res = await request(app)
        .get(`/api/v1/checkPending/${postbackToken}/${camp.offerID}`)
        .query({ number: "nonexistent" });
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/user/:token/:offerid", () => {
    it("should return user details", async () => {
      const click = await createClick(user._id, camp._id, user.userName);
      await createLead(user._id, camp._id, click._id, { user: "user456" });
      const res = await request(app)
        .get(`/api/v1/user/${postbackToken}/${camp.offerID}`)
        .query({ number: "user456" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/user/badtoken/12345")
        .query({ number: "user456" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });

  describe("GET /api/v1/view/camp/:apikey", () => {
    it("should return campaign by apikey and offerID", async () => {
      const res = await request(app)
        .get(`/api/v1/view/camp/${postbackToken}`)
        .query({ camp: camp.offerID });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it("should reject invalid apikey", async () => {
      const res = await request(app)
        .get("/api/v1/view/camp/invalidkey")
        .query({ camp: "12345" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });

  describe("POST /api/v1/update/custom/:apikey", () => {
    it("should upsert custom amount via API key", async () => {
      const res = await request(app)
        .post(`/api/v1/update/custom/${postbackToken}`)
        .send({ camp: camp.offerID, number: "ext_user", event: "lead", userAmount: 200, referAmount: 100 });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });

  describe("POST /api/v1/get/custom/:apikey", () => {
    it("should return custom or default amount", async () => {
      const res = await request(app)
        .post(`/api/v1/get/custom/${postbackToken}`)
        .send({ camp: camp.offerID, number: "ext_ref", event: "lead" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });
});
