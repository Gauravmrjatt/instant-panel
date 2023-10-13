const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Leads = require("../../../models/Leads");
const Payments = require("../../../models/Payments");
const Campaign = require("../../../models/Campaigns")
const Click = require("../../../models/Click")
const Gateway = require("../../../models/GatewaySettings");
const axios = require("axios");
router.get("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userId = req.user.db._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const [leads, todayCount, yesterdayCount, pay, todayPay, yesterdayPay, paymentData, topCamps, camps, topUsers, clicks, sevenDay, sevenApproved, sevenRejected, sevenPending, dashText, totalClicks] =
            await Promise.all([
                Leads.countDocuments({ userId }),
                Leads.countDocuments({ userId, createdAt: { $gte: today } }),
                Leads.countDocuments({ userId, createdAt: { $gte: yesterday, $lt: today } }),
                Payments.aggregate([
                    { $match: { userId } },
                    {
                        $group: {
                            _id: {},
                            totalAmount: { $sum: "$amount" }
                        }
                    }
                ]),
                Payments.aggregate([
                    { $match: { userId, createdAt: { $gte: today } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            totalAmount: { $sum: "$amount" }
                        }
                    }
                ]),
                Payments.aggregate([
                    { $match: { userId, createdAt: { $gte: yesterday, $lt: today } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            totalAmount: { $sum: "$amount" }
                        }
                    }
                ]),
                getPaymentDataByDay(userId),
                Leads.aggregate([
                    {
                        $match: { userId }
                    },
                    {
                        $group: {
                            _id: "$campId",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    },
                    {
                        $limit: 5
                    },
                    {
                        $lookup: {
                            from: "campaigns", // Assuming the collection name is "Campaign"
                            localField: "_id",
                            foreignField: "_id",
                            as: "campaign"
                        }
                    },
                    {
                        $unwind: "$campaign"
                    },
                    {
                        $project: {
                            _id: 0,
                            offerID: "$campaign.offerID",
                            name: "$campaign.name",
                            count: 1
                        }
                    }
                ]),
                Campaign.countDocuments({ userId }),
                Payments.aggregate([
                    {
                        $match: { userId } // Replace `userId` with the desired user ID
                    },
                    {
                        $group: {
                            _id: "$number",
                            totalAmount: { $sum: "$amount" },
                            paymentCount: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            totalAmount: -1
                        }
                    },
                    {
                        $limit: 5
                    },
                ]),
                getClicksDataByDay(userId),
                getLeadsDaybyDay(userId),
                getLeadsDaybyDay(userId, 'Approved'),
                getLeadsDaybyDay(userId, 'Rejected'),
                getLeadsDaybyDay(userId, 'Pending'),
                getDashText(userId),
                Click.countDocuments({ userId })
            ]);

        const growthPercentage = yesterdayCount !== 0
            ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
            : 0;

        const payGrowth = yesterdayPay[0]?.totalAmount !== 0
            ? ((todayPay[0]?.totalAmount - yesterdayPay[0]?.totalAmount) / yesterdayPay[0]?.totalAmount) * 100
            : 0;
        res.json({
            status: true,
            camp: camps,
            leads: {
                all: leads,
                today: todayCount,
                yesterday: yesterdayCount,
                grow: growthPercentage
            },
            payments: {
                all: pay[0]?.totalAmount || 0,
                today: todayPay[0]?.totalAmount || 0,
                yesterday: yesterdayPay[0]?.totalAmount || 0,
                grow: payGrowth
            },
            paymentData,
            topCamps,
            topUsers,
            clicks,
            totalClicks: clicks.reduce((sum, current) => sum + current, 0),
            sevenLeads: {
                all: sevenDay,
                approved: sevenApproved,
                rejected: sevenRejected,
                pending: sevenPending
            },
            dashText,
            allClicks: totalClicks ?? 10
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});
router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userId = req.user.db._id;
        const { from, to } = req.body.date;

        if (!from || !to) {
            res.json({
                status: false,
                data: []
            });
            return;
        }

        const fromDate = new Date(from.year, from.month - 1, from.day);
        const toDate = new Date(to.year, to.month - 1, to.day);
        const [data, data2] = await Promise.all([
            Leads.aggregate([
                {
                    $match: {
                        userId,
                        createdAt: (fromDate.getTime() === toDate.getTime()) ? { $eq: fromDate } : { $gte: fromDate, $lte: toDate }
                    }
                },
                {
                    $group: {
                        _id: "$campId",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                {
                    $limit: 5
                },
                {
                    $lookup: {
                        from: "campaigns", // Assuming the collection name is "Campaign"
                        localField: "_id",
                        foreignField: "_id",
                        as: "campaign"
                    }
                },
                {
                    $unwind: "$campaign"
                },
                {
                    $project: {
                        _id: 0, // Exclude the _id field
                        offerID: "$campaign.offerID",
                        name: "$campaign.name",
                        count: 1
                    }
                }
            ]),
            Payments.aggregate([
                {
                    $match: {
                        userId,
                        createdAt: (fromDate === toDate) ? { $eq: fromDate } : { $gte: fromDate, $lte: toDate }
                    } // Replace `userId` with the desired user ID
                },
                {
                    $group: {
                        _id: "$number",
                        totalAmount: { $sum: "$amount" },
                        paymentCount: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        totalAmount: -1 // Sort by totalAmount in descending order
                    }
                },
                {
                    $limit: 5
                }
            ])
        ])
        res.json({
            status: true,
            data: data,
            users: data2
        });
        console.log(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// Helper function to retrieve payment data day by day for the last 7 days
async function getPaymentDataByDay(userId) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Start from 6 days ago to include today
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
        {
            $match: {
                userId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalAmount: { $sum: "$amount" }
            }
        }
    ];

    const results = await Payments.aggregate(pipeline);

    const paymentData = [];
    const paymentDates = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
        const formattedDate = formatDate(currentDate);
        paymentData.push(0);
        paymentDates.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const result of results) {
        const formattedDate = result._id;
        const index = paymentDates.indexOf(formattedDate);
        if (index !== -1) {
            paymentData[index] = result.totalAmount;
        }
    }

    return paymentData;
}
async function getClicksDataByDay(userId) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Start from 6 days ago to include today
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
        {
            $match: {
                userId,
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 } // Sort by date in ascending order
        }
    ];

    const results = await Click.aggregate(pipeline);

    const clickData = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
        const formattedDate = formatDate(currentDate);
        const result = results.find((r) => r._id === formattedDate);
        const count = result ? result.count : 0;
        clickData.push(count || 0);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return clickData;
}


// Helper function to format date as "YYYY-MM-DD"
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
async function getLeadsDaybyDay(userId, status = 'all') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Start from 6 days ago to include today
    startDate.setHours(0, 0, 0, 0);

    const match = {
        $match: {
            userId,
            createdAt: { $gte: startDate },
            ...(status !== 'all' && { status })
        }
    };

    const pipeline = [
        match,
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 } // Sort by date in ascending order
        }
    ];

    const results = await Leads.aggregate(pipeline);

    const leadData = Array(7).fill(0);
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const formattedDate = formatDate(currentDate);
        const result = results.find((r) => r._id === formattedDate);
        const count = result ? result.count : 0;
        leadData[i] = count;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return leadData;
}

async function getDashText(userId) {
    const data = await Gateway.findOne({ userId })
    if (!data) {
        return `Configure your Gateway Settings`
    }
    if (data.type == "Earning Area") {
        const res = await axios.get(`https://toolsadda.in/api/getBalance.php?guid=${data.guid}`)
        if (res.data.status == "ACCEPTED") {
            return `You have ₹${res.data.Balance} in your Earningarea Wallet add more from this button`
        } else {
            return `You have an Error while fetching Earningarea Wallet Balance : ${res.data.statusMessage}`
        }
    } else {
        return `Set you Gateway type to get Earningarea Wallet balance open Earningarea from this button`
    }
}
module.exports = router;
