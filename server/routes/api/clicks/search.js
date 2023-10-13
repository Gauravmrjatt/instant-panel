const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Click = require("../../../models/Click");

router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.json({
                status: false,
                msg: "Click IDs are required as an array",
            });
        }

        const results = await Click.find({ userId: userDetails._id, click: { $in: data } });

        if (!results || results.length === 0) {
            return res.json({
                status: false,
                msg: "Clicks not found",
            });
        }

        res.json({
            status: true,
            msg: "Clicks found successfully!",
            clickData: results,
        });
    } catch (error) {
        res.json({
            status: false,
            msg: "Something went wrong",
            error,
        });
        console.log(error);
    }
});

module.exports = router;
