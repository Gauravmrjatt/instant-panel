const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const Leads = require("../../../models/Leads")
const Payment = require("../../../models/Payments")
router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const { leadStatus, ID, event } = req.body
        if (!ID) {
            return res.json({
                status: false,
                msg: "Both are  required"
            })
        }
        const Lead = await Leads.findByIdAndUpdate({ _id: ID, userId: userDetails._id }, { status: leadStatus }).populate("clickId")
        const payments = await Payment.find({ userId: userDetails._id, event, clickId: Lead.clickId._id })

        if (!Lead) {
            return res.json({
                status: false,
                msg: "Click not found",
            })
        }
        Lead.status = leadStatus
        let paymentStatus = false;
        if (payments.length > 0) {
            paymentStatus = true
        }
        res.json({
            status: true,
            msg: "Click found Successfully!",
            leadData: Lead,
            payments: {
                status: paymentStatus,
                data: payments
            }
        })

    } catch (error) {
        res.json({
            status: false,
            msg: "Somthing went wrong",
            error
        })
        console.log(error);
    }
});

module.exports = router;
