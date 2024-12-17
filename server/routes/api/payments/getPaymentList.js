const express = require("express");
const router = express.Router();
const Payments = require("../../../models/Payments");
const { authValid, authValidWithDb } = require("../../../middlewares/auth");

router.get("/", authValid, authValidWithDb, async (req, res) => {
  try {
    const userDetails = req.user.db;
    const paid = await Payments.find({ userId: userDetails._id })
      .sort({ createdAt: -1 })
      .limit(2000);
    if (!Payments) {
      res.json({
        status: false,
        msg: "No Payment found ",
      });
    }

    res.json({
      status: true,
      msg: "Leads found Successfully!",
      count: paid.length,
      data: paid,
    });
  } catch (error) {
    res.json({
      status: false,
      msg: "Somthing went wrong",
      error,
    });
  }
});

module.exports = router;
