const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/leads/:campId", authValid, authValidWithDb, ctrl.list);
router.get("/export/leads/:id", authValid, authValidWithDb, ctrl.exportLeads);
router.post("/update/leadStatus", authValid, authValidWithDb, ctrl.updateStatus);
router.post("/update/selected", authValid, authValidWithDb, ctrl.approve);
router.post("/leads/delete", authValid, authValidWithDb, ctrl.remove);

router.get("/api/v1/campaigns/:campId/leads", authValid, authValidWithDb, ctrl.list);
router.get("/api/v1/campaigns/:campId/leads/export", authValid, authValidWithDb, ctrl.exportLeads);
router.patch("/api/v1/leads/:id/status", authValid, authValidWithDb, ctrl.updateStatus);
router.post("/api/v1/leads/:id/approve", authValid, authValidWithDb, ctrl.approve);
router.post("/api/v1/leads/batch-delete", authValid, authValidWithDb, ctrl.remove);
router.post("/api/v1/leads/batch-status", authValid, authValidWithDb, ctrl.batchUpdateStatus);
router.post("/api/v1/leads/batch-approve", authValid, authValidWithDb, ctrl.batchApprove);

module.exports = router;
