const express = require("express");
const router = express.Router();
const logger = require("../lib/logger");
router.use("/", require("../modules/auth/routes"));
router.use("/", require("../modules/campaigns/routes"));
router.use("/", require("../modules/leads/routes"));
router.use("/", require("../modules/clicks/routes"));
router.use("/", require("../modules/payments/routes"));
router.use("/", require("../modules/users/routes"));
router.use("/", require("../modules/ban/routes"));
router.use("/", require("../modules/gateway-settings/routes"));
router.use("/", require("../modules/telegram/routes"));
router.use("/", require("../modules/custom-amount/routes"));
router.use("/", require("../modules/billing/routes"));
router.use("/", require("../modules/postback/routes"));
router.use("/", require("../modules/tracking/routes"));
router.use("/", require("../modules/dashboard/routes"));
router.use("/", require("../modules/reports/routes"));
router.use("/", require("../modules/apis/routes"));

router.use("/api/v1/test", (req, res) => {
  res.json({ message: "Hello World!" });
  logger.info(req.headers);
  console.log(req.headers);
});

module.exports = router;
