jest.mock("../../lib/redisClient");

const request = require("supertest");
const app = require("../../app");
const { createAuthenticatedUser } = require("../helpers/auth");
const { createCampaign, createBan, createGatewaySettings } = require("../helpers/factory");

describe("API Routes", () => {
  let auth, token, camp;

  beforeEach(async () => {
    auth = await createAuthenticatedUser();
    token = auth.token;
    camp = await createCampaign(auth.user._id, auth.user.userName);
  });

  const req = (method, path) =>
    request(app)[method](path).set("Authorization", "Bearer " + token);

  describe("Ban Routes", () => {
    describe("POST /ban/number", () => {
      it("should ban a number", async () => {
        const res = await req("post", "/ban/number").send({ number: "9876543210" });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });

    describe("GET /get/number", () => {
      it("should list banned numbers", async () => {
        await createBan(auth.user._id, "9876543210");
        const res = await req("get", "/get/number");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });

    describe("POST /ban/unban", () => {
      it("should unban a number by id", async () => {
        const ban = await createBan(auth.user._id, "9876543210");
        const res = await req("post", "/ban/unban").send({ _id: ban._id });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });
  });

  describe("Tracking Route", () => {
    it("should track a click and return redirect URL", async () => {
      const res = await request(app)
        .get("/api/v1/click/" + camp._id)
        .query({ aff_click_id: "user123", sub_aff_id: "refer123" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body).toHaveProperty("url");
    });

    it("should reject without required params", async () => {
      const res = await request(app).get("/api/v1/click/" + camp._id);
      expect(res.status).toBe(400);
    });
  });

  describe("User Routes", () => {
    describe("GET /get/user", () => {
      it("should return user profile", async () => {
        const res = await req("get", "/get/user");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body).not.toHaveProperty("password");
      });
    });

    describe("GET /get/logins", () => {
      it("should return login sessions", async () => {
        const res = await req("get", "/get/logins");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });
  });

  describe("Gateway Settings Routes", () => {
    describe("GET /get/gateway-settings", () => {
      it("should return gateway settings", async () => {
        const res = await req("get", "/get/gateway-settings");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });

    describe("POST /update/gateway-settings", () => {
      it("should update gateway settings", async () => {
        const res = await req("post", "/update/gateway-settings").send({
          type: "Earning Area",
          guid: "test_guid_123",
          url: "",
        });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });
  });

  describe("Telegram Alert Routes", () => {
    describe("GET /get/telegram-alert", () => {
      it("should return telegram settings", async () => {
        const res = await req("get", "/get/telegram-alert");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });

    describe("POST /update/telegram-alert", () => {
      it("should update telegram settings", async () => {
        const res = await req("post", "/update/telegram-alert").send({
          chatId: 12345,
          contact: "@test",
        });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });
  });

  describe("Custom Amount Routes", () => {
    describe("POST /api/v1/custom", () => {
      it("should add custom amount", async () => {
        const res = await req("post", "/api/v1/custom").send({
          camp: camp._id,
          number: "custom_user",
          event: "lead",
          userAmount: 150,
          referAmount: 75,
        });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });

    describe("GET /get/custom", () => {
      it("should list custom amounts", async () => {
        const res = await req("get", "/get/custom");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });

    describe("POST /detete/custom", () => {
      it("should delete a custom amount", async () => {
        const res = await req("post", "/api/v1/custom").send({
          camp: camp._id,
          number: "del_user_" + Date.now(),
          event: "lead",
          userAmount: 150,
          referAmount: 75,
        });
        expect(res.status).toBe(200);
        const CustomAmount = require("../../modules/custom-amount/model");
        const custom = await CustomAmount.findOne().sort({ createdAt: -1 });
        const delRes = await req("post", "/detete/custom").send({ _id: custom._id });
        expect(delRes.status).toBe(200);
        expect(delRes.body.status).toBe(true);
      });
    });
  });

  describe("Postback Config Routes", () => {
    describe("GET /get/postback", () => {
      it("should return postback settings", async () => {
        const res = await req("get", "/get/postback");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body).toHaveProperty("key");
      });
    });

    describe("POST /edit/postback", () => {
      it("should toggle global postback", async () => {
        const res = await req("post", "/edit/postback");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });

    describe("POST /update/postback", () => {
      it("should regenerate postback key", async () => {
        const res = await req("post", "/update/postback");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body).toHaveProperty("key");
      });
    });
  });

  describe("Search Route", () => {
    describe("GET /get/search", () => {
      it("should search campaigns by text", async () => {
        const res = await req("get", "/get/search?text=Test");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });

      it("should require text param", async () => {
        const res = await req("get", "/get/search");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(false);
      });
    });
  });

  describe("Billing Route", () => {
    describe("GET /get/billing", () => {
      it("should reject non-premium user with 403", async () => {
        const { token: noPremiumToken } = await createAuthenticatedUser({ premium: false });
        const res = await request(app)
          .get("/get/billing")
          .set("Authorization", "Bearer " + noPremiumToken);
        expect(res.status).toBe(403);
        expect(res.body.status).toBe(false);
      });
    });
  });

  describe("Logout Route", () => {
    describe("GET /logout", () => {
      it("should clear jwt cookie", async () => {
        const res = await req("get", "/logout");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
      });
    });
  });
});
