jest.mock("../../lib/redisClient");
jest.mock("../../lib/handelPostBackPayments", () => jest.fn(() => Promise.resolve()));
jest.mock("../../lib/handelNotification", () => jest.fn(() => Promise.resolve()));

const request = require("supertest");
const app = require("../../app");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign, createClick } = require("../helpers/factory");

describe("Postback Routes", () => {
  let auth, camp, click, postbackToken;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    postbackToken = auth.user.PostbackToken;
    camp = await createCampaign(auth.user._id, auth.user.userName, { globalPostBack: true });
    click = await createClick(auth.user._id, camp._id, auth.user.userName);
  });

  describe("GET /api/v1/postback/:PostbackToken/:event", () => {
    it("should accept postback with valid token and click (async)", async () => {
      const res = await request(app)
        .get(`/api/v1/postback/${postbackToken}/lead`)
        .query({ click: click.click });
      expect(res.status).toBe(202);
      expect(res.body.status).toBe(true);
      expect(res.body.msg).toMatch(/accepted for processing/);
    });

    it("should reject without click parameter", async () => {
      const res = await request(app)
        .get(`/api/v1/postback/${postbackToken}/lead`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
      expect(res.body.msg).toMatch(/PostbackToken and click/);
    });

    it("should reject without event parameter", async () => {
      const res = await request(app)
        .get(`/api/v1/postback/${postbackToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/campaign/postback/:CampaignToken/:event", () => {
    it("should accept campaign postback with valid token (async)", async () => {
      const res = await request(app)
        .get(`/api/v1/campaign/postback/${camp.postbackToken}/lead`)
        .query({ click: click.click });
      expect(res.status).toBe(202);
      expect(res.body.status).toBe(true);
      expect(res.body.msg).toMatch(/accepted for processing/);
    });

    it("should reject without click parameter", async () => {
      const res = await request(app)
        .get("/api/v1/campaign/postback/invalidtoken/lead");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });

  describe("GET /api/v1/postback/:PostbackToken/:event — duplicate click", () => {
    it("should accept duplicate click (dedup handled async)", async () => {
      const res1 = await request(app)
        .get(`/api/v1/postback/${postbackToken}/lead`)
        .query({ click: click.click });
      expect(res1.status).toBe(202);

      const res2 = await request(app)
        .get(`/api/v1/postback/${postbackToken}/lead`)
        .query({ click: click.click });
      expect(res2.status).toBe(202);
    });
  });
});
