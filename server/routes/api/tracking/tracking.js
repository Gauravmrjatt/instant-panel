const express = require("express");
const router = express.Router();
const Campaign = require("../../../models/Campaigns");
const Click = require("../../../models/Click");
const { v4: uuidv4 } = require('uuid');
const requestIp = require('request-ip');
const DeviceDetector = require('node-device-detector');
const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
});
function generateUUID() {
    return uuidv4().replace(/-/g, '');
}
const userAgent = 'Mozilla/5.0 (Linux; Android 5.0; NX505J Build/KVT49L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.78 Mobile Safari/537.36';
const result = detector.detect(userAgent);
// Middleware to validate user and refer parameters
const validateUserAndRefer = (req, res, next) => {
    const { aff_click_id, sub_aff_id } = req.query;
    if (!aff_click_id || !sub_aff_id) {
        return res.json({
            status: false,
            msg: 'aff_click_id  and sub_aff_id number are required'
        });
    }
    next();
};

// Middleware to save click information
const saveClick = async (req, res, next) => {

    try {
        const { camp } = req.params;
        const { aff_click_id, sub_aff_id, userIp } = req.query;
        const ip = userIp || requestIp.getClientIp(req);
        const device = req.query.device ? detector.detect(req.query.device) : { status: false, msg: "no device found" };
        const click = generateUUID();
        const campInfo = await Campaign.findOne({ _id: camp });

        if (!campInfo) {
            return res.json({ status: false, msg: "campaign not found" });
        }

        const clickSave = new Click({
            userId: campInfo.userId,
            campId: camp,
            click,
            user: aff_click_id,
            refer: sub_aff_id,
            ip,
            device,
            params: req.query
        });

        await clickSave.save();
        req.replacedUrl = campInfo.tracking.replace('{click_id}', click);
        next();
    } catch (error) {
        console.log(error);
        res.json({ status: false, msg: "something went wrong", err: error });
    }
};

// Route handling
router.get("/:camp", validateUserAndRefer, saveClick, (req, res) => {
    res.json({
        status: true,
        url: req.replacedUrl,
        msg: "redirect to the given url"
    })
});

module.exports = router;
