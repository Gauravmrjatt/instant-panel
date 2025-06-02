const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Leads = require("../../../models/Leads");
const { Parser } = require("json2csv");

router.get("/:id", authValid, authValidWithDb, async (req, res) => {
  try {
    const userDetails = req.user.db;
    const { id } = req.params;

    // Fetch leads data including the 'params' object
    const leads = await Leads.find({
      userId: userDetails._id,
      campId: id,
    }).select("click user refer ip event status paymentStatus createdAt params");

    // Flatten the params object for each lead
    const flattenedLeads = leads.map((lead) => {
      const leadObj = lead.toObject(); // Convert Mongoose document to plain JS object

      // Flatten params fields (if any)
      if (leadObj.params && typeof leadObj.params === "object") {
        for (const key in leadObj.params) {
          leadObj[`params.${key}`] = leadObj.params[key];
        }
      }

      delete leadObj.params; // Remove original nested object
      return leadObj;
    });

    // Get dynamic keys from params across all leads
    const paramKeys = [
      ...new Set(
        flattenedLeads.flatMap((lead) =>
          Object.keys(lead).filter((key) => key.startsWith("params."))
        )
      ),
    ];

    const staticFields = [
      "click",
      "user",
      "refer",
      "ip",
      "event",
      "status",
      "paymentStatus",
      "createdAt",
    ];

    const fields = [...staticFields, ...paramKeys];

    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(flattenedLeads);

    // Send as CSV
    res.header("Content-Type", "text/csv");
    res.attachment(`leads-${id}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "Something went wrong",
      error,
    });
    console.error(error);
  }
});

module.exports = router;
