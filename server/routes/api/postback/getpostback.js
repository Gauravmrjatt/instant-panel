const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../../pages/myDetails.json");

router.get("/", authValid, authValidWithDb, (req, res) => {
  const { PostbackToken } = req.user.db;
  res.json({
    status: true,
    msg: "Postback key found!",
    key: PostbackToken,
    url: `${process.env.domain}/api/v1/postback/${PostbackToken}/{eventname}?click={click_id}&p1={pass extra params}`,
  });
});

module.exports = router;
