const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Campaign = require("../../../models/Campaigns");
const Leads = require("../../../models/Leads");
const Clicks = require("../../../models/Click");

router.get("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;
    try {
        const { _id: userId } = userDetails;
        let range = null;
        let match = { userId };

        if (req.query.range && req.query.range != `""`) {
            const { from, to } = JSON.parse(req.query.range);
            const fromDate = new Date(from.year, from.month - 1, from.day);
            const toDate = new Date(to.year, to.month - 1, to.day);

            if (from && to) {
                var matchTotime = (fromDate === toDate) ? { $eq: { fromDate } } : {
                    $gte: fromDate,
                    $lte: toDate,
                };
                match = {
                    userId,
                    createdAt: matchTotime
                };
            }
        }

        const countPipeline = [
            {
                $match: match,
            },
            {
                $lookup: {
                    from: "leads",
                    localField: "_id",
                    foreignField: "campId",
                    as: "leadsCount",
                },
            },
            {
                $lookup: {
                    from: "clicks",
                    localField: "_id",
                    foreignField: "campId",
                    as: "clicksCount",
                },
            },
            {
                $lookup: {
                    from: "payments",
                    localField: "_id",
                    foreignField: "campId",
                    as: "payments",
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    _id: 1,
                    campaignId: "$_id",
                    leadsCount: { $size: "$leadsCount" },
                    clicksCount: { $size: "$clicksCount" },
                    totalAmount: { $sum: "$payments.amount" },
                    name: 1,
                    offerID: 1,
                },
            },
        ];

        if (range) {
            countPipeline.unshift({ $match: range });
        }

        const countResults = await Campaign.aggregate(countPipeline);

        const leadsCounts = countResults.map(
            ({
                campaignId,
                leadsCount,
                clicksCount,
                totalAmount,
                name,
                offerID,
            }) => ({
                id: campaignId,
                leadsCount,
                clicksCount,
                totalAmount,
                name,
                offerID,
                cr: Math.round(
                    clicksCount !== 0 ? (leadsCount / clicksCount) * 100 : 0
                ),
            })
        );

        res.json({
            status: true,
            data: leadsCounts,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;
