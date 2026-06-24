const User = require("../users/model");
const Campaign = require("../campaigns/model");
const Leads = require("../leads/model");
const Clicks = require("../clicks/model");
const PendingPayments = require("../payments/model").PendingPayment;
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const handelPayment = require("../../lib/handelPayments");

async function getCamp(req, res) {
  try {
    const { apikey } = req.params;
    const { camp } = req.query;
    if (!apikey) return res.json({ status: false, msg: "Api key is missing" });
    const isUser = await User.findOne({ PostbackToken: apikey }).lean();
    if (!isUser) return res.json({ status: false, msg: "Invalid api token" });
    const isCamp = await Campaign.findOne({ offerID: camp, userId: isUser._id }).lean();
    if (!isCamp) return res.json({ status: false, msg: "Invalid campaign id" });
    return res.json({ status: true, msg: "Details found", data: isCamp });
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Internal server error", error: error.message });
  }
}

async function checkRefer(req, res) {
  try {
    const token = req.params.token;
    const offerid = req.params.offerid || req.params.offerId;
    const { number } = req.query;
    const isUser = await User.findOne({ PostbackToken: token }).lean();
    if (!isUser) return res.status(404).json({ status: false, msg: "Api key is Invalid!" });
    const isOffer = await Campaign.findOne({ userId: isUser._id, offerID: offerid }).lean();
    if (!isOffer) return res.status(404).json({ status: false, msg: "No Campaign found with this offer Id" });
    const [clicks, refers] = await Promise.all([
      Clicks.find({ campId: isOffer._id, refer: number }).lean(),
      Leads.find({ campId: isOffer._id, refer: number }).select(["user", "refer", "userAmount", "referAmount", "event", "status", "paymentStatus", "click", "clickId", "payMessage", "referPaymentStatus", "referPayMessage", "-_id", "createdAt"]).lean(),
    ]);
    return res.json({ status: true, msg: "Refers Details found", count: refers.length, clicks: clicks.length, data: refers });
  } catch (error) {
    console.error("Error in checkRefer:", error);
    return res.status(500).json({ status: false, msg: "Internal server error", error: error.message });
  }
}

async function userAPI(req, res) {
  try {
    const token = req.params.token;
    const offerid = req.params.offerid || req.params.offerId;
    const { number } = req.query;
    if (!token) return res.json({ status: false, msg: "Api key is missing" });
    if (!offerid) return res.json({ status: false, msg: "offerid is missing" });
    if (isNaN(offerid)) return res.json({ status: false, msg: "invalid offer Id" });
    if (!number) return res.json({ status: false, msg: "number is missing" });
    const isUser = await User.findOne({ PostbackToken: token }).lean();
    if (!isUser) return res.json({ status: true, msg: "Api key is Invalid!" });
    const isOffer = await Campaign.findOne({ userId: isUser._id, offerID: offerid }).lean();
    if (!isOffer) return res.json({ status: true, msg: "No Campaing found with this offer Id" });
    const leads = await Leads.find({ campId: isOffer._id, user: number }).select(["user", "click", "refer", "userAmount", "referAmount", "event", "status", "paymentStatus", "click", "clickId", "payMessage", "referPaymentStatus", "referPayMessage", "-_id", "createdAt"]).lean();
    const data = await Promise.all(leads.map(async (item) => {
      const clickDetails = await Clicks.findOne({ click: item.click }).lean();
      const clickToConv = clickDetails ? (new Date(item.createdAt) - new Date(clickDetails.createdAt)) / 1000 : 0;
      return { ...item, clickToConv };
    }));
    return res.json({ status: true, msg: "User Details found", leadscount: leads.length, leads: data });
  } catch (error) {
    console.error("Error in userAPI:", error);
    return res.json({ status: true, msg: "internal server error", error });
  }
}

async function checkPending(req, res) {
  try {
    const token = req.params.token;
    const offerid = req.params.offerid || req.params.offerId;
    const { number } = req.query;
    const isUser = await User.findOne({ PostbackToken: token }).lean();
    if (!isUser) return res.status(404).json({ status: false, msg: "Api key is Invalid!" });
    const isOffer = await Campaign.findOne({ userId: isUser._id, offerID: offerid }).lean();
    if (!isOffer) return res.status(404).json({ status: false, msg: "No Campaign found with this offer Id" });
    const result = await PendingPayments.aggregate([
      { $match: { campId: isOffer._id, user: number, status: { $in: ["PENDING", "ACCEPTED"] }, paymentStatus: { $nin: ["ACCEPTED"] } } },
      { $group: { _id: null, totalUserAmount: { $sum: "$userAmount" }, data: { $push: { clickId: "$clickId", createdAt: "$createdAt", event: "$event" } } } },
      { $project: { _id: 0, totalUserAmount: 1, data: 1 } },
    ]);
    if (result.length === 0) return res.status(404).json({ status: false, msg: "No pending payment found" });
    return res.json({ status: true, msg: "Pending payment found", totalUserAmount: result[0].totalUserAmount, data: result[0].data });
  } catch (error) {
    console.error("Error in checkPending:", error);
    return res.status(500).json({ status: false, msg: "Internal server error", error: error.message });
  }
}

async function releasePending(req, res) {
  try {
    const token = req.params.token || req.query.token;
    const offerid = req.params.offerId || req.params.offerid || req.query.offerid;
    const { number, comment } = req.query;
    const user = await User.findOne({ PostbackToken: token });
    if (!user) return res.json({ status: false, msg: "Invalid API key" });
    const campaign = await Campaign.findOne({ userId: user._id, offerID: offerid });
    if (!campaign) return res.json({ status: false, msg: "Campaign not found" });
    const payments = await PendingPayments.find({ userId: user._id, campId: campaign._id, status: "PENDING", user: number });
    const totalAmount = payments.reduce((sum, p) => sum + p.userAmount, 0);
    const paymentResult = await handelPayment(user._id, number, totalAmount, comment || "");
    await PendingPayments.updateMany({ userId: user._id, campId: campaign._id, status: "PENDING", user: number }, { status: "ACCEPTED", paymentStatus: paymentResult.status, payMessage: paymentResult.statusMessage || paymentResult.message || "no message found", response: paymentResult });
    return res.json({ status: true, payment: paymentResult, total: totalAmount });
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong" });
  }
}

module.exports = { getCamp, checkRefer, userAPI, checkPending, releasePending };
