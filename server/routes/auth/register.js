const express = require("express");
const router = express.Router();
const User = require("../../models/Users");
var jwt = require("jsonwebtoken");
const myDetails = require("../../myDetails.json");
const { v4: uuidv4 } = require("uuid");

router.post("/", (req, res) => {
  const { username, password, email, phone, plan } = req.body;
  if (username && password && email && phone) {
    const userId = uuidv4();
    const loginToken = uuidv4();
    const createUser = new User({
      userName: username,
      name: username,
      password,
      email,
      userId: userId,
      loginToken: [loginToken],
      phone,
      name: username,
      PostbackToken: uuidv4(),
      plan: plan ?? null,
    });

    createUser
      .save()
      .then((savedUser) => {
        const token = jwt.sign(
          {
            name: username,
            loginToken: loginToken,
            userId: userId,
          },
          myDetails.enc_secret,
          {
            expiresIn: "24h",
          },
        );
        res.cookie("jwt_token", token, {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        });
        res.json({
          status: true,
          msg: "Account Successfully Created",
          token: token,
        });
      })
      .catch((error) => {
        const err = error.message;
        if (
          err ==
          'E11000 duplicate key error collection: affilate.users index: email_1 dup key: { email: "' +
            email +
            '" }'
        ) {
          res.json({ status: false, msg: "Email Already Exists" });
        } else if (
          err ==
          'E11000 duplicate key error collection: affilate.users index: userName_1 dup key: { userName: "' +
            username +
            '" }'
        ) {
          res.json({ status: false, msg: "User Name Already Exists" });
        } else {
          res.json({ status: false, msg: "Something went wrong", error: err });
        }
      });
  } else {
    res
      .status(400)
      .json({ status: false, msg: "fill all account details carefully" });
  }
});
module.exports = router;
9;
