const express = require("express");
const router = express.Router();
const User = require("../../../models/Users");
const Campaign = require("../../../models/Campaigns");
const PendingPayments = require("../../../models/PendingPayments");

// Middleware for validation
const validateRequest = (req, res, next) => {
  const { token, offerid } = req.params;
  const { number } = req.query;

  if (!token) {
    return res.status(400).json({ status: false, msg: "Api key is missing" });
  }
  if (!offerid) {
    return res.status(400).json({ status: false, msg: "offerid is missing" });
  }
  if (isNaN(offerid)) {
    return res.status(400).json({ status: false, msg: "invalid offer Id" });
  }
  if (!number) {
    return res.status(400).json({ status: false, msg: "number is missing" });
  }

  next();
};

router.get("/:token/:offerid", validateRequest, async (req, res) => {
  try {
    const { token, offerid } = req.params;
    const { number } = req.query;

    // Find user by token
    const isUser = await User.findOne({ PostbackToken: token }).exec();
    if (!isUser) {
      return res
        .status(404)
        .json({ status: false, msg: "Api key is Invalid!" });
    }

    // Find campaign by user ID and offer ID
    const isOffer = await Campaign.findOne({
      userId: isUser._id,
      offerID: offerid,
    }).exec();
    if (!isOffer) {
      return res
        .status(404)
        .json({ status: false, msg: "No Campaign found with this offer Id" });
    }

    // Find pending payments and calculate the sum of userAmount
    const result = await PendingPayments.aggregate([
      {
        $match: {
          campId: isOffer._id,
          user: number,
          status: {
            $in: ["PENDING", "ACCEPTED"],
          },
          paymentStatus: {
            $nin: ["ACCEPTED"],
          },
        },
      },
      {
        $group: {
          _id: null, // Group all documents into a single group
          totalUserAmount: { $sum: "$userAmount" }, // Sum of userAmount
          data: {
            $push: {
              clickId: "$clickId",
              createdAt: "$createdAt",
              event: "$event",
              // Include the clickId field
            },
          }, // Keep all documents in the group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          totalUserAmount: 1, // Include totalUserAmount
          data: 1, // Include the original documents
        },
      },
    ]).exec();

    if (result.length === 0) {
      return res
        .status(404)
        .json({ status: false, msg: "No pending payment found" });
    }

    const { totalUserAmount, data } = result[0];

    return res.json({
      status: true,
      msg: "Pending payment found",
      totalUserAmount, // Sum of userAmount
      data, // Array of pending payments
    });
  } catch (error) {
    console.error("Error in CheckPending/:token/:offerid route:", error);
    return res.status(500).json({
      status: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
