const express = require("express")
const router = express.Router()
const User = require("../../../models/Users")
const Premium = require("../../../models/Premium")
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
router.get("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const { _id } = req.user.db
        const user = await User.findById({ _id }).select(['-_id', 'premium', 'premiumExpireDate', 'createdAt'])
        if (!user) {
            return res.json({
                status: false,
                msg: "Authentication failed"
            })
        }
        const payments = await Premium.findOne({ status: true }).sort({ ExpireAt: 1 });
        let PLAN, PURCHASED_AT, EXPIRE_AT, PURCHASED_AMOUNT
        if (!payments) {
            PLAN = "FREE"
            PURCHASED_AT = user.createdAt || user.updatedAt || "NOT PURACHSED"
            EXPIRE_AT = user.premiumExpireDate
            PURCHASED_AMOUNT = 0
        } else {

        }
        res.json({
            status: true,
            user,
            PLAN,
            PURCHASED_AT,
            EXPIRE_AT,
            PURCHASED_AMOUNT
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