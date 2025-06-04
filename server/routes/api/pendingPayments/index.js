const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const PendingPayment = require("../../../models/PendingPayments")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;

router.get("/:id", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const { id } = req.params
        const countPipeline = [
            {
                $match: {
                    userId: new ObjectId(userDetails._id), // Use "user" instead of "userId" if that's the field in your collection
                    status: {
                        $in: ['PENDING', 'ACCEPTED']
                    },
                    paymentStatus: {
                        $nin: ['ACCEPTED']
                    },
                    campId: new ObjectId(id)
                }
            },
            {
                $group: {
                    _id: '$user',
                    total: { $sum: '$userAmount' }
                }
            }
        ]

        const countResults = await PendingPayment.aggregate(countPipeline);
        res.json({
            status: true,
            data: countResults,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;
