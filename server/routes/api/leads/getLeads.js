const express = require("express");
const router = express.Router();
const Leads = require("../../../models/Leads")
const { authValid, authValidWithDb } = require("../../../middlewares/auth")

router.get("/:campId", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const { campId } = req.params
        if (!campId) {
            return res.json({
                status: false,
                msg: "campId is required"
            })
        }
        const leads = await Leads.find({ campId, userId: userDetails._id }).sort({ createdAt: -1 })
        if (!leads) {
            res.json({
                status: false,
                msg: "No Leads found ",
                count: leads.length,
                data: leads
            })
        }
        res.json({
            status: true,
            msg: "Leads found Successfully!",
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.json({
            status: false,
            msg: "Somthing went wrong",
            error
        })
    }
});

module.exports = router;
