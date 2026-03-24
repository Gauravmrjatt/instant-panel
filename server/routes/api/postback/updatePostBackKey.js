const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../myDetails.json")
const User = require("../../../models/Users")
const { v4: uuidv4 } = require('uuid')

router.post("/", authValid, authValidWithDb, async (req, res) => {
    const newID = uuidv4()
    const { _id: userId } = req.user.db
    const result = await User.findByIdAndUpdate(userId, { PostbackToken: newID })
    if (!result) {
        return res.json({
            status: false,
            msg: "Error while updating key",
        })
    }
    const url = `${myDetails.domain}api/v1/postback/${newID}/{eventname}?p1={aff_click_id}&p2={sub_aff_id}&o={offerid}`
    res.json({
        status: true,
        msg: "Postback Updated Successfully",
        key: newID,
        url,
    })
})

module.exports = router
