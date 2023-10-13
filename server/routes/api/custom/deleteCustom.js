const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../../pages/myDetails.json")
const CustomAmount = require("../../../models/CustomAmount")

router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        if (req.body.data) {
            const data = req.body.data;
            if (data == 'all') {
                const custom = await CustomAmount.deleteMany({ userId: userDetails._id })
                if (!custom) {
                    res.json({
                        status: false,
                        msg: "Somthing Went Wrong",
                    })
                } else {
                    res.json({
                        status: true,
                        msg: "Action Successfully!",
                    })
                }
            } else {
                const custom = await CustomAmount.deleteMany({ _id: { $in: data }, userId: userDetails._id })
                if (!custom) {
                    res.json({
                        status: false,
                        msg: "Somthing Went Wrong",
                    })
                } else {
                    res.json({
                        status: true,
                        msg: "Action Successfully!",
                    })
                }
            }
        } else {
            const { _id } = req.body;
            const custom = await CustomAmount.findOneAndDelete({ _id, userId: userDetails._id })
            if (!custom) {
                res.json({
                    status: false,
                    msg: "Somthing Went Wrong",
                })
            } else {
                res.json({
                    status: true,
                    msg: "Action Successfully!",
                })
            }
        }
    } catch (error) {

    }

})

module.exports = router