const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../myDetails.json");
const Campaign = require("../../../models/Campaigns");

router.get("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;
    const userId = userDetails._id; // Retrieve the user ID from userDetails

    try {
        if (!req.query.text) {
            return res.json({
                status: false,
                msg: "text missing",
            });
        }

        const searchText = req.query.text;

        const query = {
            userId: userId,
            $or: [
                { name: { $regex: searchText, $options: "i" } },
                // {
                //     offerID: isNumericSearch ? parseInt(searchText) : { $regex: searchText, $options: "i" },
                // },
            ],
        };

        const campaigns = await Campaign.find(query);

        res.json({
            status: true,
            data: campaigns,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;
