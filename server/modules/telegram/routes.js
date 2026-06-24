const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/telegram-alert", authValid, authValidWithDb, ctrl.getAlert);
router.post("/update/telegram-alert", authValid, authValidWithDb, ctrl.updateAlert);

router.get("/api/v1/users/me/telegram-alert", authValid, authValidWithDb, ctrl.getAlert);
router.put("/api/v1/users/me/telegram-alert", authValid, authValidWithDb, ctrl.updateAlert);

module.exports = router;
