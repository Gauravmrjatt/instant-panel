const service = require("./service");
const { getRequestIpAddress, getRequestDeviceInfo } = require("../../lib/userInfo");
const requestIp = require("request-ip");
const logger = require("../../lib/logger");

async function register(req, res) {
  const { username, password, email, phone } = req.body;
  if (!username || !password || !email || !phone) {
    return res.status(400).json({ status: false, msg: "fill all account details carefully" });
  }
  try {
    const result = await service.register(req.body);
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt_token", result.token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: isProduction ? "none" : "lax", secure: isProduction,
      httpOnly: true, path: "/",
    });
    res.json(result);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === "email") return res.json({ status: false, msg: "Email Already Exists" });
      if (field === "userName") return res.json({ status: false, msg: "User Name Already Exists" });
      return res.json({ status: false, msg: "Duplicate field", error: error.message });
    }
    res.json({ status: false, msg: "Something went wrong", error: error.message });
  }
}

async function login(req, res) {
  const { password, email } = req.body;
  if (!password || !email) {
    return res.json({ status: false, msg: "Fill all account details carefully" });
  }
  try {
    const ip = requestIp.getClientIp(req);
    const deviceInfo = getRequestDeviceInfo(req);
    const result = await service.login(email, password, ip, deviceInfo);
    if (!result.status) return res.json(result);
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt_token", result.token, {
      expires: new Date(Date.now() + result.expireTime * 1000),
      sameSite: isProduction ? "none" : "lax", secure: isProduction,
      httpOnly: true, path: "/",
    });
    res.json({ status: true, msg: "Login Successfull", token: result.token });
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong" });
  }
}

async function forget(req, res) {
  const { email } = req.body;
  if (!email) return res.json({ status: false, msg: "Fill all account details carefully" });
  try {
    const result = await service.forget(email);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong" });
  }
}

async function resetTokenCheck(req, res) {
  try {
    const result = await service.checkResetToken(req.params.token);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong" });
  }
}

async function reset(req, res) {
  try {
    const result = await service.reset(req.params.token, req.body.password);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong" });
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies.jwt_token || req.headers["authorization"]?.split(" ")[1] || req.headers["x-access-token"] || req.body.token || req.query.token;
    if (!token) return res.json({ status: false, msg: "Already logged out" });
    const decoded = require("jsonwebtoken").verify(token, require("../../myDetails.json").enc_secret);
    await service.logout(decoded.loginToken);
    res.json({ status: true, msg: "Logged out" });
  } catch (error) {
    res.json({ status: true, msg: "Logged out" });
  }
}

module.exports = { register, login, forget, resetTokenCheck, reset, logout };
