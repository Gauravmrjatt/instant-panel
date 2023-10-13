const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../../pages/myDetails.json");
const Ban = require("../../../models/Ban");

router.get("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;
    try {
        const bans = await Ban.find({ userId: userDetails._id }).select(["number", "banDate"]).sort({ createdAt: -1 });
        res.json({
            status: true,
            count: bans.length,
            list: {
                bans
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;
