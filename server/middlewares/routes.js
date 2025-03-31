const express = require("express");
const router = express.Router();
const auth = require("./auth");
//auth
router.use("/auth/login", require("../routes/auth/login"));
router.use("/auth/register", require("../routes/auth/register"));
router.use("/auth/forget", require("../routes/auth/forget"));
router.use("/auth/reset", require("../routes/auth/reset"));
//api
router.use("/api/v1/postback", require("../routes/api/postback/postback"));

//tracking
router.use("/api/v1/click", require("../routes/api/tracking/tracking"));
//custom
router.use("/api/v1/custom", require("../routes/api/custom/customAmount"));
router.use("/get/custom", require("../routes/api/custom/getCustom"));
router.use("/detete/custom", require("../routes/api/custom/deleteCustom"));
router.use("/api/v1/update/custom", require("../routes/api/custom/api"));
router.use("/api/v1/get/custom", require("../routes/api/custom/return.custom"));
router.use("/api/v1/view/camp", require("../routes/api/apis/getCamp"));
//fontend api
router.use("/get/postback", require("../routes/api/postback/getpostback"));
router.use(
  "/update/postback",
  require("../routes/api/postback/updatePostBackKey")
);

router.use(
  "/get/gateway-settings",
  require("../routes/api/gateway-settings/getGatewaySettings")
);
router.use(
  "/update/gateway-settings",
  require("../routes/api/gateway-settings/updateGateway-settings")
);

router.use(
  "/get/telegram-alert",
  require("../routes/api/telegram-alert/getTelegram-alert")
);
router.use(
  "/update/telegram-alert",
  require("../routes/api/telegram-alert/updateTelegramalert")
);

router.use("/get/number", require("../routes/api/ban/getBanned"));
router.use("/ban/number", require("../routes/api/ban/banNumber"));
router.use("/ban/unban", require("../routes/api/ban/unBanNumber"));

router.use("/get/user", require("../routes/api/user/getUser"));
router.use("/get/logins", require("../routes/api/user/getLogin"));
router.use("/upload/user-profile", require("../routes/api/user/uploadPhoto"));

//camp
router.use("/add/campaign", require("../routes/api/campaign/addCampaign"));
router.use("/get/campaign", require("../routes/api/campaign/getCampaigns"));
router.use(
  "/update/campaign",
  require("../routes/api/campaign/updateCampaign")
);
router.use(
  "/delete/campaign",
  require("../routes/api/campaign/deleteCampaign")
);

//lead
router.use("/get/leads", require("../routes/api/leads/getLeads"));
router.use("/export/leads", require("../routes/api/leads/export"));
router.use("/update/leadStatus", require("../routes/api/leads/updateStatus"));
router.use("/update/selected", require("../routes/api/leads/selected"));
//get and search click
router.use("/get/click", require("../routes/api/clicks/getClicks"));
router.use("/export/click", require("../routes/api/clicks/export"));
router.use("/get/click/search", require("../routes/api/clicks/search"));

//payments
router.use("/update/payment", require("../routes/api/payments/updatePayments"));
router.use("/pay/user", require("../routes/api/payments/payToUser"));
router.use("/get/payments", require("../routes/api/payments/getPaymentList"));
router.use("/get/pendingPayments", require("../routes/api/pendingPayments"));
router.use(
  "/api/update/pendings",
  require("../routes/api/pendingPayments/updatePending")
);

//dashboard
router.use(
  "/get/dashboard",
  require("../routes/api/dashboard/getDashboardData")
);
router.use("/get/search", require("../routes/api/search/getCamp"));
router.use("/get/reports", require("../routes/api/reports/reportsList"));
router.use("/get/new/reports", require("../routes/api/reports/new.reports"));

//apis
router.use("/api/v1/checkRefer", require("../routes/api/apis/checkRefer"));
router.use("/api/v1/user", require("../routes/api/apis/user"));
router.use("/api/v1/checkPending", require("../routes/api/apis/checkPending"));
router.use(
  "/api/v1/releasePending",
  require("../routes/api/apis/releasePending")
);

//billing
router.use("/get/billing", require("../routes/api/billing/getBilling"));

//logout
router.use("/logout", require("../routes/logout"));

module.exports = router;
