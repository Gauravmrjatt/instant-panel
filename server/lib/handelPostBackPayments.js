const GetwaySettings = require("../models/GatewaySettings");
const saveLead = require("../lib/saveLead");
const axios = require("axios");
const Payment = require("../models/Payments");
const { Notification, hideMiddleFourLetters } = require("./handelNotification");
const PendingPayments = require("../lib/savePendingPayments");
const redisClient = require("../lib/redisClient");
const replaceAllPlaceholders = (str, replacements) => {
  for (const placeholder in replacements) {
    str = str?.replace(new RegExp(placeholder, "g"), replacements[placeholder]);
  }
  return str;
};

const fetchFromRedisOrDb = async (key, dbFetchFunction, expiry = 3600) => {
  const cachedValue = await redisClient.get(key);
  if (cachedValue) {
    return JSON.parse(cachedValue);
  }

  const value = await dbFetchFunction();

  if (value) await redisClient.set(key, JSON.stringify(value), expiry);

  return value;
};

const savePendingPayment = async (data) => {
  await PendingPayments(data);
};

const sendNotification = async (tg, message) => {
  if (tg.chatId) Notification(tg.chatId, message);
  if (tg.username) Notification(tg.username, message);
};

const handleApiFetch = async (url, fallbackResponse = { data: {} }) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error("API Fetch Error:", error);
    return fallbackResponse;
  }
};

const savePaymentRecords = async (paymentData, paymentRefer) => {
  return await Promise.all([
    new Payment(paymentData).save(),
    new Payment(paymentRefer).save(),
  ]);
};

const handelPayment = async (
  userId,
  eventData,
  lead,
  tg,
  camp,
  leadCount,
  totalLeadsCount,
  clicktoconv
) => {
  try {
    const gatewaySetting = await fetchFromRedisOrDb(
      `gatewaySetting:${userId}`,
      () => GetwaySettings.findOne({ userId })
    );
    let STATUS = "Approved";
    let PAYSTATUS = "PENDING";
    let PAYMESSAGE = "Something went wrong";
    let PAYSTATUSREFER = "PENDING";
    let PAYMESSAGEREFER = "Something went wrong";
    const orderId = `${lead.clickId}-${eventData.name}`;
    const orderIdRefer = `${lead.clickId}-${eventData.name}-refer`;

    if (!gatewaySetting) {
      PAYMESSAGE = PAYMESSAGEREFER =
        "You have not configured your Gateway settings";
    }
    const replacements = {
      "{payout_number}": lead.user,
      "{payout_amount}": eventData.user,
      "{comment}": eventData.userComment,
      "{order_id}": orderId,
    };
    const replacementsOfRefer = {
      "{payout_number}": lead.refer,
      "{payout_amount}": eventData.refer,
      "{comment}": eventData.referComment,
      "{order_id}": orderIdRefer,
    };

    const gatewayUrl =
      gatewaySetting?.type == "Custom"
        ? replaceAllPlaceholders(gatewaySetting?.url, replacements)
        : `https://toolsadda.in/nogetway.php?guid=${gatewaySetting?.guid}&amo=${eventData.user}&num=${lead.user}&com=${eventData.userComment}&order-id=${orderId}`;
    const gatewayUrlRefer =
      gatewaySetting?.type == "Custom"
        ? replaceAllPlaceholders(gatewaySetting?.url, replacementsOfRefer)
        : `https://toolsadda.in/nogetway.php?guid=${gatewaySetting?.guid}&amo=${eventData.user}&num=${lead.user}&com=${eventData.userComment}&order-id=${orderId}`;

    const userResponse = camp.userPending
      ? { data: { status: "PENDING", statusMessage: "Payment pending" } }
      : await handleApiFetch(gatewayUrl);

    const referResponse = camp.referPending
      ? { data: { status: "PENDING", statusMessage: "Payment pending" } }
      : await handleApiFetch(gatewayUrlRefer);

    PAYSTATUS = userResponse?.data?.status ?? "UNKNOWN";
    PAYMESSAGE =
      userResponse.statusMessage ||
      userResponse.message ||
      userResponse.msg ||
      "no message found";

    PAYSTATUSREFER = referResponse?.data?.status ?? "UNKNOWN";
    PAYMESSAGEREFER =
      referResponse.statusMessage ||
      referResponse.message ||
      referResponse.msg ||
      "no message found";

    if (camp.userPending) {
      await savePendingPayment({
        userId,
        campId: camp,
        clickId: lead.clickId,
        user: lead.user,
        userAmount: eventData.user,
        type: "user",
        ip: lead.ip,
        status: "PENDING",
        event: lead.event,
        paymentStatus: "Payment Pending",
        payMessage: "Payment not created yet",
        message: "Pending user payment",
        orderId,
      });
    }

    if (camp.referPending) {
      await savePendingPayment({
        userId,
        campId: camp,
        clickId: lead.clickId,
        user: lead.refer,
        userAmount: eventData.refer,
        type: "refer",
        ip: lead.ip,
        status: "PENDING",
        event: lead.event,
        paymentStatus: "Payment Pending",
        payMessage: "Payment not created yet",
        message: "Pending refer payment",
        orderId: orderIdRefer,
      });
    }

    const paymentData = {
      userId: lead.userId,
      campId: lead.campId,
      clickId: lead.clickId,
      number: lead.user,
      amount: eventData.user,
      comment: eventData.userComment,
      type: gatewaySetting?.type || "Unknown",
      for: "user",
      payUrl: gatewayUrl,
      response:
        gatewaySetting?.type === "earning area"
          ? userResponse?.data
          : { status: PAYSTATUS, message: PAYMESSAGE },
      event: eventData.name,
    };

    const paymentRefer = {
      userId: lead.userId,
      campId: lead.campId,
      clickId: lead.clickId,
      number: lead.refer,
      amount: eventData.refer,
      comment: eventData.referComment,
      type: gatewaySetting?.type || "Unknown",
      for: "refer",
      payUrl: gatewayUrlRefer,
      response:
        gatewaySetting?.type === "earning area"
          ? referResponse?.data
          : { status: PAYSTATUSREFER, message: PAYMESSAGEREFER },
      event: eventData.name,
    };

    await savePaymentRecords(paymentData, paymentRefer);

    const notificationMessage = `<b>
⚠️ ${camp.name} Conversion Alert ⚠️
♻️ [${camp.offerID}] [${eventData.name}]

🌀 User: ${lead.user} [${eventData.user} Rs]
🔆 Response: ${PAYSTATUS} || ${PAYMESSAGE}

📣 Gateway: ${gatewaySetting?.type || "Unknown"}

🌀 Refer: ${lead.refer} [${eventData.refer} Rs]
🔆 Response: ${PAYSTATUSREFER} || ${PAYMESSAGEREFER}

⛔️ Click to Conv: ${clicktoconv} sec
⭐️ Total Leads: ${totalLeadsCount + 1} (Today ${leadCount + 1})

🧲 Powered By <a href='https://earningarea.org/redirectto?instant'>Earning Area</a>
</b>`;

    await sendNotification(tg, notificationMessage);

    await saveLead({
      ...lead,
      status: STATUS,
      message: "Lead processed successfully.",
      payMessage: PAYMESSAGE,
      paymentStatus: PAYSTATUS,
      referPaymentStatus: PAYSTATUSREFER,
      referPayMessage: PAYMESSAGEREFER,
    });
  } catch (error) {
    console.error("Error in handelPayment:", error);
    throw new Error("Payment handling failed");
  }
};

module.exports = handelPayment;
