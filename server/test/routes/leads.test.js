jest.mock("../../lib/redisClient");

const request = require("supertest");
const app = require("../../app");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign, createClick, createLead, createPayment } = require("../helpers/factory");

describe("Leads Routes", () => {
  let auth, token, camp, click;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    token = auth.token;
    camp = await createCampaign(auth.user._id, auth.user.userName);
    click = await createClick(auth.user._id, camp._id, auth.user.userName);
  });

  const req = (method, path) =>
    request(app)[method](path).set("Authorization", "Bearer " + token);

  describe("GET /get/leads/:campId", () => {
    it("should return leads for a campaign", async () => {
      await createLead(auth.user._id, camp._id, click._id);
      await createLead(auth.user._id, camp._id, click._id, {
        uniqueClick: { campId: camp._id.toString(), event: "install", clickId: click._id.toString() },
      });
      const res = await req("get", "/get/leads/" + camp._id);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it("should paginate results", async () => {
      for (let i = 0; i < 5; i++) {
        await createLead(auth.user._id, camp._id, click._id, {
          uniqueClick: { campId: camp._id.toString(), event: "event_" + i, clickId: click._id.toString() },
        });
      }
      const res = await req("get", "/get/leads/" + camp._id + "?limit=2&page=1");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.totalPages).toBe(3);
    });
  });

  describe("GET /export/leads/:id", () => {
    it("should export leads as CSV", async () => {
      await createLead(auth.user._id, camp._id, click._id);
      const res = await req("get", "/export/leads/" + camp._id);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/csv/);
    });
  });

  describe("POST /update/leadStatus", () => {
    it("should update lead status", async () => {
      const lead = await createLead(auth.user._id, camp._id, click._id);
      const res = await req("post", "/update/leadStatus").send({
        ID: lead._id,
        leadStatus: "Approved",
        event: "lead",
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should reject without ID", async () => {
      const res = await req("post", "/update/leadStatus").send({ leadStatus: "Approved" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });

  describe("POST /leads/delete", () => {
    it("should delete leads by IDs", async () => {
      const lead = await createLead(auth.user._id, camp._id, click._id);
      const res = await req("post", "/leads/delete").send({ selection: [lead._id] });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should reject without selection", async () => {
      const res = await req("post", "/leads/delete").send({});
      expect(res.status).toBe(400);
    });
  });
});
