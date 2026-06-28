const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/number", authValid, authValidWithDb, ctrl.getBanned);
router.post("/ban/number", authValid, authValidWithDb, ctrl.banNumber);
router.post("/ban/unban", authValid, authValidWithDb, ctrl.unban);

router.get("/api/v1/bans", authValid, authValidWithDb, ctrl.getBanned);
router.post("/api/v1/bans", authValid, authValidWithDb, ctrl.banNumber);
router.delete("/api/v1/bans/:id", authValid, authValidWithDb, ctrl.unban);

module.exports = router;
