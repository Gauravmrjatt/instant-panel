const express = require("express");
const router = express.Router();
const User = require("../../../models/Users");
const Premium = require("../../../models/Premium");
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
router.get("/", authValid, authValidWithDb, async (req, res) => {
  try {
    const { _id } = req.user.db;
    if (!req.user.db.premium) {
      return res.status(403).json({
        status: false,
        msg: "You don't have any plan",
        code: 0,
        plan: req.user.db.plan,
        expireAt: req.user.db.premiumExpireDate,
      });
    }
  } catch (error) {
    console.log("/get/billing >>> ", error);
    return res.json({
      status: true,
      msg: "internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
