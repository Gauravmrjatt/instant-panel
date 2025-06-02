const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Click = require("../../../models/Click");
const { Parser } = require("json2csv");

router.get("/:id", authValid, authValidWithDb, async (req, res) => {
  try {
    const userDetails = req.user.db;
    const { id } = req.params;

    // Fetch the clicks data including 'params'
    const clicks = await Click.find({
      userId: userDetails._id,
      campId: id,
    }).select("click user refer ip createdAt params");

    // Flatten params field
    const flattenedClicks = clicks.map((doc) => {
      const obj = doc.toObject();
      if (obj.params && typeof obj.params === "object") {
        for (const key in obj.params) {
          obj[`params.${key}`] = obj.params[key];
        }
      }
      delete obj.params;
      return obj;
    });

    // Collect dynamic keys from params
    const paramKeys = [
      ...new Set(
        flattenedClicks.flatMap((obj) =>
          Object.keys(obj).filter((key) => key.startsWith("params."))
        )
      ),
    ];

    const staticFields = ["click", "user", "refer", "ip", "createdAt"];
    const fields = [...staticFields, ...paramKeys];

    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(flattenedClicks);

    // Set response headers
    res.header("Content-Type", "text/csv");
    res.attachment(`clicks-${id}.csv`);
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
