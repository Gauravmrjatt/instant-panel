const authValid = (req, res, next) => {
  if (!req || !req.body || !req.query || !req.headers) {
    return res.json({
      status: false,
      msg: "You need Authentication to access this page",
    });
  }

  var details = require("../myDetails.json");
  var jwt = require("jsonwebtoken");
  const token =
    req.cookies.jwt_token ||
    req.headers["authorization"]?.split(" ")[1] ||
    req.headers["x-access-token"] ||
    req.body.token ||
    req.query.token;

  if (!token) {
    return res.status(401).json({
      status: false,
      msg: "Authentication required",
      redirect: "/logout",
    });
  }
  try {
    const decoded = jwt.verify(token, details.enc_secret);
    req.user = decoded;
  } catch (err) {
    return res
      .status(401)
      .json({ status: false, msg: "Invalid token", redirect: "/logout" });
  }
  return next();
};

const authValidWithDb = async (req, res, next) => {
  const User = require("../models/Users");
  const UserDbData = await User.findOne({ loginToken: req.user.loginToken });
  if (!UserDbData) {
    return res
      .status(401)
      .json({ status: false, msg: "Session expired", redirect: "/logout" });
  }
  req.user.db = UserDbData;
  return next();
};

module.exports = { authValid, authValidWithDb };
