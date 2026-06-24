const Leads = require("./model");
const Payment = require("../payments/model");
const { Parser } = require("json2csv");
const handelPayment = require("../../lib/handelManualPayments");

async function getLeads(userId, campId, page = 1, limit = 20) {
  if (!campId) return { status: false, msg: "campId is required" };
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (safePage - 1) * safeLimit;
  const filter = { campId, userId };
  const [leads, totalCount] = await Promise.all([
    Leads.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).select("-__v -userId -campId -clickId -uniqueClick").lean(),
    Leads.countDocuments(filter),
  ]);
  return { status: true, msg: "Leads found Successfully!", count: leads.length, totalCount, totalPages: Math.ceil(totalCount / safeLimit), page: safePage, limit: safeLimit, data: leads };
}

async function exportLeads(userId, id) {
  const leads = await Leads.find({ userId, campId: id }).select("click user refer ip event status paymentStatus createdAt params");
  const flattenedLeads = leads.map((lead) => {
    const leadObj = lead.toObject();
    if (leadObj.params && typeof leadObj.params === "object") {
      for (const key in leadObj.params) leadObj[`params.${key}`] = leadObj.params[key];
    }
    delete leadObj.params;
    return leadObj;
  });
  const paramKeys = [...new Set(flattenedLeads.flatMap((lead) => Object.keys(lead).filter((key) => key.startsWith("params."))))];
  const fields = ["click", "user", "refer", "ip", "event", "status", "paymentStatus", "createdAt", ...paramKeys];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(flattenedLeads);
  return { status: true, csv, filename: `leads-${id}.csv` };
}

async function updateLeadStatus(userId, ID, leadStatus, event) {
  if (!ID) return { status: false, msg: "Both are required" };
  const Lead = await Leads.findByIdAndUpdate({ _id: ID, userId }, { status: leadStatus }).populate("clickId");
  if (!Lead) return { status: false, msg: "Click not found" };
  const payments = await Payment.find({ userId, event, clickId: Lead.clickId._id });
  Lead.status = leadStatus;
  return { status: true, msg: "Click found Successfully!", leadData: Lead, payments: { status: payments.length > 0, data: payments } };
}

async function approveLead(userId, ID, leadStatus, tg) {
  if (!ID) return { status: false, msg: "Both are required" };
  const Lead = await Leads.findByIdAndUpdate({ _id: ID, userId }, { status: leadStatus }).populate({ path: "clickId", populate: { path: "campId" } });
  if (!Lead) return { status: false, msg: "Lead not found" };
  if (leadStatus == "Approved") {
    const eventData = Lead.clickId.campId.events.find((ed) => ed.name === Lead.event);
    if (!eventData) return { status: false, msg: "Event not found" };
    const payments = await Payment.find({ userId, event: Lead.event, clickId: Lead.clickId._id });
    if (payments.length > 0) return { status: true, msg: "Status Updated Successfully!" };
    eventData.refer = Lead.referAmount;
    eventData.user = Lead.userAmount;
    handelPayment(userId, eventData, Lead, tg || {});
    return { status: true, msg: "Status Updated Successfully & Payment Done" };
  }
  return { status: true, msg: "Status Updated Successfully!" };
}

async function deleteLeads(userId, selection) {
  if (!selection || !Array.isArray(selection)) return { status: false, msg: "Please provide valid lead IDs" };
  await Leads.deleteMany({ _id: { $in: selection }, userId });
  return { status: true, msg: "Leads deleted successfully" };
}

module.exports = { getLeads, exportLeads, updateLeadStatus, approveLead, deleteLeads };
