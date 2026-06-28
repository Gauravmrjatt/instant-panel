const User = require("../users/model");
const LoginToken = require("./model");
const { ResetPassword } = require("./model");
const myDetails = require("../../myDetails.json");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const redisClient = require("../../lib/redisClient");

async function register(data) {
  const { username, password, email, phone, plan } = data;
  const userId = uuidv4().replace(/-/g, "").slice(0, 10);
  const loginToken = uuidv4();
  const postbackToken = uuidv4().replace(/-/g, "").slice(0, 10);
  const user = new User({
    userName: username, name: username, password, email, userId,
    loginToken: [loginToken], phone, PostbackToken: postbackToken,
    plan: plan ?? null,
    premium : true,
    premiumExpireDate: Date.now(),
  });
  const savedUser = await user.save();
  const token = jwt.sign(
    { name: username, loginToken, userId },
    myDetails.enc_secret,
    { expiresIn: "24h" },
  );
  return { status: true, msg: "Account Successfully Created", token, user: savedUser };
}

async function login(email, password, ip, deviceInfo) {
  const user = await User.findOne({ email });
  if (!user) return { status: false, msg: "Invalid email or password" };
  if (user.password !== password) return { status: false, msg: "Invalid email or password" };
  const logToken = uuidv4();
  await new LoginToken({ userId: user._id, token: logToken, ip, device: deviceInfo }).save();
  await User.findOneAndUpdate({ _id: user._id }, { $push: { loginToken: logToken } });
  const expireTime = 30 * 24 * 60 * 60;
  const token = jwt.sign(
    { name: user.userName, loginToken: logToken, userId: user.userId },
    myDetails.enc_secret,
    { expiresIn: expireTime },
  );
  return { status: true, msg: "Login Successfull", token, expireTime };
}

async function forget(email) {
  const user = await User.findOne({ email });
  if (!user) return { status: false, msg: "Invalid email, no account found" };
  const forgetID = uuidv4();
  await new ResetPassword({ userId: user._id, token: forgetID, expires: Date.now() + 3600000 }).save();
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net", port: 587, secure: false,
    auth: { user: "support@toolsadda.in", pass: "Nikhil@7357" },
  });
  const resetLink = `${myDetails.domain || "http://localhost:3001"}/auth/reset/${forgetID}`;
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      { from: "support@toolsadda.in", to: user.email, subject: myDetails.name + " reset password", text: myDetails.name, html: `<a href="${resetLink}">Reset Password</a>` },
      (error, info) => {
        if (error) return resolve({ status: false, msg: "Somthing went wrong", err: error });
        resolve({ status: true, msg: "email sent successfully" });
      }
    );
  });
}

async function checkResetToken(token) {
  const record = await ResetPassword.findOne({ token }).populate("userId");
  if (!record) return { status: false, msg: "Invalid link" };
  if (record.isUsed) return { status: false, msg: "Link has already used" };
  if (record.expires < Date.now()) return { status: false, msg: "Link has expired." };
  return { status: true, msg: "valid link" };
}

async function reset(token, password) {
  const record = await ResetPassword.findOne({ token }).populate("userId");
  if (!record) return { status: false, msg: "Invalid link" };
  if (record.isUsed) return { status: false, msg: "Link has already used" };
  if (record.expires < Date.now()) return { status: false, msg: "Link has expired." };
  if (!password) return { status: false, msg: "Password is required" };
  record.isUsed = true;
  record.userId.password = password;
  const oldTokens = record.userId.loginToken || [];
  record.userId.loginToken = [uuidv4()];
  await record.userId.save();
  await record.save();
  for (const token of oldTokens) {
    redisClient.del(`session:${token}`).catch(() => {});
  }
  return { status: true, msg: "Password reset successfully" };
}

async function logout(loginToken) {
  await LoginToken.deleteOne({ token: loginToken });
  redisClient.del(`session:${loginToken}`).catch(() => {});
  return { status: true, msg: "Logged out" };
}

module.exports = { register, login, forget, checkResetToken, reset, logout };
