const express = require("express");
const router = express.Router();
const Click = require("../../../models/Click")
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const ObjectId = require('mongodb').ObjectId;
const Leads = require("../../../models/Leads")

router.get("/:id", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const { id } = req.params
        if (!id) {
            return res.json({
                status: false,
                msg: "Both are required"
            })
        }

        const Lead = await Leads.findOne({ _id: id, userId: userDetails._id }).populate("clickId")

        if (!Lead) {
            return res.json({
                status: false,
                msg: "Click not found",
            })
        }
        res.json({
            status: true,
            msg: "Click found Successfully!",
            leadData: Lead
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
