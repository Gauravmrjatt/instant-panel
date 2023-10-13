const express = require("express")
const router = express.Router()
const User = require("../../../models/Users")
const Campaing = require("../../../models/Campaigns")
const Lead = require("../../../models/Leads")
const Click = require("../../../models/Click")
router.get("/:token/:offerid", async (req, res) => {
    try {
        const { token, offerid } = req.params
        const { number } = req.query
        let event = req.params
        if (event) {
            event = {
                $eq: event
            }
        } else {
            event = null
        }
        if (!token) {
            return res.json({
                status: false,
                msg: "Api key is missing",
            })
        }
        if (!offerid) {
            return res.json({
                status: false,
                msg: "offerid is missing",
            })
        }
        if (isNaN(offerid)) {
            return res.json({
                status: false,
                msg: "invalid offer Id",
            })
        }
        if (!number) {
            return res.json({
                status: false,
                msg: "number is missing",
            })
        }
        const isUser = await User.findOne({ PostbackToken: token })
        if (!isUser) {
            return res.json({
                status: true,
                msg: "Api key is Invalid!",
            })
        }
        const isOffer = await Campaing.findOne({ userId: isUser._id, offerID: offerid })
        if (!isOffer) {
            return res.json({
                status: true,
                msg: "No Campaing found with this offer Id",
            })
        }
        const [clicks, refers] = await Promise.all([
            Click.find({
                campId: isOffer._id,
                refer: number
            }),
            Lead.find({
                campId: isOffer._id,
                refer: number,
            }).select(["user", "refer", "userAmount", "referAmount", "event", "status", "paymentStatus", "click", "payMessage", "referPaymentStatus", "referPayMessage", "-_id", "createdAt"])
        ])
        return res.json({
            status: true,
            msg: "Refers Details found",
            //get all events and filter user and refer amount 
            count: refers.length,
            clicks: clicks.length,
            data: [
                ...refers
            ]
        })
    } catch (error) {
        return res.json({
            status: true,
            msg: "internal server error",
            error
        })
    }
})

module.exports = router