const express = require("express");
const router = express.Router();
const myDetails = require("../../myDetails.json");
const User = require("../../models/Users");
const LoginToken = require("../../models/Login");
var jwt = require("jsonwebtoken");
const {
  getRequestIpAddress,
  getRequestDeviceInfo,
} = require("../../lib/userInfo");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");

router.post("/", async (req, res) => {
  const { password, email } = req.body;
  if (password && email) {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ status: false, msg: "Invalid email or password" });
    }
    if (user.password == password) {
      var clientIp = requestIp.getClientIp(req);
      const logToken = uuidv4();
      const newLogin = new LoginToken({
        userId: user._id,
        token: logToken,
        ip: clientIp,
        device: getRequestDeviceInfo(req),
      });
      newLogin.save().then((data) => {
        const expireTime = 30 * 24 * 60 * 60;
        User.findOneAndUpdate(
          { _id: user._id },
          { $push: { loginToken: logToken } },
        )
          .then()
          .catch((err) => console.log(err));
        const token = jwt.sign(
          {
            name: user.userName,
            loginToken: logToken,
            userId: user.userId,
          },
          myDetails.enc_secret,
          {
            expiresIn: expireTime,
          },
        );
        res.cookie("jwt_token", token, {
          expires: new Date(Date.now() + expireTime * 1000),
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        });

        res.json({
          status: true,
          msg: "Login Successfull",
          token: token,
        });
      });
    } else {
      return res.json({ status: false, msg: "Invalid email or password" });
    }
  } else {
    res.json({ status: false, msg: "Fill all account details carefully" });
  }
});
module.exports = router;
