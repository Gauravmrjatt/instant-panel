const express = require("express");
const router = express.Router();
const User = require("../../../models/Users");
const Campaing = require("../../../models/Campaigns");
const Lead = require("../../../models/Leads");
const Click = require("../../../models/Click");
router.get("/:token/:offerid", async (req, res) => {
  try {
    const { token, offerid } = req.params;
    const { number } = req.query;
    let event = req.params;
    if (event) {
      event = {
        $eq: event,
      };
    } else {
      event = null;
    }
    if (!token) {
      return res.json({
        status: false,
        msg: "Api key is missing",
      });
    }
    if (!offerid) {
      return res.json({
        status: false,
        msg: "offerid is missing",
      });
    }
    if (isNaN(offerid)) {
      return res.json({
        status: false,
        msg: "invalid offer Id",
      });
    }
    if (!number) {
      return res.json({
        status: false,
        msg: "number is missing",
      });
    }
    const isUser = await User.findOne({ PostbackToken: token });
    if (!isUser) {
      return res.json({
        status: true,
        msg: "Api key is Invalid!",
      });
    }
    const isOffer = await Campaing.findOne({
      userId: isUser._id,
      offerID: offerid,
    });
    if (!isOffer) {
      return res.json({
        status: true,
        msg: "No Campaing found with this offer Id",
      });
    }
    const [leads] = await Promise.all([
      Lead.find({
        campId: isOffer._id,
        user: number,
      }).select([
        "user",
        "click",
        "refer",
        "userAmount",
        "referAmount",
        "event",
        "status",
        "paymentStatus",
        "click",
        "clickId",
        "payMessage",
        "referPaymentStatus",
        "referPayMessage",
        "-_id",
        "createdAt",
      ]),
    ]);
    async function processLeads() {
      try {
        return Promise.all(
          leads.map(async (item) => {
            const clickDetails = await Click.findOne({ click: item.click });
            if (!clickDetails) {
              throw new Error(`Click not found for ${item.click}`);
            }
            const clickToConv =
              (item.createdAt - clickDetails.createdAt) / 1000;

            // Create a clean object without internal MongoDB properties
            const cleanItem = {
              click: item.click,
              user: item.user,
              userAmount: item.userAmount,
              referAmount: item.referAmount,
              refer: item.refer,
              event: item.event,
              status: item.status,
              paymentStatus: item.paymentStatus,
              payMessage: item.payMessage,
              referPaymentStatus: item.referPaymentStatus,
              referPayMessage: item.referPayMessage,
              createdAt: item.createdAt,
              clickToConv: clickToConv, // Add the calculated property
            };

            return cleanItem;
          })
        );
      } catch (error) {
        console.error("Error processing leads:", error);
        return []; // or handle the error accordingly
      }
    }

    const leadsnew = [];
    const data = await processLeads();
    return res.json({
      status: true,
      msg: "User Details found",
      //get all events and filter user and refer amount
      leadscount: leads.length,
      leads: data,
    });
  } catch (error) {
    return res.json({
      status: true,
      msg: "internal server error",
      error,
    });
  }
});

module.exports = router;
