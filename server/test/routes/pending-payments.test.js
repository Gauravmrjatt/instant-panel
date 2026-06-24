jest.mock("../../lib/redisClient");
jest.mock("../../lib/handelPayments", () => jest.fn(() => Promise.resolve({ status: "ACCEPTED", statusMessage: "Success" })));
jest.mock("../../lib/handelManualPayments", () => jest.fn(() => Promise.resolve()));

const request = require("supertest");
const app = require("../../app");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign, createClick, createLead, createPendingPayment, createGatewaySettings } = require("../helpers/factory");

describe("Pending Payments Routes", () => {
  let auth, token, camp, click;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    token = auth.token;
    camp = await createCampaign(auth.user._id, auth.user.userName);
    click = await createClick(auth.user._id, camp._id, auth.user.userName);
    await createGatewaySettings(auth.user._id, auth.user.userName);
  });

  const req = (method, path) =>
    request(app)[method](path).set("Authorization", "Bearer " + token);

  describe("GET /get/pendingPayments/:id", () => {
    it("should return pending payments grouped by user", async () => {
      await createPendingPayment(auth.user._id, camp._id, click._id, { user: "pending_user" });
      const res = await req("get", `/get/pendingPayments/${camp._id}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
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
  });

  describe("POST /update/selected", () => {
    it("should update selected lead status", async () => {
      const lead = await createLead(auth.user._id, camp._id, click._id);
      const res = await req("post", "/update/selected").send({
        ID: lead._id,
        leadStatus: "Approved",
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });
});
