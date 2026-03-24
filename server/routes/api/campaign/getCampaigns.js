const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../myDetails.json");
const Campaign = require("../../../models/Campaigns");

router.get("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;
    try {
        const Campaigns = await Campaign.find({ userId: userDetails._id }).sort({ createdAt: -1 });
        res.json({
            status: true,
            data: Campaigns
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});
router.get("/:id", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;
    const ID = req.params.id
    if (!ID) {
        return res.status(400).json({ status: false, message: "Missing _id field" });
    }
    try {
        const Campaigns = await Campaign.findOne({ userId: userDetails._id, _id: ID });
        res.json({
            status: true,
            data: Campaigns
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
})
module.exports = router;
