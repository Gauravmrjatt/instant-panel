const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/billing", authValid, authValidWithDb, ctrl.getBilling);

router.get("/api/v1/billing", authValid, authValidWithDb, ctrl.getBilling);

module.exports = router;
