const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const CustomAmount = require("../../../models/CustomAmount");
const Users = require("../../../models/Users");
const Camp = require("../../../models/Campaigns");

router.post("/:apikey", async (req, res) => {
  try {
    const { apikey } = req.params;
    const { camp, ...body } = req.body;
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
    try {
      const updatedCustomAmount = await CustomAmount.findOneAndUpdate(
        { campId: isCamp._id, event: body.event, number: body.number },
        {
          userId: isUser._id,
          user: isUser.userId,
          ...body,
          campId: isCamp._id,
        },
        { new: true, upsert: true }
      );

      res.json({
        status: true,
        msg: updatedCustomAmount.isNew
          ? "Custom details added successfully"
          : "Custom details updated successfully",
        id: updatedCustomAmount._id,
      });
    } catch (error) {
      res.json({
        status: false,
        msg: "Internal server error",
        error: error.message,
      });
    }
  } catch (error) {
    res.json({
      status: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
