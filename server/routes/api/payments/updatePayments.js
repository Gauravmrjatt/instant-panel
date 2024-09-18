const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Leads = require("../../../models/Leads");
const Payment = require("../../../models/Payments");
const handelPayment = require("../../../lib/handelManualPayments");
router.post("/", authValid, authValidWithDb, async (req, res) => {
  try {
    const userDetails = req.user.db;
    const { getEvent: event, ID: id } = req.body;
    if (!id || !event) {
      return res.json({
        status: false,
        msg: "Both are required",
      });
    }

    const Lead = await Leads.findOne({
      _id: id,
      userId: userDetails._id,
    }).populate({
      path: "clickId",
      populate: {
        path: "campId",
      },
    });
    const eventData = Lead.clickId.campId.events.find((eventData, index) => {
      if (eventData.name === event) {
        return true;
      }
      return false;
    });
    if (!eventData) {
      return res.json({
        status: false,
        msg: "Event not found",
      });
    }
    if (!Lead) {
      return res.json({
        status: false,
        msg: "Click not found",
      });
    }
    const payments = await Payment.find({
      userId: userDetails._id,
      event,
      clickId: Lead.clickId._id,
    });
    let paymentStatus = false;
    if (payments.length > 0) {
      paymentStatus = true;
      return res.json({
        status: false,
        msg: "Payment already found!",
        leadData: Lead,
        payments: {
          status: paymentStatus,
          data: payments,
        },
      });
    }

    handelPayment(userDetails._id, eventData, Lead, userDetails.tgId);
    return res.json({
      status: true,
      msg: "all working",
    });
  } catch (error) {
    res.json({
      status: false,
      msg: "Somthing went wrong",
      error,
    });
    console.log(error);
  }
});

module.exports = router;
