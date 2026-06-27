const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");
const rateLimit = require("express-rate-limit");

const postbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: { status: false, msg: "Too many postback requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/get/postback", authValid, authValidWithDb, ctrl.getConfig);
router.post("/edit/postback", authValid, authValidWithDb, ctrl.toggleGlobal);
router.post("/update/postback", authValid, authValidWithDb, ctrl.regenerateToken);

// Postback processing (no auth — called by affiliate networks)
router.get("/api/v1/postback/:PostbackToken/:event", ctrl.handleGlobalPostback);
router.get("/api/v1/campaign/postback/:CampaignToken/:event", ctrl.handleCampaignPostback);

// v2 API routes
router.get("/api/v1/postback/config", authValid, authValidWithDb, ctrl.getConfig);
router.patch("/api/v1/postback/config", authValid, authValidWithDb, ctrl.toggleGlobal);
router.post("/api/v1/postback/config/regenerate-token", authValid, authValidWithDb, ctrl.regenerateToken);

// postbaclk()
router.get("/api/v1/postback/:token/:event", ctrl.handleGlobalPostback);
router.get("/api/v1/campaigns/:campaignId/postback/:event", ctrl.handleCampaignPostback);

module.exports = router;