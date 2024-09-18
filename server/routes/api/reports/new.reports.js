const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Campaign = require("../../../models/Campaigns");
const Leads = require("../../../models/Leads");
const Clicks = require("../../../models/Click");
const Payments = require("../../../models/Payments");

router.get("/:id", authValid, authValidWithDb, async (req, res) => {
  const userDetails = req.user.db;
  try {
    const { _id: userId } = userDetails;
    const { id } = req.params;

    // Start fetching data concurrently
    const [campaign, leadsCount, clicksCount, payments] = await Promise.all([
      Campaign.findOne({ _id: id, userId }).select(["name", "offerID"]),
      Leads.countDocuments({ campId: id }),
      Clicks.countDocuments({ campId: id }),
      Payments.find({ campId: id }).select("amount"),
    ]);

    // Check if campaign exists
    if (!campaign) {
      return res
        .status(404)
        .json({ status: false, message: "Campaign not found" });
    }

    // Calculate the total amount from payments
    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Construct the campaign data object
    const campaignData = {
      _id: campaign._id,
      campaignId: campaign._id,
      leadsCount,
      clicksCount,
      totalAmount,
      name: campaign.name,
      offerID: campaign.offerID,
      cr: Math.round(clicksCount !== 0 ? (leadsCount / clicksCount) * 100 : 0),
    };

    // Send the response
    res.json({
      status: true,
      data: campaignData,
    });
  } catch (error) {
    console.log("report error >> ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

module.exports = router;
