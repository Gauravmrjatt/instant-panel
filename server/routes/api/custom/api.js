const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const CustomAmount = require("../../../models/CustomAmount");
const Users = require("../../../models/Users");
const Camp = require("../../../models/Campaigns");

router.post("/:apikey", async (req, res) => {
  const { apikey } = req.params;
  const { camp, ...body } = req.body;

  if (!apikey) {
    return res.status(400).json({
      status: false,
      msg: "API key is missing",
    });
  }

  try {
    // Validate user using API key
    const isUser = await Users.findOne({ PostbackToken: apikey });
    if (!isUser) {
      return res.status(401).json({
        status: false,
        msg: "Invalid API token",
      });
    }

    // Validate campaign
    const isCamp = await Camp.findOne({ offerID: camp, userId: isUser._id });
    if (!isCamp) {
      return res.status(404).json({
        status: false,
        msg: "Invalid campaign ID",
      });
    }

    // Upsert custom amount
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

    res.status(200).json({
      status: true,
      msg: updatedCustomAmount.isNew
        ? "Custom details added successfully"
        : "Custom details updated successfully",
      id: updatedCustomAmount._id,
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({
      status: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
