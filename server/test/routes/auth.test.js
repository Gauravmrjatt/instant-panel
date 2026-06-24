jest.mock("../../lib/redisClient");
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((_opts, cb) => cb(null, { response: "OK" })),
  })),
}));

const request = require("supertest");
const app = require("../../app");
const User = require("../../modules/users/model");
const ResetPassword = require("../../modules/auth/model").ResetPassword;

describe("Auth Routes", () => {
  describe("POST /auth/register", () => {
    const baseUser = {
      username: "testuser",
      password: "testpass123",
      email: "test@example.com",
      phone: "9876543210",
      plan: "basic",
    };

    it("should register a new user and return token", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ ...baseUser, email: "unique_" + Date.now() + "@example.com" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body).toHaveProperty("token");
      expect(res.body.msg).toBe("Account Successfully Created");
    });

    it("should reject registration with missing fields", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ username: "nofields" });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
    });

    it("should reject duplicate email", async () => {
      const email = "dup_" + Date.now() + "@example.com";
      await request(app)
        .post("/auth/register")
        .send({ ...baseUser, email });
      const res = await request(app)
        .post("/auth/register")
        .send({ ...baseUser, email, username: "other_" + Date.now() });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });

    it("should reject duplicate username", async () => {
      const username = "dupuser_" + Date.now();
      await request(app)
        .post("/auth/register")
        .send({ ...baseUser, username, email: "first_" + Date.now() + "@x.com" });
      const res = await request(app)
        .post("/auth/register")
        .send({ ...baseUser, username, email: "second_" + Date.now() + "@x.com" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });

  describe("POST /auth/login", () => {
    const email = "logintest_" + Date.now() + "@test.com";

    beforeEach(async () => {
      await User.create({
        name: "Login Test",
        userName: "logintest_" + Date.now(),
        userId: "u_li_" + Date.now(),
        PostbackToken: "pbt_li_" + Date.now(),
        email,
        phone: 9876543210,
        password: "testpass123",
      });
    });

    const agent = (payload) =>
      request(app)
        .post("/auth/login")
        .set("User-Agent", "Mozilla/5.0 Test Browser")
        .send(payload);

    it("should login with valid email and password", async () => {
      const res = await agent({ email, password: "testpass123" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body).toHaveProperty("token");
    }, 15000);

    it("should reject invalid password", async () => {
      const res = await agent({ email, password: "wrongpassword" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
      expect(res.body.msg).toMatch(/Invalid/i);
    });

    it("should reject non-existent email", async () => {
      const res = await agent({ email: "noone@example.com", password: "testpass123" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });

    it("should return 200 when fields missing", async () => {
      const res = await agent({});
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });
  });

  describe("POST /auth/forget", () => {
    const email = "forget_" + Date.now() + "@test.com";
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: "Forget Test",
        userName: "forgettest_" + Date.now(),
        userId: "u_fg_" + Date.now(),
        PostbackToken: "pbt_fg_" + Date.now(),
        email,
        phone: 9876543210,
        password: "testpass",
      });
    });

    it("should send reset email for valid email", async () => {
      const res = await request(app).post("/auth/forget").send({ email });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should reject non-existent email", async () => {
      const res = await request(app).post("/auth/forget").send({
        email: "nobody@example.com",
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });

    it("should create reset password token in DB", async () => {
      await request(app).post("/auth/forget").send({ email });
      const tokens = await ResetPassword.find({ userId: user._id });
      expect(tokens.length).toBe(1);
      expect(tokens[0].isUsed).toBe(false);
    });
  });

  describe("GET /auth/reset/check/:token", () => {
    it("should return invalid for non-existent token", async () => {
      const res = await request(app).get("/auth/reset/check/invalidtoken123");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });

    it("should return valid for existing token", async () => {
      const user = await User.create({
        name: "Reset Test",
        userName: "resettest_" + Date.now(),
        userId: "u_rs_" + Date.now(),
        PostbackToken: "pbt_rs_" + Date.now(),
        email: "reset_" + Date.now() + "@test.com",
        phone: 9876543210,
        password: "testpass",
      });
      const token = "valid_token_" + Date.now();
      await ResetPassword.create({
        userId: user._id,
        token,
        expires: Date.now() + 3600000,
      });
      const res = await request(app).get("/auth/reset/check/" + token);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });

  describe("POST /auth/reset/:token", () => {
    it("should reject invalid reset token", async () => {
      const res = await request(app)
        .post("/auth/reset/invalidtoken")
        .send({ password: "NewPass123!" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(false);
    });

    it("should reset password for valid token", async () => {
      const user = await User.create({
        name: "Reset2 Test",
        userName: "reset2_" + Date.now(),
        userId: "u_rs2_" + Date.now(),
        PostbackToken: "pbt_rs2_" + Date.now(),
        email: "reset2_" + Date.now() + "@test.com",
        phone: 9876543210,
        password: "oldpass",
      });
      const token = "reset_token_" + Date.now();
      await ResetPassword.create({
        userId: user._id,
        token,
        expires: Date.now() + 3600000,
      });
      const res = await request(app)
        .post("/auth/reset/" + token)
        .send({ password: "newpass123" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      const updated = await User.findById(user._id);
      expect(updated.password).toBe("newpass123");
    });
  });
});
