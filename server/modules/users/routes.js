const router = require("express").Router();
const ctrl = require("./controller");
const { authValid, authValidWithDb } = require("../../middlewares/auth");

router.get("/get/user", authValid, authValidWithDb, ctrl.getProfile);
router.get("/api/v1/users/me", authValid, authValidWithDb, ctrl.getProfile);
router.get("/api/v1/user", authValid, authValidWithDb, ctrl.getProfile);
router.get("/get/logins", authValid, authValidWithDb, ctrl.getSessions);
router.post("/upload/user-profile", authValid, authValidWithDb, ctrl.uploadPhoto);

router.get("/api/v1/users/me/sessions", authValid, authValidWithDb, ctrl.getSessions);
router.post("/api/v1/users/me/avatar", authValid, authValidWithDb, ctrl.uploadPhoto);

module.exports = router;
