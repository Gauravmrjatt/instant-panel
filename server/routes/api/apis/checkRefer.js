const express = require("express");
const router = express.Router();
const User = require("../../../models/Users");
const Campaign = require("../../../models/Campaigns");
const Lead = require("../../../models/Leads");
const Click = require("../../../models/Click");

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

    // Fetch clicks and refers in parallel
    const [clicks, refers] = await Promise.all([
      Click.find({ campId: isOffer._id, refer: number }).exec(),
      Lead.find({ campId: isOffer._id, refer: number })
        .select([
          "user",
          "refer",
          "userAmount",
          "referAmount",
          "event",
          "status",
          "paymentStatus",
          "click",
          "clickId",
          "payMessage",
          "referPaymentStatus",
          "referPayMessage",
          "-_id",
          "createdAt",
        ])
        .exec(),
    ]);

    return res.json({
      status: true,
      msg: "Refers Details found",
      count: refers.length,
      clicks: clicks.length,
      data: refers,
    });
  } catch (error) {
    console.error("Error in /:token/:offerid route:", error);
    return res.status(500).json({
      status: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
