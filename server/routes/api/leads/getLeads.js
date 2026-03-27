const express = require("express");
const router = express.Router();
const Leads = require("../../../models/Leads");
const { authValid, authValidWithDb } = require("../../../middlewares/auth");

router.get("/:campId", authValid, authValidWithDb, async (req, res) => {
  try {
    const userDetails = req.user.db;
    const { campId } = req.params;
    if (!campId) {
      return res.json({
        status: false,
        msg: "campId is required",
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { campId, userId: userDetails._id };

    const [leads, totalCount] = await Promise.all([
      Leads.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v -userId -campId -clickId -uniqueClick")
        .lean(),
      Leads.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      status: true,
      msg: "Leads found Successfully!",
      count: leads.length,
      totalCount,
      totalPages,
      page,
      limit,
      data: leads,
    });
  } catch (error) {
    res.json({
      status: false,
      msg: "Something went wrong",
      error,
    });
  }
});

module.exports = router;
