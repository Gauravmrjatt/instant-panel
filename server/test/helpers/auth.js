const jwt = require("jsonwebtoken");
const myDetails = require("../../myDetails.json");
const User = require("../../modules/users/model");
const LoginToken = require("../../modules/auth/model");

function generateToken(loginToken, secret) {
  return jwt.sign({ loginToken }, secret || myDetails.enc_secret);
}

async function createAuthenticatedUser(overrides = {}) {
  const loginTokenValue = "lt_" + Date.now();

  const user = await User.create({
    name: "Test User",
    userName: "testuser_" + Date.now(),
    userId: "user_" + Date.now(),
    PostbackToken: "pbt_" + Date.now(),
    email: "test_" + Date.now() + "@example.com",
    phone: 9876543210,
    password: "hashed_password",
    premium: true,
    globalPostBack: true,
    loginToken: [loginTokenValue],
    ...overrides,
  });

  const loginToken = await LoginToken.create({
    userId: user._id,
    token: loginTokenValue,
    device: { client: { type: "test" } },
    ip: "127.0.0.1",
  });

  const token = generateToken(loginTokenValue);

  return { user, loginToken, token };
}

module.exports = { generateToken, createAuthenticatedUser };
