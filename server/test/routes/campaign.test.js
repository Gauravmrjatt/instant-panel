jest.mock("../../lib/redisClient");

const request = require("supertest");
const app = require("../../app");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign } = require("../helpers/factory");

describe("Campaign Routes", () => {
  let auth, token;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    token = auth.token;
  });

  const agent = (method, path) => {
    let r = request(app)[method](path).set("Authorization", "Bearer " + token);
    if (method === "post" || method === "put") r = r.set("Content-Type", "application/json");
    return r;
  };

  describe("POST /add/campaign", () => {
    it("should add a campaign", async () => {
      const res = await agent("post", "/add/campaign").send({
        name: "Test Campaign",
        offerID: Math.floor(Math.random() * 900000) + 100000,
        paytm: true,
        ip: true,
        same: true,
        tracking: "test",
        events: [{ name: "lead", user: 100, refer: 50, userComment: "uc", referComment: "rc", caps: 0, dailyCaps: 0, time: 0, payMode: "auto" }],
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body).toHaveProperty("id");
    });

    it("should reject duplicate offerID", async () => {
      const offerID = Math.floor(Math.random() * 900000) + 100000;
      await agent("post", "/add/campaign").send({
        name: "Camp 1", offerID, paytm: true, ip: true, same: true,
        tracking: "t1",
        events: [{ name: "lead", user: 100, refer: 50, userComment: "uc", referComment: "rc", caps: 0, dailyCaps: 0, time: 0, payMode: "auto" }],
      });
      const res = await agent("post", "/add/campaign").send({
        name: "Camp 2", offerID, paytm: true, ip: true, same: true,
        tracking: "t2",
        events: [{ name: "lead", user: 100, refer: 50, userComment: "uc", referComment: "rc", caps: 0, dailyCaps: 0, time: 0, payMode: "auto" }],
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });

  describe("GET /get/campaign", () => {
    it("should list campaigns for authenticated user", async () => {
      await createCampaign(auth.user._id, auth.user.userName);
      await createCampaign(auth.user._id, auth.user.userName);
      const res = await agent("get", "/get/campaign");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it("should get single campaign by id", async () => {
      const camp = await createCampaign(auth.user._id, auth.user.userName);
      const res = await agent("get", "/get/campaign/" + camp._id);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data._id.toString()).toBe(camp._id.toString());
    });
  });

  describe("POST /update/campaign", () => {
    it("should update a campaign", async () => {
      const camp = await createCampaign(auth.user._id, auth.user.userName);
      const res = await agent("post", "/update/campaign").send({
        _id: camp._id,
        data: { name: "Updated Name" },
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });

  describe("POST /delete/campaign", () => {
    it("should delete a campaign", async () => {
      const camp = await createCampaign(auth.user._id, auth.user.userName);
      const res = await agent("post", "/delete/campaign").send({ _id: camp._id });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });
});
