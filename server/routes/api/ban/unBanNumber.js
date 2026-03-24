const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../myDetails.json")
const Ban = require("../../../models/Ban")

router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        if (req.body.data) {
            const data = req.body.data;
            if (data == 'all') {
                const ban = await Ban.deleteMany({ userId: userDetails._id })
                if (!ban) {
                    res.json({
                        status: false,
                        msg: "Somthing Went Wrong",
                    })
                } else {
                    res.json({
                        status: true,
                        msg: "Unbanned Successfully!",
                    })
                }
            } else {
                const ban = await Ban.deleteMany({ _id: { $in: data }, userId: userDetails._id })
                if (!ban) {
                    res.json({
                        status: false,
                        msg: "Somthing Went Wrong",
                    })
                } else {
                    res.json({
                        status: true,
                        msg: "Unbanned Successfully!",
                    })
                }
            }
        } else {
            const { _id } = req.body;
            const ban = await Ban.findOneAndDelete({ _id, userId: userDetails._id })
            if (!ban) {
                res.json({
                    status: false,
                    msg: "Somthing Went Wrong",
                })
            } else {
                res.json({
                    status: true,
                    msg: "Unbanned Successfully!",
                })
            }
        }
    } catch (error) {

    }

})

module.exports = router