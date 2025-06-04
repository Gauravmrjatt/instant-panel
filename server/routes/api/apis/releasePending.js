const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const PendingPayment = require("../../../models/PendingPayments");
const { ObjectId } = require("mongoose").Types;
const handelPayment = require("../../../lib/handelPayments");
const Leads = require("../../../models/Leads");

// Constants for status, payment status, and messages
const STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
};

const PAYMENT_STATUS = {
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  PENDING: "PENDING",
};

const MESSAGES = {
  INVALID_API_KEY: "Api key is Invalid!",
  NO_CAMPAIGN_FOUND: "No Campaign found with this offer Id",
  INVALID_APPROVE_TYPE: "Invalid approve type. Must be 'approve' or 'reject'.",
  PAYMENT_REJECTED: "Rejected by admin",
  PAYMENT_APPROVED:
    "We have processed your request. Please check payment status.",
  INTERNAL_ERROR: "Internal server error",
};

// Validate request parameters and body
const validateRequest = (req, res, next) => {
  const { token, offerid } = req.params;
  const { number, approve_type } = req.body;

  if (!token)
    return res.status(400).json({ status: false, msg: "Api key is missing" });
  if (!offerid)
    return res.status(400).json({ status: false, msg: "offerid is missing" });
  if (isNaN(offerid))
    return res.status(400).json({ status: false, msg: "invalid offer Id" });
  if (!number)
    return res.status(400).json({ status: false, msg: "number is missing" });
  if (!["approve", "reject"].includes(approve_type)) {
    return res
      .status(400)
      .json({ status: false, msg: MESSAGES.INVALID_APPROVE_TYPE });
  }

  next();
};

// Helper function to update pending payments and leads
const updatePaymentsAndLeads = async (
  userId,
  campId,
  number,
  clicks,
  updates
) => {
  await Promise.all([
    PendingPayment.updateMany(
      {
        userId: new ObjectId(userId),
        campId: new ObjectId(campId),
        user: number,
        clickId: { $in: clicks },
      },
      updates.pendingPaymentUpdates
    ),
    Leads.updateMany(
      {
        userId: new ObjectId(userId),
        campId: new ObjectId(campId),
        clickId: { $in: clicks },
      },
      updates.leadsUpdates
    ),
  ]);
};

router.post(
  "/:token/:offerid",
  validateRequest,
  async (req, res) => {
    try {
      const { token, offerid } = req.params;
      const { number, comment, approve_type } = req.body;

      // Find user and campaign
      const userDetails = await User.findOne({ PostbackToken: token }).exec();
      if (!userDetails) {
        return res
          .status(404)
          .json({ status: false, msg: MESSAGES.INVALID_API_KEY });
      }

      const isOffer = await Campaign.findOne({
        userId: userDetails._id,
        offerID: offerid,
      }).exec();
      if (!isOffer) {
        return res
          .status(404)
          .json({ status: false, msg: MESSAGES.NO_CAMPAIGN_FOUND });
      }

      // Find pending payments
      const payments = await PendingPayment.find({
        userId: new ObjectId(userDetails._id),
        status: { $in: [STATUS.PENDING, STATUS.ACCEPTED] },
        paymentStatus: { $ne: PAYMENT_STATUS.ACCEPTED },
        campId: new ObjectId(isOffer._id),
        user: number,
      }).exec();

      const clicks = payments.map((payment) => payment.clickId);

      if (approve_type === "approve") {
        const totalAmount = payments.reduce(
          (sum, obj) => sum + obj.userAmount,
          0
        );
        const payment = await handelPayment(
          userDetails._id,
          number,
          totalAmount,
          comment
        );

        const status = payment.status;
        const payMessage =
          payment.statusMessage ||
          payment.message ||
          payment.msg ||
          "No message found";

        await updatePaymentsAndLeads(
          userDetails._id,
          isOffer._id,
          number,
          clicks,
          {
            pendingPaymentUpdates: {
              status: STATUS.ACCEPTED,
              paymentStatus: status,
              payMessage,
              message: MESSAGES.PAYMENT_APPROVED,
              response: payment,
            },
            leadsUpdates: {
              referPaymentStatus: status,
              referPayMessage: payMessage,
            },
          }
        );

        return res.json({
          status: true,
          msg: "Payment approved successfully.",
          data: {
            total: totalAmount,
            clicks,
          },
          payment,
        });
      }

      if (approve_type === "reject") {
        await updatePaymentsAndLeads(
          userDetails._id,
          isOffer._id,
          number,
          clicks,
          {
            pendingPaymentUpdates: {
              status: STATUS.REJECTED,
              paymentStatus: PAYMENT_STATUS.REJECTED,
              payMessage: MESSAGES.PAYMENT_REJECTED,
            },
            leadsUpdates: {
              referPaymentStatus: PAYMENT_STATUS.REJECTED,
              referPayMessage: MESSAGES.PAYMENT_REJECTED,
            },
          }
        );

        return res.json({
          status: true,
          msg: "All payments rejected successfully.",
        });
      }
    } catch (error) {
      console.error("Error in POST /:token/:offerid:", error);
      res.status(500).json({ status: false, message: MESSAGES.INTERNAL_ERROR });
    }
  }
);

module.exports = router;
