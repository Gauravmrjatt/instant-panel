const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../../pages/myDetails.json")

const CustomAmount = require("../../../models/CustomAmount")
router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const { camp, ...body } = req.body;
        const userDetails = req.user.db;
        try {
            const isExist = await CustomAmount.findOne({
                campId: camp,
                event: body.event,
                number: body.number
            })
            if (isExist) {
                return res.json({
                    status: false,
                    msg: "This number is already configred for custom amount",
                    id: camp._id
                })
            }
        } catch (error) {
            res.json({
                status: false,
                msg: "internal server error ",
                error: error.message
            })
        }
        const newCampaign = new CustomAmount({
            userId: userDetails._id,
            user: userDetails.userId,
            ...body,
            campId: camp
        })

        try {
            const camp = await newCampaign.save();
            res.json({
                status: true,
                msg: "custom details added successfully",
                id: camp._id
            })
        } catch (error) {
            res.json({
                status: false,
                msg: "somthing went wrong",
                error: error.message
            })
        }

    } catch (error) {
        res.json({
            status: false,
            msg: "internal server error ",
            error: error.message
        })
    }
})

module.exports = router