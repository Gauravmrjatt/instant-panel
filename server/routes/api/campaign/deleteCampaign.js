const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../../pages/myDetails.json");
const Campaign = require("../../../models/Campaigns");

router.post("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;
    const { _id } = req.body
    if (!_id) {
        return res.status(400).json({ status: false, message: "Missing _id field" });
    }
    try {
        const Campaigns = await Campaign.findByIdAndDelete({ userId: userDetails._id, _id });
        res.json({
            status: true,
            msg: 'Deleted Successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;
