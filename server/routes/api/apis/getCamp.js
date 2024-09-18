const express = require("express");
const router = express.Router();

const Users = require("../../../models/Users");
const Camp = require("../../../models/Campaigns");

router.get("/:apikey", async (req, res) => {
  try {
    const { apikey } = req.params;
    const { camp } = req.query;
    if (!apikey) {
      7;
      return res.json({
        status: false,
        msg: "Api key is missing",
      });
    }
    const isUser = await Users.findOne({
      PostbackToken: apikey,
    });
    if (!isUser) {
      return res.json({
        status: false,
        msg: "Invalid api token",
      });
    }
    const isCamp = await Camp.findOne({
      offerID: camp,
      userId: isUser._id,
    });
    if (!isCamp) {
      return res.json({
        status: false,
        msg: "Invalid campaign id",
      });
    }
    res.json({
      status: true,
      msg: "Details found",
      data: isCamp,
    });
  } catch (error) {
    res.json({
      status: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
