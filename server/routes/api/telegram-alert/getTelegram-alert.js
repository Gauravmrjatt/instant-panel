const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../../pages/myDetails.json")
const User = require("../../../models/Users")

router.get("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;

    const gateway = await User.findOne({ _id: userDetails._id })
    if (!gateway) {
        res.json({
            status: false,
            msg: "Somthing Went Wrong",
            chatId: null,
            contact: null
        })
    } else {
        res.json({
            status: true,
            msg: "Telegram Details Found Successfully!",
            chatId: gateway.tgId.chatId ?? null,
            contact: gateway.tgId.contact ?? null,
            username: gateway.tgId.username ?? null,
            label: gateway.tgId.label ?? null,
        })
    }
})

module.exports = router