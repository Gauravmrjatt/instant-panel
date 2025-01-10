const express = require("express");
const router = express.Router();
const Campaign = require("../../../models/Campaigns");
const Click = require("../../../models/Click");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const DeviceDetector = require("node-device-detector");
const redisClient = require("../../../lib/redisClient");

// Initialize the device detector only once
const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

// Generate UUID function
const generateUUID = () => uuidv4().replace(/-/g, "");

// Middleware to validate user and refer parameters
const validateUserAndRefer = (req, res, next) => {
  const { aff_click_id, sub_aff_id } = req.query;
  if (!aff_click_id || !sub_aff_id) {
    return res.status(400).json({
      status: false,
      msg: "aff_click_id and sub_aff_id are required",
    });
  }
  next();
};

// Middleware to fetch campaign details with caching
const fetchCampaignDetails = async (req, res, next) => {
  try {
    const { camp } = req.params;

    // Check cache for campaign details
    const cachedCampaign = await redisClient.get(`campaign:${camp}`);
    if (cachedCampaign) {
      // Use cached data
      req.campInfo = JSON.parse(cachedCampaign);
      return next();
    }

    // Fetch from database if not cached
    const campInfo = await Campaign.findOne({ _id: camp })
      .select("userId tracking")
      .exec();

    if (!campInfo) {
      return res.status(404).json({ status: false, msg: "Campaign not found" });
    }

    // Cache the campaign details
    await redisClient.setEx(`campaign:${camp}`, 3600, JSON.stringify(campInfo)); // Cache for 1 hour

    req.campInfo = campInfo;
    next();
  } catch (error) {
    console.error("Error in fetchCampaignDetails middleware:", error);
    res.status(500).json({ status: false, msg: "Something went wrong", error });
  }
};

// Middleware to save click information
const saveClick = async (req, res, next) => {
  try {
    const {
      aff_click_id,
      sub_aff_id,
      userIp,
      number,
      device: deviceQuery,
    } = req.query;

    // Use campaign details from previous middleware
    const campInfo = req.campInfo;

    // Generate click ID and get the client IP
    const click = generateUUID();
    const ip = userIp || requestIp.getClientIp(req);

    // Detect device details (if device info is provided)
    const device = deviceQuery
      ? detector.detect(deviceQuery)
      : { status: false, msg: "No device info provided" };

    // Save the click record
    await Click.create({
      userId: campInfo.userId,
      campId: campInfo._id,
      click,
      user: aff_click_id,
      refer: sub_aff_id,
      ip,
      device,
      number,
      params: req.query,
    });

    // Replace {click_id} in tracking URL
    req.replacedUrl = campInfo.tracking.replace(/{click_id}/g, click);
    next();
  } catch (error) {
    console.error("Error in saveClick middleware:", error);
    res.status(500).json({ status: false, msg: "Something went wrong", error });
  }
};

// Route handler
router.get(
  "/:camp",
  validateUserAndRefer,
  fetchCampaignDetails,
  saveClick,
  (req, res) => {
    res.status(200).json({
      status: true,
      url: req.replacedUrl,
      msg: "Redirect to the given URL..",
    });
  }
);

module.exports = router;
