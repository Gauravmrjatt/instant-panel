const Leads = require("./model");
const Payment = require("../payments/model");
const { Parser } = require("json2csv");
const handelPayment = require("../../lib/handelManualPayments");
const redisClient = require("../../lib/redisClient");
const { clearReportsCache } = require("../reports/service");

function clearUserCaches(userId) {
  redisClient.del(`dashboard:${userId}`).catch(() => {});
  clearReportsCache(userId).catch(() => {});
}

async function getLeads(userId, campId, page = 1, limit = 20, filters = []) {
  if (!campId) return { status: false, msg: "campId is required" };
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (safePage - 1) * safeLimit;
  const filter = { campId, userId };

  if (Array.isArray(filters) && filters.length > 0) {
    for (const f of filters) {
      const { field, op, value } = f;
      if (!field || !op || value === undefined || value === '') continue;

      switch (op) {
        case 'is':
          filter[field] = value;
          break;
        case 'isNot':
          filter[field] = { $ne: value };
          break;
        case 'contains':
          filter[field] = { $regex: String(value), $options: 'i' };
          break;
        case 'notContains':
          filter[field] = { $not: { $regex: String(value), $options: 'i' } };
          break;
        case 'startsWith':
          filter[field] = { $regex: '^' + escapeRegex(String(value)), $options: 'i' };
          break;
        case 'endsWith':
          filter[field] = { $regex: escapeRegex(String(value)) + '$', $options: 'i' };
          break;
        case 'gt':
          filter[field] = { ...filter[field], $gt: Number(value) };
          break;
        case 'gte':
          filter[field] = { ...filter[field], $gte: Number(value) };
          break;
        case 'lt':
          filter[field] = { ...filter[field], $lt: Number(value) };
          break;
        case 'lte':
          filter[field] = { ...filter[field], $lte: Number(value) };
          break;
        case 'before':
          filter[field] = { ...filter[field], $lt: new Date(value) };
          break;
        case 'after':
          filter[field] = { ...filter[field], $gt: new Date(value) };
          break;
        case 'in':
          filter[field] = { $in: Array.isArray(value) ? value : [value] };
          break;
        case 'notIn':
          filter[field] = { $nin: Array.isArray(value) ? value : [value] };
          break;
      }
    }
  }

  const [leads, totalCount] = await Promise.all([
    Leads.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).select("-__v -userId -campId -clickId -uniqueClick").lean(),
    Leads.countDocuments(filter),
  ]);
  return { status: true, msg: "Leads found Successfully!", count: leads.length, totalCount, totalPages: Math.ceil(totalCount / safeLimit), page: safePage, limit: safeLimit, data: leads };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  clearUserCaches(userId);
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
    if (payments.length > 0) {
      clearUserCaches(userId);
      return { status: true, msg: "Status Updated Successfully!" };
    }
    eventData.refer = Lead.referAmount;
    eventData.user = Lead.userAmount;
    handelPayment(userId, eventData, Lead, tg || {});
    clearUserCaches(userId);
    return { status: true, msg: "Status Updated Successfully & Payment Done" };
  }
  clearUserCaches(userId);
  return { status: true, msg: "Status Updated Successfully!" };
}

async function batchUpdateStatus(userId, ids, status) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) return { status: false, msg: "Please provide valid lead IDs" };
  if (!status) return { status: false, msg: "Status is required" };
  const valid = ["Approved", "Pending", "Rejected"];
  if (!valid.includes(status)) return { status: false, msg: "Invalid status value" };
  const result = await Leads.updateMany({ _id: { $in: ids }, userId }, { $set: { status } });
  clearUserCaches(userId);
  return { status: true, msg: `${result.modifiedCount} lead(s) updated to ${status}` };
}

async function batchApproveLeads(userId, ids, payment, tg) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) return { status: false, msg: "Please provide valid lead IDs" };
  if (!payment) {
    return batchUpdateStatus(userId, ids, "Approved");
  }
  let successCount = 0;
  let failCount = 0;
  for (const id of ids) {
    try {
      const result = await approveLead(userId, id, "Approved", tg);
      if (result.status) successCount++;
      else failCount++;
    } catch {
      failCount++;
    }
  }
  clearUserCaches(userId);
  return { status: true, msg: `${successCount} lead(s) approved with payment, ${failCount} failed` };
}

async function deleteLeads(userId, selection) {
  if (!selection || !Array.isArray(selection)) return { status: false, msg: "Please provide valid lead IDs" };
  await Leads.deleteMany({ _id: { $in: selection }, userId });
  clearUserCaches(userId);
  return { status: true, msg: "Leads deleted successfully" };
}

module.exports = { getLeads, exportLeads, updateLeadStatus, approveLead, batchUpdateStatus, batchApproveLeads, deleteLeads };
