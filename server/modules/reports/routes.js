const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/reports", authValid, authValidWithDb, ctrl.getReports);
router.get("/get/new/reports/:id", authValid, authValidWithDb, ctrl.getNewReport);

router.get("/api/v1/reports", authValid, authValidWithDb, ctrl.getReports);
router.get("/api/v1/campaigns/:id/report", authValid, authValidWithDb, ctrl.getNewReport);

module.exports = router;
