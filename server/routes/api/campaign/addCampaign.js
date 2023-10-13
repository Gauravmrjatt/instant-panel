const express = require("express")
const router = express.Router()
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const myDetails = require("../../../../pages/myDetails.json")

const Campaign = require("../../../models/Campaigns")
router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const { offerID } = req.body;
        const body = req.body;
        const userDetails = req.user.db;
        const newCampaign = new Campaign({
            userId: userDetails._id,
            user: userDetails.userId,
            ...body,
            uniqueOfferID: {
                offerID,
                user: userDetails.userId
            }
        })

        try {
            const camp = await newCampaign.save();
            res.json({
                status: true,
                msg: "campaign added successfully",
                id: camp._id
            })
        } catch (error) {
            if (error.message.includes("uniqueOfferID_1 dup key")) {
                res.json({
                    status: false,
                    msg: "duplicate offerid"
                })
            }
            else {
                res.json({
                    status: false,
                    msg: "somthing went wrong",
                    error: error.message
                })
            }
        }

    } catch (error) {
        if (error.message.includes("uniqueOfferID_1 dup key")) {
            res.json({
                status: false,
                msg: "duplicate offerid"
            })
        }
        else {
            res.json({
                status: false,
                msg: "somthing went wrong",
                error: error.message
            })
        }
    }
})

module.exports = router