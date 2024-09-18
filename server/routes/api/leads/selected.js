const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const Leads = require("../../../models/Leads");
const Payment = require("../../../models/Payments");
const handelPayment = require("../../../lib/handelManualPayments");
router.post("/", authValid, authValidWithDb, async (req, res) => {
  try {
    const userDetails = req.user.db;
    const { leadStatus, ID } = req.body;
    if (!ID) {
      return res.json({
        status: false,
        msg: "Both are  required",
      });
    }
    const Lead = await Leads.findByIdAndUpdate(
      { _id: ID, userId: userDetails._id },
      { status: leadStatus }
    ).populate({
      path: "clickId",
      populate: {
        path: "campId",
      },
    });

    if (!Lead) {
      return res.json({
        status: false,
        msg: "Lead not found",
      });
    }
    const event = Lead.event;
    if (leadStatus == "Approved") {
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
      const payments = await Payment.find({
        userId: userDetails._id,
        event: Lead.event,
        clickId: Lead.clickId._id,
      });

      let paymentStatus = false;
      if (payments.length > 0) {
        paymentStatus = true;
        return res.json({
          status: true,
          msg: "Status Updated Successfully!",
        });
      }
      handelPayment(userDetails._id, eventData, Lead, userDetails.tgId);
      return res.json({
        status: true,
        msg: "Status Updated Successfully & Payment Done",
      });
    }
    return res.json({
      status: true,
      msg: "Status Updated Successfully!",
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
