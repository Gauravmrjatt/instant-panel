const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../../pages/myDetails.json")
const Ban = require("../../../models/Ban")

router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const { number } = req.body;
        const checkBan = await Ban.findOne({ _id: userDetails._id, number })
        if (checkBan) {
            res.json({
                status: false,
                msg: "Number has already banned",
            })
        }
        const ban = new Ban({
            userId: userDetails._id,
            user: userDetails.userId,
            number
        })

        ban.save()
        if (!ban) {
            res.json({
                status: false,
                msg: "Somthing Went Wrong",
            })
        } else {
            res.json({
                status: true,
                msg: "banned Successfully!",
            })
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router