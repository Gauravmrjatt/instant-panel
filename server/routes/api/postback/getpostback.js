const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");

router.get("/", authValid, authValidWithDb, (req, res) => {
  const { PostbackToken , globalPostBack } = req.user.db;

  // Dynamically construct the domain URL
  const protocol = req.protocol; // http or https
  const host = req.get("host"); // e.g., localhost:3000 or example.com

  const domain = `${protocol}://${host}`;

  res.json({
    status: true,
    msg: "Postback key found!",
    key: PostbackToken,
    isEnabled : globalPostBack,
    url: `${domain}/api/v1/postback/${PostbackToken}/{eventname}?click={click_id}&p1={pass extra params}`,
  });
});

module.exports = router;
