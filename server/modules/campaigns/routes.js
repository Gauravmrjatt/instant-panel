const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.post("/add/campaign", authValid, authValidWithDb, ctrl.create);
router.get("/get/campaign", authValid, authValidWithDb, ctrl.list);
router.get("/get/campaign/:id", authValid, authValidWithDb, ctrl.getById);
router.post("/update/campaign", authValid, authValidWithDb, ctrl.update);
router.post("/delete/campaign", authValid, authValidWithDb, ctrl.remove);
router.get("/get/search", authValid, authValidWithDb, ctrl.search);

router.post("/api/v1/campaigns", authValid, authValidWithDb, ctrl.create);
router.get("/api/v1/campaigns", authValid, authValidWithDb, ctrl.list);
router.get("/api/v1/campaigns/:id", authValid, authValidWithDb, ctrl.getById);
router.patch("/api/v1/campaigns/:id", authValid, authValidWithDb, ctrl.update);
router.delete("/api/v1/campaigns/:id", authValid, authValidWithDb, ctrl.remove);
router.get("/api/v1/campaigns/search", authValid, authValidWithDb, ctrl.search);

module.exports = router;
