const Leads = require("../leads/model");
const Payment = require("../payments/model");
const Click = require("./model");
const { Parser } = require("json2csv");

async function getClick(userId, id, event) {
  if (!id || !event) return { status: false, msg: "Both are required" };
  const Lead = await Leads.findOne({ _id: id, userId }).populate("clickId");
  if (!Lead) return { status: false, msg: "Click not found" };
  const payments = await Payment.find({ userId, event, clickId: Lead.clickId._id });
  return { status: true, msg: "Click found Successfully!", leadData: Lead, payments: { status: payments.length > 0, data: payments } };
}

async function exportClicks(userId, id) {
  const clicks = await Click.find({ userId, campId: id }).select("click user refer ip createdAt params");
  const flattenedClicks = clicks.map((doc) => {
    const obj = doc.toObject();
    if (obj.params && typeof obj.params === "object") {
      for (const key in obj.params) obj[`params.${key}`] = obj.params[key];
    }
    delete obj.params;
    return obj;
  });
  const paramKeys = [...new Set(flattenedClicks.flatMap((obj) => Object.keys(obj).filter((k) => k.startsWith("params."))))];
  const fields = ["click", "user", "refer", "ip", "createdAt", ...paramKeys];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(flattenedClicks);
  return { status: true, csv, filename: `clicks-${id}.csv` };
}

async function searchClicks(userId, data) {
  if (!data || !Array.isArray(data)) return { status: false, msg: "Click IDs are required as an array" };
  const results = await Click.find({ userId, click: { $in: data } }).lean();
  if (!results || results.length === 0) return { status: false, msg: "Clicks not found" };
  return { status: true, msg: "Clicks found successfully!", clickData: results };
}

module.exports = { getClick, exportClicks, searchClicks };
