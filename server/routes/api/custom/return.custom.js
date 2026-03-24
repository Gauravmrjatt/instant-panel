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
      return res.json({
        status: false,
        msg: "Api key is missing",
      });
    }

    const isUser = await Users.findOne({ PostbackToken: apikey });
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
      const updatedCustomAmount = await CustomAmount.findOne({
        campId: isCamp._id,
        event: body.event,
        number: body.number.trim().toLowerCase(),
      }).select(
        "number name event userAmount referAmount userComment referComment createdAt -_id"
      );

      if (updatedCustomAmount) {
        return res.json({
          status: true,
          isCustom: true,
          msg: "Details found",
          data: updatedCustomAmount,
        });
      }

      const eventDetails = isCamp.events.find(
        (e) => e.name === body.event.toString()
      );
      if (eventDetails) {
        return res.json({
          status: true,
          isCustom: false,
          msg: "Details found",
          data: {
            number: body.number.trim().toLowerCase(),
            name: isCamp.name,
            event: body.event,
            userAmount: eventDetails.user,
            referAmount: eventDetails.refer,
            userComment: eventDetails.userComment,
            referComment: eventDetails.referComment,
            createdAt: isCamp.createdAt,
          },
        });
      }

      return res.json({
        status: false,
        msg: "Event not found in campaign",
      });
    } catch (error) {
      return res.json({
        status: false,
        msg: "Internal server error",
        error: error.message,
      });
    }
  } catch (error) {
    return res.json({
      status: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
