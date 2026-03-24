const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../myDetails.json");
const Campaign = require("../../../models/Campaigns");
const redisClient = require("../../../lib/redisClient");

router.post("/", authValid, authValidWithDb, async (req, res) => {
  const userDetails = req.user.db;
  const { _id, data } = req.body;
  if (!_id) {
    return res
      .status(400)
      .json({ status: false, message: "Missing _id field" });
  }
  try {
    const Campaigns = await Campaign.findByIdAndUpdate(
      { userId: userDetails._id, _id },
      { ...data }
    );
    res.json({
      status: true,
      data: Campaigns,
    });
    await redisClient.setEx(
      `campaign:${_id}`,
      3600,
      JSON.stringify({
        _id,
        userId: userDetails._id,
        tracking: data.tracking,
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

module.exports = router;
