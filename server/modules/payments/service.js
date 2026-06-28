const Payments = require("./model");
const { PendingPayment } = require("./model");
const Leads = require("../leads/model");
const GetwaySettings = require("../gateway-settings/model");
const Ban = require("../ban/model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { default: axios } = require("axios");
const handelPayment = require("../../lib/handelPayments");
const handelManualPayment = require("../../lib/handelManualPayments");
const Notification = require("../../lib/handelNotification");

function generateRandomOrderId(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

function replaceAllPlaceholders(str, replacements) {
  for (const ph in replacements) str = str?.replace(new RegExp(ph, "g"), replacements[ph]);
  return str;
}

async function getPayments(userId) {
  const paid = await Payments.find({ userId }).sort({ createdAt: -1 }).limit(2000).lean();
  if (!Payments) return { status: false, msg: "No Payment found" };
  return { status: true, msg: "Leads found Successfully!", count: paid.length, data: paid };
}

async function manualPayToUser(userId, payData, ip) {
  const { amount, user, comment } = payData;
  if (!amount || !user) return { status: false, msg: "Number and Amount are required" };
  const checkban = await Ban.findOne({ userId, number: user });
  if (checkban) return { status: false, msg: "Number is Ban" };
  const gatewaySetting = await GetwaySettings.findOne({ userId });
  if (!gatewaySetting) return { status: false, msg: "Gateway Setting not found" };
  if (gatewaySetting.type === "Earning Area") {
    if (!gatewaySetting.guid) return { status: false, msg: "Guid not found" };
    const { data } = await axios.get(`https://toolsadda.in/nogetway.php?guid=${gatewaySetting.guid}&amo=${amount}&num=${user}&com=${comment}`);
    return { status: true, msg: "Request Successful", type: "ea", data, tgText: `<b>⚡️New Paid ✅\nNumber : ${user}\nAmount : ${amount}\nComment : ${comment}\n\nGateway :- EarningArea\n\nResponse : ${JSON.stringify(data)}\n</b>` };
  } else {
    if (!gatewaySetting.url) return { status: false, msg: "Url not found" };
    const replacements = { "{payout_number}": user, "{payout_amount}": amount, "{comment}": comment ?? "", "{order_id}": generateRandomOrderId(10) };
    const replacedUrl = replaceAllPlaceholders(gatewaySetting.url, replacements);
    const { data } = await axios.get(replacedUrl);
    return { status: true, msg: "Request Successful", type: "custom", data, tgText: `<b>⚡️New Paid ✅\nNumber : ${user}\nAmount : ${amount}\nComment : ${comment}\n\nGateway :- Custom\n\nResponse : ${JSON.stringify(data)}\n</b>` };
  }
}

async function processPaymentForLead(userId, leadId, event, tg) {
  if (!leadId || !event) return { status: false, msg: "Both are required" };
  const Lead = await Leads.findOne({ _id: leadId, userId }).populate({ path: "clickId", populate: { path: "campId" } });
  if (!Lead) return { status: false, msg: "Click not found" };
  const eventData = Lead.clickId.campId.events.find((ed) => ed.name === event);
  if (!eventData) return { status: false, msg: "Event not found" };
  const payments = await Payments.find({ userId, event, clickId: Lead.clickId._id });
  if (payments.length > 0) return { status: false, msg: "Payment already found!", leadData: Lead, payments: { status: true, data: payments } };
  handelManualPayment(userId, eventData, Lead, tg || {});
  return { status: true, msg: "all working" };
}

async function getPendingPayments(userId, campaignId) {
  const countResults = await PendingPayment.aggregate([
    { $match: { userId: new ObjectId(userId), status: { $in: ["PENDING", "ACCEPTED"] }, paymentStatus: { $nin: ["ACCEPTED"] }, campId: new ObjectId(campaignId) } },
    { $group: { _id: "$user", total: { $sum: "$userAmount" } } },
  ]);
  return { status: true, data: countResults };
}

async function approvePendingPayments(userId, campaignId, userNumber, comment) {
  const payments = await PendingPayment.find({ userId: new ObjectId(userId), status: { $in: ["PENDING", "ACCEPTED"] }, paymentStatus: { $nin: ["ACCEPTED"] }, type: "refer", campId: new ObjectId(campaignId), user: userNumber });
  const clicks = payments.map((p) => p.clickId);
  const totalAmount = payments.reduce((sum, obj) => sum + obj.userAmount, 0);
  const payment = await handelPayment(userId, userNumber, totalAmount, comment);
  const status = payment.status;
  const payMessage = payment.statusMessage || payment.message || payment.msg || "no message found";
  await Promise.all([
    PendingPayment.updateMany({ userId: new ObjectId(userId), status: { $in: ["PENDING", "ACCEPTED"] }, type: "refer", paymentStatus: { $nin: ["ACCEPTED"] }, campId: new ObjectId(campaignId), user: userNumber, clickId: { $in: clicks } }, { status: "ACCEPTED", paymentStatus: status, payMessage, message: "We have proceed your request please check payment status", response: payment }),
    Leads.updateMany({ userId: new ObjectId(userId), status: "Approved", referPaymentStatus: "PENDING", campId: new ObjectId(campaignId), clickId: { $in: clicks } }, { referPaymentStatus: status, referPayMessage: payMessage }),
  ]);
  return { status: true, data: { total: totalAmount, clicks }, payment };
}

async function rejectPendingPayments(userId, campaignId) {
  const payments = await PendingPayment.find({ userId: new ObjectId(userId), status: { $in: ["PENDING", "ACCEPTED"] }, paymentStatus: { $nin: ["ACCEPTED"] }, type: "refer", campId: new ObjectId(campaignId) });
  const clicks = payments.map((p) => p.clickId);
  await Promise.all([
    PendingPayment.updateMany({ userId: new ObjectId(userId), status: { $in: ["PENDING", "ACCEPTED"] }, paymentStatus: { $nin: ["ACCEPTED"] }, campId: new ObjectId(campaignId) }, { status: "REJECTED", paymentStatus: "REJECTED", payMessage: "Rejected by admin" }),
    Leads.updateMany({ userId: new ObjectId(userId), status: "Approved", referPaymentStatus: "PENDING", campId: new ObjectId(campaignId), clickId: { $in: clicks } }, { referPaymentStatus: "REJECTED", referPayMessage: "Rejected by admin" }),
  ]);
  return { status: true, msg: "all set to rejected" };
}

module.exports = { getPayments, manualPayToUser, processPaymentForLead, getPendingPayments, approvePendingPayments, rejectPendingPayments };
