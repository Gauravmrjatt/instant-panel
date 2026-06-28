const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.post("/api/v1/custom", authValid, authValidWithDb, ctrl.create);
router.get("/get/custom", authValid, authValidWithDb, ctrl.list);
router.post("/detete/custom", authValid, authValidWithDb, ctrl.remove);
router.post("/api/v1/update/custom/:apikey", ctrl.upsertByApiKey);
router.post("/api/v1/get/custom/:apikey", ctrl.getByApiKey);

router.post("/api/v1/custom-amounts", authValid, authValidWithDb, ctrl.create);
router.get("/api/v1/custom-amounts", authValid, authValidWithDb, ctrl.list);
router.delete("/api/v1/custom-amounts/:id", authValid, authValidWithDb, ctrl.remove);
router.post("/api/v1/external/custom-amount/:apiKey", ctrl.upsertByApiKey);
router.get("/api/v1/external/custom-amount/:apiKey", ctrl.getByApiKey);

module.exports = router;
