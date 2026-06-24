const service = require("./service");

const User = require("../users/model");
const Click = require("../clicks/model");
const Lead = require("../leads/model");
const Ban = require("../ban/model");
const CustomAmount = require("../custom-amount/model");
const Campaign = require("../campaigns/model");
const handelPayment = require("../../lib/handelPostBackPayments");
const Notification = require("../../lib/handelNotification");
const redisClient = require("../../lib/redisClient");

async function getConfig(req, res) {
  try {
    const result = await service.getPostbackConfig(req.user.db, req.protocol, req.get("host"));
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function toggleGlobal(req, res) {
  try {
    const oldToken = req.user.db.PostbackToken;
    const result = await service.toggleGlobalPostback(req.user.loginToken);
    if (oldToken) await redisClient.del(`postbackUser:${oldToken}`);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Error in updating postback key" });
  }
}

async function regenerateToken(req, res) {
  try {
    const oldToken = req.user.db.PostbackToken;
    const result = await service.regeneratePostbackToken(req.user.db._id);
    if (oldToken) await redisClient.del(`postbackUser:${oldToken}`);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Error while updating key" });
  }
}

async function handleGlobalPostback(req, res) {
  try {
    console.log(req.params);
    const PostbackToken = req.params.token || req.params.PostbackToken;
    const { event } = req.params;
    const { click } = req.query;
    const ip = req.ip;

    if (!PostbackToken || !click) return res.json({ status: false, msg: "PostbackToken and click are required" });
    if (!event) return res.json({ status: false, msg: "Event is required" });

    const userCacheKey = `postbackUser:${PostbackToken}`;
    let user = await redisClient.get(userCacheKey);
    if (user) {
      user = JSON.parse(user);
    } else {
      user = await User.findOne({ PostbackToken }).lean();
      if (user) await redisClient.setEx(userCacheKey, 3600, JSON.stringify(user));
    }
    if (!user) return res.json({ status: false, msg: "Invalid PostbackToken" });
    if (!user.globalPostBack) return res.json({ status: false, msg: "Global Postback not allowed" });

    const clickCacheKey = `postbackClick:${click}`;
    let clickId = await redisClient.get(clickCacheKey);
    if (clickId) {
      clickId = JSON.parse(clickId);
    } else {
      clickId = await Click.findOne({ click, userId: user._id }).populate("campId").lean();
      if (clickId) await redisClient.setEx(clickCacheKey, 86400, JSON.stringify(clickId));
    }
    if (!clickId) return res.json({ status: false, msg: "Invalid Click ID" });

    if (clickId.campId.campStatus === false) return res.json({ status: false, msg: "Campaing has Paused" });

    const checkLead = await Lead.findOne({ clickId: clickId._id, event });
    if (checkLead) return res.json({ status: false, msg: "Click id has already Registered" });

    let indexOfEvent;
    let eventData = clickId.campId.events.find((ed, i) => { if (ed.name === event) { indexOfEvent = i; return true; } return false; });
    if (!eventData) return res.json({ status: false, msg: "Invalid Event" });

    const customCacheKey = `customAmount:${clickId.campId._id}:${eventData.name}:${clickId.refer}`;
    let isCustom = await redisClient.get(customCacheKey);
    if (isCustom) {
      isCustom = JSON.parse(isCustom);
    } else {
      isCustom = await CustomAmount.findOne({ number: clickId.refer, event: eventData.name, campId: clickId.campId._id }).lean();
      if (isCustom) await redisClient.setEx(customCacheKey, 300, JSON.stringify(isCustom));
    }
    if (isCustom) {
      if (isCustom.referAmount !== null) eventData.refer = isCustom.referAmount;
      if (isCustom.userAmount !== null) eventData.user = isCustom.userAmount;
      if (isCustom.referComment) eventData.referComment = isCustom.referComment;
      if (isCustom.userComment) eventData.userComment = isCustom.userComment;
      if (!isCustom.referInstant) clickId.campId.referPending = true;
    }

    const ClickcreatedAt = clickId.createdAt;
    const currentTime = new Date();
    const clicktoconv = (currentTime - ClickcreatedAt) / 1000;

    if (!(req.query.type && req.query.type == "manual")) {
      if (clickId.campId.ips.length > 0 && !clickId.campId.ips.includes(ip)) {
        await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "IP is not allowed", params: req.query, paymentStatus: "REJECTED" });
        return res.json({ status: false, msg: "This IP is not allowed." });
      }
    }

    if (indexOfEvent == 0 && clickId.campId.delay && clicktoconv <= parseInt(clickId.campId.delay)) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "Click to conversion time delay is invalid", params: req.query, paymentStatus: "REJECTED" });
      if (user.tgId.chatId) Notification(user.tgId.chatId, `<b>🛑 New Fruad Lead \n⚠️ Name : ${clickId.campId.name}\n♻️ OfferID : ${clickId.campId.offerID}\n🌀 Event : ${eventData.name}\n\n🔆 User Number :- ${clickId.user}\n📣 Reason :- Click to conversion time delay is invalid\n\n🔆 Refer Number :- ${clickId.user}\n📣 Reason :- Click to conversion time delay is invalid\n\n⭐️ Lead is Disputed and Any Payment is Not Debited ✔️\n🧲 Powered By <a href='https://earningarea.in/redirectto?instant'>Earning Area</a>\n</b>`);
      return res.json({ status: false, msg: "Fraud Lead found" });
    }

    const [isUserBan, isReferBan] = await Promise.all([
      Ban.findOne({ userId: user._id, number: clickId.user.trim().toLowerCase() }),
      Ban.findOne({ userId: user._id, number: clickId.refer.trim().toLowerCase() }),
    ]);

    if (isUserBan) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "User Number is Banned", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "User Number is Banned" });
    }
    if (isReferBan) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "Refer Number is Banned", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "Refer Number is Banned" });
    }

    if (!clickId.campId.same && clickId.user.trim() === clickId.refer.trim()) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "User and refer number are the same", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "User and refer number are the same" });
    }

    if (clickId.campId.ip && (await Lead.findOne({ campId: clickId.campId._id, ip: clickId.ip, event }))) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "Duplicate IP Address", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "One IP can claim only once" });
    }

    const userValue = clickId.user;
    let userQuery;
    if (userValue.includes("@")) {
      const prefix = userValue.split("@")[0];
      userQuery = { $regex: `^${prefix}@` };
    } else {
      userQuery = userValue;
    }

    if (clickId.campId.paytm && (await Lead.findOne({ campId: clickId.campId._id, user: userQuery, event }))) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "Duplicate User Number", params: req.query, paymentStatus: "PENDING", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "One user can claim only once" });
    }

    if (eventData.caps) {
      const leadCount = await Lead.countDocuments({ campId: clickId.campId._id, event, status: "Approved" });
      if (parseInt(eventData.caps) <= parseInt(leadCount)) {
        await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "All the Leads have completed", params: req.query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
        return res.json({ status: true, msg: "This Lead caps has been reached" });
      }
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    const [leadCount, totalLeadsCount] = await Promise.all([
      Lead.countDocuments({ campId: clickId.campId._id, event, status: "Approved", createdAt: { $gte: currentDate, $lt: nextDate } }),
      Lead.countDocuments({ campId: clickId.campId._id, event, status: "Approved" }),
    ]);

    if (eventData.dailyCaps && parseInt(eventData.dailyCaps) <= parseInt(leadCount)) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "All Daily Leads have completed", params: req.query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
      return res.json({ status: true, msg: "This Lead daily caps has been reached" });
    }

    const isPrevEnable = clickId.campId.prevEvent ?? true;
    let checkTime = null;
    if (indexOfEvent > 0) {
      const time = clickId.campId.events[indexOfEvent - 1].time;
      const eventName = clickId.campId.events[indexOfEvent - 1].name;
      const IsprevEvent = await Lead.findOne({ campId: clickId.campId._id, user: clickId.user, event: eventName, status: { $ne: "REJECTED" }, click });
      checkTime = IsprevEvent?.createdAt ?? null;
      if (isPrevEnable === true) {
        if (!IsprevEvent) {
          await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "Previous event not found", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
          return res.json({ status: false, msg: "Previous event not found" });
        }
        if (time > 0 && time != "") {
          const createdAt = checkTime;
          const current = new Date();
          const timeDifference = (current - createdAt) / (1000 * 60);
          if (parseInt(timeDifference) <= parseInt(time)) {
            await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "Time difference is less than as you set between two events.", params: req.query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
            return res.json({ status: false, msg: "Time difference is less than as you set between two events." });
          }
        }
      }
    }

    if (eventData.payMode == "auto") {
      await handelPayment(user._id, eventData, { userAmount: eventData.user, referAmount: eventData.refer, click, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, params: req.query, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, clicktoconv }, user.tgId, clickId.campId, leadCount, totalLeadsCount, clicktoconv);
    } else {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "This Lead request has been successfully completed. Payment is manual", params: req.query, paymentStatus: "PENDING", payMessage: "You have set payment mode to manual", referPaymentStatus: "PENDING", referPayMessage: "You have set payment mode to manual" });
    }

    await redisClient.del(`dashboard:${user._id}`);
    return res.json({ status: true, msg: "This Lead request has been successfully completed. Please check payment status." });
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", err: error });
  }
}

async function handleCampaignPostback(req, res) {
  try {
    const CampaignToken = req.params.campaignId || req.params.CampaignToken;
    const { event } = req.params;
    const { click } = req.query;
    const ip = req.ip;

    if (!CampaignToken || !click) return res.json({ status: false, msg: "CampaignToken and click are required" });
    if (!event) return res.json({ status: false, msg: "Event is required" });

    const campCacheKey = `postbackCamp:${CampaignToken}`;
    let camp = await redisClient.get(campCacheKey);
    let user;
    if (camp) {
      camp = JSON.parse(camp);
      user = camp._userId;
    } else {
      camp = await Campaign.findOne({ postbackToken: CampaignToken }).populate("userId").lean();
      if (camp) {
        user = camp.userId;
        await redisClient.setEx(campCacheKey, 3600, JSON.stringify({ ...camp, _userId: user }));
      }
    }
    if (!camp || !user) return res.json({ status: false, msg: "Invalid apiKey" });

    const clickCacheKey = `postbackClick:${click}`;
    let clickId = await redisClient.get(clickCacheKey);
    if (clickId) {
      clickId = JSON.parse(clickId);
    } else {
      clickId = await Click.findOne({ click, userId: user._id }).populate("campId").lean();
      if (clickId) await redisClient.setEx(clickCacheKey, 86400, JSON.stringify(clickId));
    }
    if (!clickId) return res.json({ status: false, msg: "Invalid Click ID" });

    if (clickId.campId.postbackToken !== CampaignToken) return res.json({ status: false, msg: "Invalid Campaign Token for this click" });
    if (clickId.campId.campStatus === false) return res.json({ status: false, msg: "Campaign has Paused" });

    const checkLead = await Lead.findOne({ clickId: clickId._id, event });
    if (checkLead) return res.json({ status: false, msg: "Click id has already Registered" });

    let indexOfEvent;
    let eventData = clickId.campId.events.find((ed, i) => { if (ed.name === event) { indexOfEvent = i; return true; } return false; });
    if (!eventData) return res.json({ status: false, msg: "Invalid Event" });

    const customCacheKey = `customAmount:${clickId.campId._id}:${eventData.name}:${clickId.refer}`;
    let isCustom = await redisClient.get(customCacheKey);
    if (isCustom) {
      isCustom = JSON.parse(isCustom);
    } else {
      isCustom = await CustomAmount.findOne({ number: clickId.refer, event: eventData.name, campId: clickId.campId._id }).lean();
      if (isCustom) await redisClient.setEx(customCacheKey, 300, JSON.stringify(isCustom));
    }
    if (isCustom) {
      if (isCustom.referAmount !== null) eventData.refer = isCustom.referAmount;
      if (isCustom.userAmount !== null) eventData.user = isCustom.userAmount;
      if (isCustom.referComment) eventData.referComment = isCustom.referComment;
      if (isCustom.userComment) eventData.userComment = isCustom.userComment;
      if (!isCustom.referInstant) clickId.campId.referPending = true;
    }

    const ClickcreatedAt = clickId.createdAt;
    const currentTime = new Date();
    const clicktoconv = (currentTime - ClickcreatedAt) / 1000;

    if (!(req.query.type && req.query.type == "manual")) {
      if (clickId.campId.ips.length > 0 && !clickId.campId.ips.includes(ip)) {
        await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "IP is not allowed", params: req.query, paymentStatus: "REJECTED" });
        return res.json({ status: false, msg: "This IP is not allowed." });
      }
    }

    if (indexOfEvent == 0 && clickId.campId.delay && clicktoconv <= parseInt(clickId.campId.delay)) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "Click to conversion time delay is invalid", params: req.query, paymentStatus: "REJECTED" });
      if (user.tgId.chatId) Notification(user.tgId.chatId, `<b>🛑 New Fraud Lead \n⚠️ Name : ${clickId.campId.name}\n♻️ OfferID : ${clickId.campId.offerID}\n🌀 Event : ${eventData.name}\n\n🔆 User Number :- ${clickId.user}\n📣 Reason :- Click to conversion time delay is invalid\n\n🔆 Refer Number :- ${clickId.user}\n📣 Reason :- Click to conversion time delay is invalid\n\n⭐️ Lead is Disputed and Any Payment is Not Debited ✔️\n🧲 Powered By <a href='https://earningarea.in/redirectto?instant'>Earning Area</a>\n</b>`);
      return res.json({ status: false, msg: "Fraud Lead found" });
    }

    const [isUserBan, isReferBan] = await Promise.all([
      Ban.findOne({ userId: user._id, number: clickId.user.trim().toLowerCase() }),
      Ban.findOne({ userId: user._id, number: clickId.refer.trim().toLowerCase() }),
    ]);

    if (isUserBan) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "User Number is Banned", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "User Number is Banned" });
    }
    if (isReferBan) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "Refer Number is Banned", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "Refer Number is Banned" });
    }

    if (!clickId.campId.same && clickId.user.trim() === clickId.refer.trim()) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "User and refer number are the same", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "User and refer number are the same" });
    }

    if (clickId.campId.ip && (await Lead.findOne({ campId: clickId.campId._id, ip: clickId.ip, event }))) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "Duplicate IP Address", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "One IP can claim only once" });
    }

    const userValue = clickId.user;
    let userQuery;
    if (userValue.includes("@")) {
      const prefix = userValue.split("@")[0];
      userQuery = { $regex: `^${prefix}@` };
    } else {
      userQuery = userValue;
    }

    if (clickId.campId.paytm && (await Lead.findOne({ campId: clickId.campId._id, user: userQuery, event }))) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "Duplicate User Number", params: req.query, paymentStatus: "PENDING", referPaymentStatus: "REJECTED" });
      return res.json({ status: false, msg: "One user can claim only once" });
    }

    if (eventData.caps) {
      const leadCount = await Lead.countDocuments({ campId: clickId.campId._id, event, status: "Approved" });
      if (parseInt(eventData.caps) <= parseInt(leadCount)) {
        await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "All the Leads have completed", params: req.query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
        return res.json({ status: true, msg: "This Lead caps has been reached" });
      }
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    const [leadCount, totalLeadsCount] = await Promise.all([
      Lead.countDocuments({ campId: clickId.campId._id, event, status: "Approved", createdAt: { $gte: currentDate, $lt: nextDate } }),
      Lead.countDocuments({ campId: clickId.campId._id, event, status: "Approved" }),
    ]);

    if (eventData.dailyCaps && parseInt(eventData.dailyCaps) <= parseInt(leadCount)) {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "All Daily Leads have completed", params: req.query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
      return res.json({ status: true, msg: "This Lead daily caps has been reached" });
    }

    const isPrevEnable = clickId.campId.prevEvent ?? true;
    let checkTime = null;
    if (indexOfEvent > 0) {
      const time = clickId.campId.events[indexOfEvent - 1].time;
      const eventName = clickId.campId.events[indexOfEvent - 1].name;
      const IsprevEvent = await Lead.findOne({ campId: clickId.campId._id, user: clickId.user, event: eventName, status: { $ne: "REJECTED" }, click });
      checkTime = IsprevEvent?.createdAt ?? null;
      if (isPrevEnable === true) {
        if (!IsprevEvent) {
          await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "REJECTED", message: "Previous event not found", params: req.query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
          return res.json({ status: false, msg: "Previous event not found" });
        }
        if (time > 0 && time != "") {
          const createdAt = checkTime;
          const current = new Date();
          const timeDifference = (current - createdAt) / (1000 * 60);
          if (parseInt(timeDifference) <= parseInt(time)) {
            await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "Time difference is less than as you set between two events.", params: req.query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
            return res.json({ status: false, msg: "Time difference is less than as you set between two events." });
          }
        }
      }
    }

    if (eventData.payMode == "auto") {
      await handelPayment(user._id, eventData, { userAmount: eventData.user, referAmount: eventData.refer, click, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, params: req.query, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, clicktoconv }, user.tgId, clickId.campId, leadCount, totalLeadsCount, clicktoconv);
    } else {
      await service.rejectLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click, uniqueClick: { campId: clickId.campId._id, event, clickId: clickId._id }, userId: user._id, campId: clickId.campId._id, clickId: clickId._id, user: clickId.user, refer: clickId.refer, ip: clickId.ip, event, status: "Pending", message: "This Lead request has been successfully completed. Payment is manual", params: req.query, paymentStatus: "PENDING", payMessage: "You have set payment mode to manual", referPaymentStatus: "PENDING", referPayMessage: "You have set payment mode to manual" });
    }

    await redisClient.del(`dashboard:${user._id}`);
    return res.json({ status: true, msg: "This Lead request has been successfully completed. Please check payment status." });
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", err: error });
  }
}

module.exports = { getConfig, toggleGlobal, regenerateToken, handleGlobalPostback, handleCampaignPostback };
