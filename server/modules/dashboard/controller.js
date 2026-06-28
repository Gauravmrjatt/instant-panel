const Leads = require("../leads/model");
const Payments = require("../payments/model");
const Campaign = require("../campaigns/model");
const Click = require("../clicks/model");
const Gateway = require("../gateway-settings/model");
const axios = require("axios");
const redisClient = require("../../lib/redisClient");
const logger = require("../../lib/logger");

async function getDashboard(req, res) {
  try {
    const userId = req.user.db._id;
    // const isPremium = req.user.db.premium;
    // if (!isPremium) return res.json({ status: false, msg: "You Plan has expired", code: 0 });

    const cacheKey = `dashboard:${userId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [dashboardData] = await Leads.aggregate([
      { $match: { userId } },
      { $facet: {
        totalLeads: [{ $count: "count" }],
        todayLeads: [{ $match: { createdAt: { $gte: today } } }, { $count: "count" }],
        yesterdayLeads: [{ $match: { createdAt: { $gte: yesterday, $lt: today } } }, { $count: "count" }],
        topCampaigns: [
          { $group: { _id: "$campId", count: { $sum: 1 } } },
          { $sort: { count: -1 } }, { $limit: 5 },
          { $lookup: { from: "campaigns", localField: "_id", foreignField: "_id", as: "campaign" } },
          { $unwind: "$campaign" },
          { $project: { _id: 0, offerID: "$campaign.offerID", name: "$campaign.name", count: 1 } },
        ],
        leadsByDay: [
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          { $group: { _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, status: "$status" }, count: { $sum: 1 } } },
          { $group: { _id: "$_id.date", statuses: { $push: { status: "$_id.status", count: "$count" } } } },
          { $sort: { _id: 1 } },
        ],
      } },
    ]);

    const [paymentData] = await Payments.aggregate([
      { $match: { userId } },
      { $facet: {
        totalPay: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
        todayPay: [{ $match: { createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: "$amount" } } }],
        yesterdayPay: [{ $match: { createdAt: { $gte: yesterday, $lt: today } } }, { $group: { _id: null, total: { $sum: "$amount" } } }],
        paymentByDay: [
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$amount" } } },
          { $sort: { _id: 1 } },
        ],
        topUsers: [
          { $group: { _id: "$number", totalAmount: { $sum: "$amount" }, paymentCount: { $sum: 1 } } },
          { $sort: { totalAmount: -1 } }, { $limit: 5 },
        ],
      } },
    ]);

    const clickAgg = await Click.aggregate([
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const [camps, totalClicks] = await Promise.all([
      Campaign.countDocuments({ userId }),
      Click.countDocuments({ userId }),
    ]);

    const leads = dashboardData.totalLeads[0]?.count || 0;
    const todayCount = dashboardData.todayLeads[0]?.count || 0;
    const yesterdayCount = dashboardData.yesterdayLeads[0]?.count || 0;
    const growthPercentage = yesterdayCount !== 0 ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 : 0;
    const pay = paymentData.totalPay[0]?.total || 0;
    const todayPayVal = paymentData.todayPay[0]?.total || 0;
    const yesterdayPayVal = paymentData.yesterdayPay[0]?.total || 0;
    const payGrowth = yesterdayPayVal !== 0 ? ((todayPayVal - yesterdayPayVal) / yesterdayPayVal) * 100 : 0;

    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const fillDays = (arr, valueKey) => {
      const result = Array(7).fill(0);
      const d = new Date(sevenDaysAgo);
      for (let i = 0; i < 7; i++) { const ds = formatDate(d); const f = arr.find(r => r._id === ds); result[i] = f ? f[valueKey] : 0; d.setDate(d.getDate() + 1); }
      return result;
    };
    const fillLeadsDays = (leadsByDay, status) => {
      const result = Array(7).fill(0);
      const d = new Date(sevenDaysAgo);
      for (let i = 0; i < 7; i++) { const ds = formatDate(d); const day = leadsByDay.find(r => r._id === ds); if (day) result[i] = status === "all" ? day.statuses.reduce((s, x) => s + x.count, 0) : (day.statuses.find(s => s.status === status)?.count || 0); d.setDate(d.getDate() + 1); }
      return result;
    };

    const responseData = {
      status: true, camp: camps,
      leads: { all: leads, today: todayCount, yesterday: yesterdayCount, grow: growthPercentage },
      payments: { all: pay, today: todayPayVal, yesterday: yesterdayPayVal, grow: payGrowth },
      paymentData: fillDays(paymentData.paymentByDay, "total"),
      topCamps: dashboardData.topCampaigns, topUsers: paymentData.topUsers,
      clicks: fillDays(clickAgg, "count"),
      totalClicks: totalClicks,
      sevenLeads: {
        all: fillLeadsDays(dashboardData.leadsByDay, "all"),
        approved: fillLeadsDays(dashboardData.leadsByDay, "Approved"),
        rejected: fillLeadsDays(dashboardData.leadsByDay, "Rejected"),
        pending: fillLeadsDays(dashboardData.leadsByDay, "Pending"),
      },
      dashText: await getDashText(userId),
      allClicks: totalClicks ?? 10,
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
    res.json(responseData);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function postDashboard(req, res) {
  try {
    const userId = req.user.db._id;
    const { from, to } = req.body.date;
    if (!from || !to) return res.json({ status: false, data: [] });
    const fromDate = new Date(from.year, from.month - 1, from.day);
    const toDate = new Date(to.year, to.month - 1, to.day);
    const matchCond = fromDate.getTime() === toDate.getTime() ? { $eq: fromDate } : { $gte: fromDate, $lte: toDate };
    const [data, data2] = await Promise.all([
      Leads.aggregate([
        { $match: { userId, createdAt: matchCond } },
        { $group: { _id: "$campId", count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 },
        { $lookup: { from: "campaigns", localField: "_id", foreignField: "_id", as: "campaign" } },
        { $unwind: "$campaign" },
        { $project: { _id: 0, offerID: "$campaign.offerID", name: "$campaign.name", count: 1 } },
      ]),
      Payments.aggregate([
        { $match: { userId, createdAt: matchCond } },
        { $group: { _id: "$number", totalAmount: { $sum: "$amount" }, paymentCount: { $sum: 1 } } },
        { $sort: { totalAmount: -1 } }, { $limit: 5 },
      ]),
    ]);
    res.json({ status: true, data, users: data2 });
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function getDashText(userId) {
  const data = await Gateway.findOne({ userId });
  if (!data) return "Configure your Gateway Settings";
  if (data.type == "Earning Area") {
    if (!data.guid) return "Your gateway is not configured properly";
    const res = await axios.get(`https://toolsadda.in/api/getBalance.php?guid=${data.guid}`);
    if (res.data.status == "ACCEPTED") return `You have ₹${res.data.Balance} in your Earningarea Wallet add more from this button`;
    return `You have an Error while fetching Earningarea Wallet Balance : ${res.data.statusMessage}`;
  }
  return "Set you Gateway type to get Earningarea Wallet balance open Earningarea from this button";
}

module.exports = { getDashboard, postDashboard };
