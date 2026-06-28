const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/payments", authValid, authValidWithDb, ctrl.getPayments);
router.post("/update/payment", authValid, authValidWithDb, ctrl.updatePayment);
router.post("/pay/user", authValid, authValidWithDb, ctrl.payToUser);
router.get("/get/pendingPayments/:id", authValid, authValidWithDb, ctrl.getPendingPayments);
router.post("/api/update/pendings/:id", authValid, authValidWithDb, ctrl.approvePending);
router.get("/api/update/pendings/:id", authValid, authValidWithDb, ctrl.rejectPending);

router.get("/api/v1/payments", authValid, authValidWithDb, ctrl.getPayments);
router.post("/api/v1/leads/:leadId/process-payment", authValid, authValidWithDb, ctrl.updatePayment);
router.post("/api/v1/payments/manual", authValid, authValidWithDb, ctrl.payToUser);
router.get("/api/v1/payments/pending", authValid, authValidWithDb, ctrl.getPendingPayments);
router.post("/api/v1/payments/pending/:campaignId/approve", authValid, authValidWithDb, ctrl.approvePending);
router.post("/api/v1/payments/pending/:campaignId/reject-all", authValid, authValidWithDb, ctrl.rejectPending);

module.exports = router;
