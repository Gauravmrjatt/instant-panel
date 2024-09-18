const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Leads = require("../../../models/Leads");
const { Parser } = require("json2csv");

router.get("/:id", authValid, authValidWithDb, async (req, res) => {
  try {
    const userDetails = req.user.db;
    const { id } = req.params;

    // Fetch the Leadss data with specific fields
    const clicks = await Leads.find({
      userId: userDetails._id,
      campId: id,
    }).select("click user refer ip event status paymentStatus createdAt");

    // Convert the clicks data to CSV
    const fields = [
      "click",
      "user",
      "refer",
      "ip",
      "event",
      "status",
      "paymentStatus",
      "createdAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(clicks);

    // Set the response headers for CSV download
    res.header("Content-Type", "text/csv");
    res.attachment(`leads-${id}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "Something went wrong",
      error,
    });
    console.log(error);
  }
});

module.exports = router;
