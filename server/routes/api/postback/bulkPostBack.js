const express = require("express");
const router = express.Router();
const User = require("../../../models/Users");
const Click = require("../../../models/Click");
const Lead = require("../../../models/Leads");
const saveLead = require("../../../lib/saveLead")
const handelPayment = require("../../../lib/handelPostBackPayments")
// Middleware to validate required parameters
const checkParams = (req, res, next) => {
    const {
        PostbackToken,
        event
    } = req.params;
    const {
        click
    } = req.query;

    if (!PostbackToken || !click) {
        return res.json({
            status: false,
            msg: "PostbackToken and click are required",
        });
    }

    next();
};

router.get("/:PostbackToken/:event", checkParams, async (req, res) => {
    try {
        const {
            PostbackToken,
            event
        } = req.params;
        const {
            click
        } = req.query;
        const ip = req.ip;

        // Find user and click by IDs
        const [user, clickId] = await Promise.all([
            User.findOne({
                PostbackToken
            }),
            Click.findOne({
                click
            }).populate("campId"),
        ]);
        // chenge to same event
        const checkLead = await Lead.findOne({
            clickId: clickId._id,
            event
        });
        console.log(checkLead);
        if (checkLead) {
            return res.json({
                status: false,
                msg: "Click id has already Registered",
            });
        }

        // Check if user and click exist
        if (clickId.campId.ips.length > 0 && !clickId.campId.ips.includes(ip)) {
            // Save and rejected
            await saveLead({
                uniqueClick: {
                    campId: clickId.campId._id,
                    event,
                    clickId: clickId._id
                },
                userId: user._id,
                campId: clickId.campId._id,
                clickId: clickId._id,
                user: clickId.user,
                refer: clickId.refer,
                ip: clickId.ip,
                event,
                status: "REJECTED",
                message: "IP is not allowed",
                params: req.query,
                paymentStatus: "REJECTED"
            });
            return res.json({

                status: false,
                msg: "This IP is not allowed.",
            });
        }

        // Check if user and click exist
        if (!user) {
            return res.json({
                status: false,
                msg: "Invalid PostbackToken",
            });
        }
        if (!clickId) {
            return res.json({
                status: false,
                msg: "Invalid Click ID",
            });
        }

        // Check if event exists for the campaign
        let indexOfEvent
        const eventData = clickId.campId.events.find((eventData, index) => {
            if (eventData.name === event) {
                indexOfEvent = index
                return true;
            }
            return false;
        });

        if (!eventData) {
            return res.json({
                status: false,
                msg: "Invalid Event",
            });
        }

        // Check if user and refer numbers are different (if required)
        if (!clickId.campId.same && clickId.user.trim() === clickId.refer.trim()) {
            // Save and rejected
            await saveLead({
                uniqueClick: {
                    campId: clickId.campId._id,
                    event,
                    clickId: clickId._id
                },
                userId: user._id,
                campId: clickId.campId._id,
                clickId: clickId._id,
                user: clickId.user,
                refer: clickId.refer,
                ip: clickId.ip,
                event,
                status: "REJECTED",
                message: "User and refer number are the same",
                params: req.query,
                paymentStatus: "REJECTED"
            });
            return res.json({

                status: false,
                msg: "User and refer number are the same",
            });
        }

        // Check if IP has already claimed the offer (if required)
        if (
            clickId.campId.ip &&
            (await Lead.findOne({
                campId: clickId.campId._id,
                ip: clickId.ip,
                event
            }))
        ) {
            await saveLead({
                uniqueClick: {
                    campId: clickId.campId._id,
                    event,
                    clickId: clickId._id
                },
                userId: user._id,
                campId: clickId.campId._id,
                clickId: clickId._id,
                user: clickId.user,
                refer: clickId.refer,
                ip: clickId.ip,
                event,
                status: "REJECTED",
                message: "Duplicate IP Address",
                params: req.query,
                paymentStatus: "REJECTED"
            });
            return res.json({

                status: false,
                msg: "One IP can claim only once",
            });
        }

        // Check if user has already claimed the offer (if required)
        if (
            clickId.campId.paytm &&
            (await Lead.findOne({
                campId: clickId.campId._id,
                user: clickId.user,
                event
            }))
        ) {
            await saveLead({
                uniqueClick: {
                    campId: clickId.campId._id,
                    event,
                    clickId: clickId._id
                },
                userId: user._id,
                campId: clickId.campId._id,
                clickId: clickId._id,
                user: clickId.user,
                refer: clickId.refer,
                ip: clickId.ip,
                event,
                status: "Pending",
                message: "Duplicate User Number",
                params: req.query,
                paymentStatus: "PENDING"
            });
            return res.json({
                status: false,
                msg: "One user can claim only once",
            });
        }

        if (eventData.caps) {
            const leadCount = await Lead.countDocuments({
                campId: clickId.campId._id,
                event,
            });

            // Save and pending

            if (parseInt(eventData.caps) <= parseInt(leadCount)) {
                await saveLead({
                    uniqueClick: {
                        campId: clickId.campId._id,
                        event,
                        clickId: clickId._id
                    },
                    userId: user._id,
                    campId: clickId.campId._id,
                    clickId: clickId._id,
                    user: clickId.user,
                    refer: clickId.refer,
                    ip: clickId.ip,
                    event,
                    status: "Pending",
                    message: "All the Leads have completed",
                    params: req.query,
                    paymentStatus: "PENDING"
                });
                return res.json({

                    status: true,
                    msg: "This Lead caps has been reached",
                });
            }
        }
        if (indexOfEvent > 0) {
            const time = clickId.campId.events[(indexOfEvent - 1)].time
            const eventName = clickId.campId.events[(indexOfEvent - 1)].name
            if (time > 0) {
                const checkTime = await Lead.findOne({
                    campId: clickId.campId._id,
                    user: clickId.user,
                    event: eventName
                })
                //if not found add to pending ?? rejected??
                if (!checkTime) {
                    await saveLead({
                        uniqueClick: {
                            campId: clickId.campId._id,
                            event,
                            clickId: clickId._id
                        },
                        userId: user._id,
                        campId: clickId.campId._id,
                        clickId: clickId._id,
                        user: clickId.user,
                        refer: clickId.refer,
                        ip: clickId.ip,
                        event,
                        status: "Pending",
                        message: "Previous event not found",
                        params: req.query,
                        paymentStatus: "PENDING"
                    });
                    return res.json({

                        status: false,
                        msg: "Previous event not found",
                    });
                }
                const createdAt = checkTime.createdAt;
                const current = new Date();

                const timeDifference = (current - createdAt) / (1000 * 60);
                if (parseInt(timeDifference) <= parseInt(time)) {
                    await saveLead({
                        uniqueClick: {
                            campId: clickId.campId._id,
                            event,
                            clickId: clickId._id
                        },
                        userId: user._id,
                        campId: clickId.campId._id,
                        clickId: clickId._id,
                        user: clickId.user,
                        refer: clickId.refer,
                        ip: clickId.ip,
                        event,
                        status: "Pending",
                        message: "Time difference is less than as you set between to events.",
                        params: req.query,
                        paymentStatus: "PENDING"
                    });
                    return res.json({

                        status: false,
                        msg: "Time difference is less than as you set between to events.",
                    });
                }
            }
        }
        // Update the pending record with lead information
        if (eventData.payMode == "auto") {
            handelPayment(user._id, eventData,
                {
                    userId: user._id,
                    campId: clickId.campId._id,
                    clickId: clickId._id,
                    user: clickId.user,
                    refer: clickId.refer,
                    ip: clickId.ip,
                    event,
                    params: req.query,
                    uniqueClick: {
                        campId: clickId.campId._id,
                        event,
                        clickId: clickId._id
                    },
                },
                user.tgId,
                clickId.campId
            )
        } else {
            await saveLead({
                uniqueClick: {
                    campId: clickId.campId._id,
                    event,
                    clickId: clickId._id
                },
                userId: user._id,
                campId: clickId.campId._id,
                clickId: clickId._id,
                user: clickId.user,
                refer: clickId.refer,
                ip: clickId.ip,
                event,
                status: "Pending",
                message: 'This Lead request has been successfully completed. Payment is manual',
                params: req.query,
                paymentStatus: "PENDING",
                payMessage: "You have set payment mode to manual",


            })
        }
        return res.json({
            status: true,
            msg: "This Lead request has been successfully completed. Please check payment status.",
        });

    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            msg: "Something went wrong",
            err: error,
        });
    }
});

module.exports = router;