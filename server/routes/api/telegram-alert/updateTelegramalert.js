const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../../pages/myDetails.json")
const User = require("../../../models/Users")

router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const body = req.body;
        const gateway = await User.findOneAndUpdate({ _id: userDetails._id }, { tgId: { ...body } })
        if (!gateway) {
            res.json({
                status: false,
                msg: "Somthing Went Wrong",
                chatID: null,
                contact: null
            })
        } else {
            res.json({
                status: true,
                msg: "Telegram Settings Updated Successfully!",
            })
        }
    } catch (error) {
        res.json({
            status: false,
            msg: "Internal Server Error",
            error
        })
    }

})

module.exports = router