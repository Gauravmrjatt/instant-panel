jest.mock("../../lib/redisClient");

const request = require("supertest");
const app = require("../../app");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign, createClick } = require("../helpers/factory");

describe("Clicks Routes", () => {
  let auth, token, camp, click;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    token = auth.token;
    camp = await createCampaign(auth.user._id, auth.user.userName);
    click = await createClick(auth.user._id, camp._id, auth.user.userName);
  });

  const req = (method, path) =>
    request(app)[method](path).set("Authorization", "Bearer " + token);

  describe("GET /get/click/:id", () => {
    it("should require event query param", async () => {
      const res = await req("get", "/get/click/" + camp._id);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
      expect(res.body.msg).toMatch(/Both are required/);
    });
  });

  describe("GET /export/click/:id", () => {
    it("should export clicks as CSV", async () => {
      const res = await req("get", "/export/click/" + camp._id);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/csv/);
    });
  });

  describe("POST /get/click/search", () => {
    it("should search clicks by IDs", async () => {
      const res = await req("post", "/get/click/search").send({
        data: [click.click],
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.clickData).toBeDefined();
    });

    it("should reject without data array", async () => {
      const res = await req("post", "/get/click/search").send({
        clickIds: [click.click],
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });
});
