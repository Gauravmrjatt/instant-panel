const User = require("../users/model");
const Click = require("../clicks/model");
const Lead = require("../leads/model");
const Ban = require("../ban/model");
const CustomAmount = require("../custom-amount/model");
const Campaign = require("../campaigns/model");
const myDetails = require("../../myDetails.json");
const { v4: uuidv4 } = require("uuid");
const { sendToQueue } = require("../../lib/rabbitMQ");
const handlePayment = require("../../lib/handlePostBackPayments");
const Notification = require("../../lib/handelNotification");
const redisClient = require("../../lib/redisClient");
const logger = require("../../lib/logger");
const { LRUCache } = require("lru-cache");

const postbackUserCache = new LRUCache({ max: 500, ttl: 3600_000 });

async function getPostbackConfig(user, protocol, host) {
  const { PostbackToken, globalPostBack } = user;
  const domain = `${protocol}://${host}`;
  return { status: true, msg: "Postback key found!", key: PostbackToken, isEnabled: globalPostBack, url: `${domain}/api/v1/postback/${PostbackToken}/{eventname}?click={click_id}&p1={pass extra params}` };
}

async function toggleGlobalPostback(loginToken, enabled) {
  const updateOp = enabled !== undefined
    ? { $set: { globalPostBack: enabled } }
    : [{ $set: { globalPostBack: { $not: "$globalPostBack" } } }];
  const updatedUser = await User.findOneAndUpdate(
    { loginToken },
    updateOp,
    { new: true }
  );
  if (!updatedUser) return { status: false, msg: "Error in updating postback key" };
  return { status: true, isEnabled: updatedUser.globalPostBack };
}

async function regeneratePostbackToken(userId) {
  const newID = uuidv4();
  const result = await User.findByIdAndUpdate(userId, { PostbackToken: newID });
  if (!result) return { status: false, msg: "Error while updating key" };
  const url = `${myDetails.domain}api/v1/postback/${newID}/{eventname}?p1={aff_click_id}&p2={sub_aff_id}&o={offerid}`;
  return { status: true, msg: "Postback Updated Successfully", key: newID, url };
}

async function queueLead(data) {
  try {
    await sendToQueue("lead_write", JSON.stringify(data));
  } catch (err) {
    const Lead = require("../leads/model");
    const lead = new Lead(data);
    await lead.save();
  }
}

async function clearUserCache(token) {
  if (token) {
    postbackUserCache.delete(token);
    await redisClient.del(`postbackUser:${token}`).catch(() => {});
  }
}

async function resolvePostbackUser(token) {
  const cached = postbackUserCache.get(token);
  if (cached) return cached;

  const redisKey = `postbackUser:${token}`;
  let user = await redisClient.get(redisKey);
  if (user) {
    user = JSON.parse(user);
    postbackUserCache.set(token, user);
    return user;
  }

  user = await User.findOne({ PostbackToken: token }).select("PostbackToken globalPostBack _id tgId").lean();
  if (user) {
    postbackUserCache.set(token, user);
    await redisClient.setEx(redisKey, 3600, JSON.stringify(user));
  }
  return user;
}

async function resolveCampaignPostback(CampaignToken) {
  const campCacheKey = `postbackCamp:${CampaignToken}`;
  let camp = await redisClient.get(campCacheKey);
  let user;
  if (camp) {
    camp = JSON.parse(camp);
    user = camp._userId;
  } else {
    const isObjectId = /^[a-f0-9]{24}$/i.test(CampaignToken);
    const query = isObjectId
      ? { $or: [{ postbackToken: CampaignToken }, { _id: CampaignToken }] }
      : { postbackToken: CampaignToken };
    camp = await Campaign.findOne(query)
      .select("_id userId postbackToken campStatus events delay ips same ip paytm prevEvent name referPending userPending offerID")
      .populate("userId", "PostbackToken globalPostBack _id tgId")
      .lean();
    if (camp) {
      user = camp.userId;
      await redisClient.setEx(campCacheKey, 3600, JSON.stringify({ ...camp, _userId: user }));
    }
  }
  return { camp, user };
}

async function resolvePostbackClick(click, userId) {
  const cacheKey = `postbackClick:${click}`;
  let clickId = await redisClient.get(cacheKey);
  if (clickId) return JSON.parse(clickId);

  const selectFields = "_id userId campId click user refer ip createdAt number";

  clickId = await Click.findOne({ click, userId })
    .select(selectFields)
    .lean();

  // Fallback: query with string userId for existing dirty data (stored as string by native driver)
  if (!clickId) {
    const raw = await Click.collection.findOne({ click, userId: String(userId) });
    if (raw) {
      clickId = await Click.findOne({ _id: raw._id })
        .select(selectFields)
        .lean();
    }
  }

  if (clickId) await redisClient.setEx(cacheKey, 86400, JSON.stringify(clickId));
  return clickId;
}

const campaignByIdCache = new LRUCache({ max: 5000, ttl: 60_000 });
const campSelectFields = "campStatus events delay ips same ip paytm prevEvent name postbackToken referPending userPending offerID";

async function clearCampaignByIdCache(campId) {
  const key = String(campId);
  campaignByIdCache.delete(key);
  await redisClient.del(`postbackCampById:${key}`).catch(() => {});
}

async function resolveCampaignById(campId) {
  const key = String(campId);
  const cached = campaignByIdCache.get(key);
  if (cached) return cached;

  try {
    const redisKey = `postbackCampById:${key}`;
    const cachedStr = await redisClient.get(redisKey);
    if (cachedStr) {
      const parsed = JSON.parse(cachedStr);
      campaignByIdCache.set(key, parsed);
      return parsed;
    }
  } catch {}

  const camp = await Campaign.findById(campId).select(campSelectFields).lean();
  if (camp) {
    campaignByIdCache.set(key, camp);
    try { await redisClient.setEx(`postbackCampById:${key}`, 3600, JSON.stringify(camp)); } catch {}
  }
  return camp;
}

async function resolveCustomAmount(campId, eventName, refer) {
  const cacheKey = `customAmount:${campId}:${eventName}:${refer}`;
  let isCustom = await redisClient.get(cacheKey);
  if (isCustom) return JSON.parse(isCustom);

  isCustom = await CustomAmount.findOne({ number: refer, event: eventName, campId })
    .select("referAmount userAmount referComment userComment referInstant")
    .lean();
  if (isCustom) await redisClient.setEx(cacheKey, 300, JSON.stringify(isCustom));
  return isCustom;
}

async function checkLeadDuplicates(clickId, event) {
  const dedupKey = `postbackDedup:${clickId}:${event}`;
  const acquired = await redisClient.set(dedupKey, "1", { NX: true, EX: 86400 });
  if (acquired) return false;
  return true;
}

async function checkBans(userId, userNumber, referNumber) {
  const userBanKey = `banCheck:${userId}:${userNumber}`;
  const referBanKey = `banCheck:${userId}:${referNumber}`;

  const [cachedUserBan, cachedReferBan] = await Promise.all([
    redisClient.get(userBanKey),
    redisClient.get(referBanKey),
  ]);

  let isUserBan, isReferBan;

  if (cachedUserBan !== null) {
    isUserBan = JSON.parse(cachedUserBan);
  }
  if (cachedReferBan !== null) {
    isReferBan = JSON.parse(cachedReferBan);
  }

  const [dbUserBan, dbReferBan] = await Promise.all([
    isUserBan === undefined ? Ban.findOne({ userId, number: userNumber.trim().toLowerCase() }).lean() : null,
    isReferBan === undefined ? Ban.findOne({ userId, number: referNumber.trim().toLowerCase() }).lean() : null,
  ]);

  if (isUserBan === undefined) {
    isUserBan = !!dbUserBan;
    redisClient.set(userBanKey, JSON.stringify(isUserBan), { EX: 300 }).catch(() => {});
  }
  if (isReferBan === undefined) {
    isReferBan = !!dbReferBan;
    redisClient.set(referBanKey, JSON.stringify(isReferBan), { EX: 300 }).catch(() => {});
  }

  return { isUserBan, isReferBan };
}

async function getCapCounters(campId, event) {
  const today = new Date().toISOString().split("T")[0];
  const dailyKey = `cap:daily:${campId}:${event}:${today}`;
  const totalKey = `cap:total:${campId}:${event}`;

  const [dailyStr, totalStr] = await Promise.all([
    redisClient.get(dailyKey),
    redisClient.get(totalKey),
  ]);

  if (dailyStr && totalStr) {
    return { daily: parseInt(dailyStr, 10), total: parseInt(totalStr, 10) };
  }

  if (!dailyStr) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const daily = await Lead.countDocuments({
      campId,
      event,
      status: "Approved",
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    await redisClient.set(dailyKey, daily, { NX: true, EX: 86400 });
  }

  if (!totalStr) {
    const total = await Lead.countDocuments({
      campId,
      event,
      status: "Approved",
    });
    await redisClient.set(totalKey, total, { NX: true, EX: 86400 });
  }

  const [finalDaily, finalTotal] = await Promise.all([
    redisClient.get(dailyKey),
    redisClient.get(totalKey),
  ]);

  return {
    daily: parseInt(finalDaily || "0", 10),
    total: parseInt(finalTotal || "0", 10),
  };
}

async function incrementCapCounters(campId, event) {
  const today = new Date().toISOString().split("T")[0];
  const dailyKey = `cap:daily:${campId}:${event}:${today}`;
  const totalKey = `cap:total:${campId}:${event}`;

  await Promise.all([
    redisClient.incr(dailyKey),
    redisClient.incr(totalKey),
  ]);
}

async function processPostback({ user, clickDoc, event, ip, query }) {
  const camp = clickDoc.campId;

  if (!user.globalPostBack){
    logger.warn({ clickId: clickDoc._id, event, userId: user._id }, "processPostback >> Global postback is disabled");
    return { status: false, msg: "Global postback is disabled" };}

  if (camp.campStatus === false){
    logger.warn({ clickId: clickDoc._id, event, userId: user._id }, "processPostback >> Campaign has Paused");
    return { status: false, msg: "Campaign has Paused" };}



  const isDuplicate = await checkLeadDuplicates(clickDoc._id, event);
  if (isDuplicate) return { status: false, msg: "Click id has already Registered" };

  let indexOfEvent;
  let eventData = camp.events.find((ed, i) => {
    if (ed.name === event) { indexOfEvent = i; return true; }
    return false;
  });
  if (!eventData) return { status: false, msg: "Invalid Event" };

  const [isCustom, { isUserBan, isReferBan }] = await Promise.all([
    resolveCustomAmount(camp._id, eventData.name, clickDoc.refer),
    checkBans(user._id, clickDoc.user, clickDoc.refer),
  ]);

  if (isCustom) {
    if (isCustom.referAmount !== null) eventData.refer = isCustom.referAmount;
    if (isCustom.userAmount !== null) eventData.user = isCustom.userAmount;
    if (isCustom.referComment) eventData.referComment = isCustom.referComment;
    if (isCustom.userComment) eventData.userComment = isCustom.userComment;
    if (!isCustom.referInstant) camp.referPending = true;
  }

  const ClickcreatedAt = clickDoc.createdAt;
  const currentTime = new Date();
  const clicktoconv = (currentTime - ClickcreatedAt) / 1000;

  if (!(query.type && query.type == "manual")) {
    if (camp.ips.length > 0 && !camp.ips.includes(ip)) {
      await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "REJECTED", message: "IP is not allowed", params: query, paymentStatus: "REJECTED" });
      return { status: false, msg: "This IP is not allowed." };
    }
  }

  if (indexOfEvent == 0 && camp.delay && clicktoconv <= parseInt(camp.delay)) {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "REJECTED", message: "Click to conversion time delay is invalid", params: query, paymentStatus: "REJECTED" });
    if (user.tgId && user.tgId.chatId) Notification(user.tgId.chatId, `<b>🛑 New Fraud Lead \n⚠️ Name : ${camp.name}\n♻️ OfferID : ${camp.offerID}\n🌀 Event : ${eventData.name}\n\n🔆 User Number :- ${clickDoc.user}\n📣 Reason :- Click to conversion time delay is invalid\n\n🔆 Refer Number :- ${clickDoc.user}\n📣 Reason :- Click to conversion time delay is invalid\n\n⭐️ Lead is Disputed and Any Payment is Not Debited ✔️\n🧲 Powered By <a href='https://earningarea.in/redirectto?instant'>Earning Area</a>\n</b>`).catch(() => {});
    return { status: false, msg: "Fraud Lead found" };
  }

  if (isUserBan) {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "REJECTED", message: "User Number is Banned", params: query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
    return { status: false, msg: "User Number is Banned" };
  }
  if (isReferBan) {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "REJECTED", message: "Refer Number is Banned", params: query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
    return { status: false, msg: "Refer Number is Banned" };
  }

  if (!camp.same && clickDoc.user.trim() === clickDoc.refer.trim()) {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "REJECTED", message: "User and refer number are the same", params: query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
    return { status: false, msg: "User and refer number are the same" };
  }

  if (camp.ip && (await Lead.findOne({ campId: camp._id, ip: clickDoc.ip, event }).select("_id").lean())) {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "REJECTED", message: "Duplicate IP Address", params: query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
    return { status: false, msg: "One IP can claim only once" };
  }

  const userValue = clickDoc.user;
  let userQuery;
  if (userValue.includes("@")) {
    const prefix = userValue.split("@")[0];
    userQuery = { $regex: `^${prefix}@` };
  } else {
    userQuery = userValue;
  }

  if (camp.paytm && (await Lead.findOne({ campId: camp._id, user: userQuery, event }).select("_id").lean())) {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "Pending", message: "Duplicate User Number", params: query, paymentStatus: "PENDING", referPaymentStatus: "REJECTED" });
    return { status: false, msg: "One user can claim only once" };
  }

  const { daily: dailyApprovedLeads, total: totalApprovedLeads } = eventData.dailyCaps || eventData.caps
    ? await getCapCounters(camp._id, event)
    : { daily: 0, total: 0 };

  if (eventData.caps && parseInt(eventData.caps) <= parseInt(totalApprovedLeads)) {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "Pending", message: "All the Leads have completed", params: query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
    return { status: true, msg: "This Lead caps has been reached" };
  }

  if (eventData.dailyCaps && parseInt(eventData.dailyCaps) <= parseInt(dailyApprovedLeads)) {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "Pending", message: "All Daily Leads have completed", params: query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
    return { status: true, msg: "This Lead daily caps has been reached" };
  }

  const isPrevEnable = camp.prevEvent ?? true;
  let checkTime = null;
  if (indexOfEvent > 0) {
    const time = camp.events[indexOfEvent - 1].time;
    const eventName = camp.events[indexOfEvent - 1].name;
    const IsprevEvent = await Lead.findOne({ campId: camp._id, user: clickDoc.user, event: eventName, status: { $ne: "REJECTED" }, click: clickDoc.click }).select("createdAt").lean();
    checkTime = IsprevEvent?.createdAt ?? null;
    if (isPrevEnable === true) {
      if (!IsprevEvent) {
        await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "REJECTED", message: "Previous event not found", params: query, paymentStatus: "REJECTED", referPaymentStatus: "REJECTED" });
        return { status: false, msg: "Previous event not found" };
      }
      if (time > 0 && time != "") {
        const createdAt = checkTime;
        const current = new Date();
        const timeDifference = (current - createdAt) / (1000 * 60);
        if (parseInt(timeDifference) <= parseInt(time)) {
          await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "Pending", message: "Time difference is less than as you set between two events.", params: query, paymentStatus: "PENDING", referPaymentStatus: "PENDING" });
          return { status: false, msg: "Time difference is less than as you set between two events." };
        }
      }
    }
  }

  if (eventData.payMode == "auto") {
    const paymentPayload = {
      type: "postback_payment",
      userId: user._id,
      eventData,
      lead: {
        userAmount: eventData.user,
        referAmount: eventData.refer,
        click: clickDoc.click,
        userId: user._id,
        campId: camp._id,
        clickId: clickDoc._id,
        user: clickDoc.user,
        refer: clickDoc.refer,
        ip: clickDoc.ip,
        event,
        params: query,
        uniqueClick: { campId: camp._id, event, clickId: clickDoc._id },
        clicktoconv,
      },
      tg: user.tgId,
      camp,
      dailyApprovedLeads,
      totalApprovedLeads,
      clicktoconv,
    };
    try {
      sendToQueue("payment_processing", JSON.stringify(paymentPayload));
    } catch (err) {
      logger.warn({ err: err.message }, "payment_processing queue unavailable — processing payment synchronously");
      await handlePayment(user._id, eventData, paymentPayload.lead, user.tgId, camp, dailyApprovedLeads, totalApprovedLeads, clicktoconv);
      incrementCapCounters(camp._id, event).catch(() => {});
    }
  } else {
    await queueLead({ clicktoconv, userAmount: eventData.user, referAmount: eventData.refer, click: clickDoc.click, uniqueClick: { campId: camp._id, event, clickId: clickDoc._id }, userId: user._id, campId: camp._id, clickId: clickDoc._id, user: clickDoc.user, refer: clickDoc.refer, ip: clickDoc.ip, event, status: "Pending", message: "This Lead request has been successfully completed. Payment is manual", params: query, paymentStatus: "PENDING", payMessage: "You have set payment mode to manual", referPaymentStatus: "PENDING", referPayMessage: "You have set payment mode to manual" });
  }

  redisClient.del(`dashboard:${user._id}`).catch(() => {});
  return { status: true, msg: "This Lead request has been successfully completed. Please check payment status." };
}

module.exports = {
  getPostbackConfig,
  toggleGlobalPostback,
  regeneratePostbackToken,
  queueLead,
  clearUserCache,
  resolvePostbackUser,
  resolveCampaignPostback,
  resolvePostbackClick,
  resolveCampaignById,
  clearCampaignByIdCache,
  resolveCustomAmount,
  checkLeadDuplicates,
  checkBans,
  processPostback,
  incrementCapCounters,
};
