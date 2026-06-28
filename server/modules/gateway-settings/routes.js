const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/gateway-settings", authValid, authValidWithDb, ctrl.getSettings);
router.post("/update/gateway-settings", authValid, authValidWithDb, ctrl.updateSettings);

router.get("/api/v1/gateway-settings", authValid, authValidWithDb, ctrl.getSettings);
router.put("/api/v1/gateway-settings", authValid, authValidWithDb, ctrl.updateSettings);

module.exports = router;
