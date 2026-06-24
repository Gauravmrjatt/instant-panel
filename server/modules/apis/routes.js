const router = require("express").Router();
const ctrl = require("./controller");

router.get("/api/v1/view/camp/:apikey", ctrl.getCamp);
router.get("/api/v1/checkRefer/:token/:offerid", ctrl.checkRefer);
router.get("/api/v1/user/:token/:offerid", ctrl.userAPI);
router.get("/api/v1/checkPending/:token/:offerid", ctrl.checkPending);
router.get("/api/v1/releasePending", ctrl.releasePending);

router.get("/api/v1/external/campaign/:apiKey", ctrl.getCamp);
router.get("/api/v1/external/refer-leads/:token/:offerId", ctrl.checkRefer);
router.get("/api/v1/external/user-leads/:token/:offerId", ctrl.userAPI);
router.get("/api/v1/external/pending-payments/:token/:offerId", ctrl.checkPending);
router.post("/api/v1/external/release-pending/:token/:offerId", ctrl.releasePending);

module.exports = router;
