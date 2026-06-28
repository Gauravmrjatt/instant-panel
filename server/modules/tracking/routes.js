const router = require("express").Router();
const ctrl = require("./controller");

router.get("/api/v1/click/:camp", ctrl.track);

router.get("/api/v1/tracking/:campId", ctrl.track);

module.exports = router;
