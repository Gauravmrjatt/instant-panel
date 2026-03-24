const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../myDetails.json")
const GatewaySettings = require("../../../models/GatewaySettings")

router.get("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;

    const gateway = await GatewaySettings.findOne({ userId: userDetails._id })
    if (!gateway) {
        const gatewayData = new GatewaySettings({
            userId: userDetails._id,
            user: userDetails.userId
        })
        gatewayData.save()
        res.json({
            status: true,
            msg: "Gateway Settings Found Successfully!",
            type: gatewayData.type,
            guid: gatewayData.guid,
            url: gatewayData.url
        })
    } else {
        res.json({
            status: true,
            msg: "Gateway Settings Found Successfully!",
            type: gateway.type,
            guid: gateway.guid,
            url: gateway.url,
        })
    }
})

module.exports = router