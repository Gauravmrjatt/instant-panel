const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../myDetails.json");
const CustomAmount = require("../../../models/CustomAmount");

router.get("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const custom = await CustomAmount.find({ userId: userDetails._id }).sort({ createdAt: -1 });
        res.json({
            status: true,
            count: custom.length,
            list: [
                ...custom
            ]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;
