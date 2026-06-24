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
    it("should process postback with valid token and click", async () => {
      const res = await request(app)
        .get(`/api/v1/postback/${postbackToken}/lead`)
        .query({ click: click.click });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should reject without click parameter", async () => {
      const res = await request(app)
        .get(`/api/v1/postback/${postbackToken}/lead`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
      expect(res.body.msg).toMatch(/PostbackToken and click/);
    });

    it("should reject invalid PostbackToken", async () => {
      const res = await request(app)
        .get("/api/v1/postback/invalidtoken/lead")
        .query({ click: click.click });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
      expect(res.body.msg).toMatch(/Invalid PostbackToken/);
    });
  });

  describe("GET /api/v1/campaign/postback/:CampaignToken/:event", () => {
    it("should process campaign postback with valid token", async () => {
      const res = await request(app)
        .get(`/api/v1/campaign/postback/${camp.postbackToken}/lead`)
        .query({ click: click.click });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should reject invalid CampaignToken", async () => {
      const res = await request(app)
        .get("/api/v1/campaign/postback/invalidtoken/lead")
        .query({ click: click.click });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });

  describe("GET /api/v1/postback/:PostbackToken/:event with caps", () => {
    it("should handle caps reached", async () => {
      const campWithCaps = await createCampaign(auth.user._id, auth.user.userName, {
        postbackToken: "caps_token_" + Date.now(),
        events: [{
          name: "lead", user: 100, refer: 50,
          userComment: "uc", referComment: "rc",
          caps: 1, dailyCaps: 0, time: 0, payMode: "auto",
        }],
      });
      const click1 = await createClick(auth.user._id, campWithCaps._id, "click1_" + Date.now());
      const click2 = await createClick(auth.user._id, campWithCaps._id, "click2_" + Date.now());
      await request(app)
        .get(`/api/v1/postback/${auth.user.PostbackToken}/lead`)
        .query({ click: click1.click });
      const res = await request(app)
        .get(`/api/v1/postback/${auth.user.PostbackToken}/lead`)
        .query({ click: click2.click });
      expect(res.status).toBe(200);
    });
  });
});
