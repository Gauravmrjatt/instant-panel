const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const PendingPayment = require("../../../models/PendingPayments")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;
const handelPayment = require("../../../lib/handelPayments")
const Leads = require("../../../models/Leads")
router.post("/:id", authValid, authValidWithDb, async (req, res) => {
    try {
        const { id } = req.params
        const { value } = req.body
        const { comment } = req.query
        const userDetails = req.user.db;
        const countPipeline = [
            {
                $match: {
                    userId: new ObjectId(userDetails._id),
                    status: {
                        $in: ['PENDING', 'ACCEPTED']
                    },
                    paymentStatus: {
                        $nin: ['ACCEPTED']
                    },
                    campId: new ObjectId(id),
                    user: value
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalamount: { $sum: '$userAmount' }
                }
            }
        ]
        const payments = await PendingPayment.find({
            userId: new ObjectId(userDetails._id),
            status: {
                $in: ['PENDING', 'ACCEPTED']
            },
            paymentStatus: {
                $nin: ['ACCEPTED']
            },
            type: "refer",
            campId: new ObjectId(id),
            user: value
        })
        const clicks = [];
        payments.forEach(element => {
            clicks.push(element.clickId)
        });

        const totalAmount = payments.reduce((sum, obj) => sum + obj.userAmount, 0);
        // console.log(clicks, totalAmount);
        // console.log(update);
        // // const countResults = await PendingPayment.aggregate(countPipeline);
        // // const { totalamount, _id } = countResults[0]
        const payment = await handelPayment(userDetails._id, value, totalAmount, comment);
        const status = payment.status
        const payMessage = payment.statusMessage || payment.message || payment.msg || "no message found"
        const [pending, lead] = await Promise.all([
            PendingPayment.updateMany({
                userId: new ObjectId(userDetails._id),
                status: {
                    $in: ['PENDING', 'ACCEPTED']
                },
                type: "refer",
                paymentStatus: {
                    $nin: ['ACCEPTED']
                },
                campId: new ObjectId(id),
                user: value,
                clickId: { $in: clicks }
            }, {
                status: 'ACCEPTED',
                paymentStatus: status,
                payMessage,
                message: "We have proceed your request please check payment status",
                response: payment
            }),
            Leads.updateMany({
                userId: new ObjectId(userDetails._id),
                status: "Approved",
                referPaymentStatus: 'PENDING',
                campId: new ObjectId(id),
                clickId: { $in: clicks }
            }, {
                referPaymentStatus: status,
                referPayMessage: payMessage,
            })
        ])
        res.json({
            status: true,
            data: {
                total: totalAmount,
                clicks
            },
            payment
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});
router.get("/:id", authValid, authValidWithDb, async (req, res) => {
    try {
        const { id } = req.params
        const userDetails = req.user.db;
        const payments = await PendingPayment.find({
            userId: new ObjectId(userDetails._id),
            status: {
                $in: ['PENDING', 'ACCEPTED']
            },
            paymentStatus: {
                $nin: ['ACCEPTED']
            },
            type: "refer",
            campId: new ObjectId(id),
        })
        const clicks = [];
        payments.forEach(element => {
            clicks.push(element.clickId)
        });

        const updateAll = await PendingPayment.updateMany({
            userId: new ObjectId(userDetails._id),
            status: {
                $in: ['PENDING', 'ACCEPTED']
            },
            paymentStatus: {
                $nin: ['ACCEPTED']
            },
            campId: new ObjectId(id),
        }, {
            status: 'REJECTED',
            paymentStatus: "REJECTED",
            payMessage: "Rejected by admin",
        })

        const Lead = await Leads.updateMany({
            userId: new ObjectId(userDetails._id),
            status: "Approved",
            referPaymentStatus: 'PENDING',
            campId: new ObjectId(id),
            clickId: { $in: clicks }
        }, {
            referPaymentStatus: "REJECTED",
            referPayMessage: "Rejected by admin",
        })
        res.json({
            status: true,
            msg: "all set to rejected"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;
