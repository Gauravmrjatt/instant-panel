const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/dashboard", authValid, authValidWithDb, ctrl.getDashboard);
router.post("/get/dashboard", authValid, authValidWithDb, ctrl.postDashboard);

router.get("/api/v1/dashboard", authValid, authValidWithDb, ctrl.getDashboard);
router.post("/api/v1/dashboard/range", authValid, authValidWithDb, ctrl.postDashboard);

module.exports = router;
