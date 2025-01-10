const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const GatewaySettings = require("../../../models/GatewaySettings");
const redisClient = require("../../../lib/redisClient");
router.post("/", authValid, authValidWithDb, async (req, res) => {
  const userDetails = req.user.db;
  const { type, guid, url } = req.body;
  const gateway = await GatewaySettings.findOneAndUpdate(
    { userId: userDetails._id },
    { type, guid, url }
  );
  await redisClient.del(`gatewaySetting:${userDetails._id}`);
  if (!gateway) {
    const gatewayData = new GatewaySettings({
      userId: userDetails._id,
      user: userDetails.userId,
    });
    gatewayData.save();
    res.json({
      status: true,
      msg: "Gateway Settings Found Successfully!",
      type: gatewayData.type,
      guid: gatewayData.guid,
      url: gatewayData.url,
    });
  } else {
    res.json({
      status: true,
      msg: "Gateway Settings Updated Successfully!",
      type: gateway.type,
      guid: gateway.guid,
      url: gateway.url,
    });
  }
});

module.exports = router;
