const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/click/:id", authValid, authValidWithDb, ctrl.getClick);
router.get("/export/click/:id", authValid, authValidWithDb, ctrl.exportClicks);
router.post("/get/click/search", authValid, authValidWithDb, ctrl.search);

router.get("/api/v1/clicks/:id", authValid, authValidWithDb, ctrl.getClick);
router.get("/api/v1/clicks/:id/export", authValid, authValidWithDb, ctrl.exportClicks);
router.post("/api/v1/clicks/search", authValid, authValidWithDb, ctrl.search);

module.exports = router;
