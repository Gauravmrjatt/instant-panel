const router = require("express").Router();
const ctrl = require("./controller");

router.post("/auth/register", ctrl.register);
router.post("/auth/login", ctrl.login);
router.post("/auth/forget", ctrl.forget);
router.get("/auth/reset/check/:token", ctrl.resetTokenCheck);
router.post("/auth/reset/:token", ctrl.reset);
router.all("/logout", ctrl.logout);

// v2 API routes
router.post("/api/v1/auth/login", ctrl.login);
router.post("/api/v1/auth/register", ctrl.register);
router.post("/api/v1/auth/forgot-password", ctrl.forget);
router.get("/api/v1/auth/reset-token/:token", ctrl.resetTokenCheck);
router.post("/api/v1/auth/reset-password/:token", ctrl.reset);
router.post("/api/v1/auth/logout", ctrl.logout);
router.post("/api/v1/auth/logout/:sessionId", ctrl.logout);

module.exports = router;
