const service = require("./service");
const Notification = require("../../lib/handelNotification");

async function getPayments(req, res) {
  try {
    const result = await service.getPayments(req.user.db._id);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Somthing went wrong", error });
  }
}

async function updatePayment(req, res) {
  try {
    const userDetails = req.user.db;
    const leadId = req.params.leadId || req.body.ID;
    const { getEvent: event } = req.body;
    if (!leadId || !event) return res.json({ status: false, msg: "Both are required" });
    const result = await service.processPaymentForLead(userDetails._id, leadId, event, userDetails.tgId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function payToUser(req, res) {
  try {
    const userDetails = req.user.db;
    const result = await service.manualPayToUser(userDetails._id, req.body, req.ip);
    if (result.tgText) Notification(userDetails.tgId.chatId, result.tgText);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function getPendingPayments(req, res) {
  try {
    const campaignId = req.params.id || req.query.campaignId;
    const result = await service.getPendingPayments(req.user.db._id, campaignId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function approvePending(req, res) {
  try {
    const userDetails = req.user.db;
    const campaignId = req.params.campaignId || req.params.id;
    const { number, comment } = req.body;
    const result = await service.approvePendingPayments(userDetails._id, campaignId, number, comment);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function rejectPending(req, res) {
  try {
    const campaignId = req.params.campaignId || req.params.id;
    const result = await service.rejectPendingPayments(req.user.db._id, campaignId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { getPayments, updatePayment, payToUser, getPendingPayments, approvePending, rejectPending };
