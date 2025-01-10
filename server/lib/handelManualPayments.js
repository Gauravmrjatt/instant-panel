const GetwaySettings = require("../models/GatewaySettings");
const Lead = require("../models/Leads");
const axios = require("axios");
const Payment = require("../models/Payments");
const Ban = require("../models/Ban");
const Notification = require("../lib/handelNotification");
const PendingPayment = require("../models/PendingPayments");
const handelPayment = async (userId, eventData, lead, tg = "") => {
  try {
    function replaceAllPlaceholders(str, replacements) {
      for (const placeholder in replacements) {
        const replaceValue = replacements[placeholder];
        str = str?.replace(new RegExp(placeholder, "g"), replaceValue);
      }
      return str;
    }
    const gatewaySetting = await GetwaySettings.findOne({ userId });
    let STATUS = "Approved";
    let PAYSTATUS = "PENDING";
    let PAYMESSAGE = "Something went wrong";
    let STATUSMESSAGE =
      "This Lead request has been successfully completed {MANUAL}";
    const orderId = `${lead.clickId._id}-${eventData.name}`;
    const orderIdRefer = `${lead.clickId._id}-${eventData.name}-refer`;

    if (!gatewaySetting) {
      STATUS = "Approved";
      PAYSTATUS = "PENDING";
      PAYMESSAGE = "You have not configured your Gateway settings";
    }

    const [finnBanUser, findBanRefer] = await Promise.all([
      Ban.findOne({ userId, number: lead.user }),
      Ban.findOne({ userId, number: lead.refer }),
    ]);

    if (gatewaySetting.type === "Earning Area") {
      if (gatewaySetting.guid) {
        const gatewayUrl = `https://toolsadda.in/nogetway.php?guid=${gatewaySetting.guid}&amo=${eventData.user}&num=${lead.user}&com=${eventData.userComment}&order-id=${orderId}`;
        const gatewayUrlRefer = `https://toolsadda.in/nogetway.php?guid=${gatewaySetting.guid}&amo=${eventData.refer}&num=${lead.refer}&com=${eventData.referComment}&order-id=${orderIdRefer}`;

        let response, responseRefer;
        if (finnBanUser) {
          response = {
            data: { status: "BAN", statusMessage: "This Number is Ban" },
          };
          responseRefer = await axios.get(gatewayUrlRefer);
        } else if (findBanRefer) {
          responseRefer = {
            data: { status: "BAN", statusMessage: "This Number is Ban" },
          };
          response = await axios.get(gatewayUrl);
        } else {
          [response, responseRefer] = await Promise.all([
            axios.get(gatewayUrl),
            axios.get(gatewayUrlRefer),
          ]);
        }

        PAYSTATUS = response?.data?.status;
        PAYMESSAGE = response?.data?.statusMessage;

        const paymentData = {
          userId: lead.userId,
          campId: lead.campId,
          clickId: lead.clickId,
          number: lead.user,
          amount: eventData.user,
          comment: eventData.userComment,
          type: gatewaySetting.type,
          for: "user",
          payUrl: gatewayUrl,
          response: response?.data,
          event: eventData.name,
        };
        const paymentRefer = {
          userId: lead.userId,
          campId: lead.campId,
          clickId: lead.clickId,
          number: lead.refer,
          amount: eventData.refer,
          comment: eventData.referComment,
          type: gatewaySetting.type,
          for: "refer",
          payUrl: gatewayUrlRefer,
          response: responseRefer?.data,
          event: eventData.name,
        };
        if (tg.chatId) {
          try {
            let textMessage = `<b>⚡️Lead Approved ✅
Name : ${lead.clickId.campId.name}
OfferID : ${lead.clickId.campId.offerID}
Event : ${eventData.name}

User Number :- ${lead.user} (₹${eventData.user})
User response : ${JSON.stringify(response?.data)}

Gateway :- EarningArea

Refer Number :- ${lead.refer} (₹${eventData.refer})
Refer response : ${JSON.stringify(responseRefer?.data)}
</b>`;
            textMessage +=
              responseRefer.status == "ACCEPTED"
                ? `<b>Updated Balance : ${responseRefer.balance}</b>`
                : "";
            Notification(tg.chatId, textMessage);
          } catch (error) {
            console.log(error);
          }
        }
        const [payment, paymentReferSave] = await Promise.all([
          new Payment(paymentData).save(),
          new Payment(paymentRefer).save(),
        ]);
      } else {
        PAYMESSAGE = "You have not configured your guid";
      }
    } else {
      STATUS = "Approved";
      PAYSTATUS = "UNKNOWN";
      PAYMESSAGE = "We cannot check payment status in a custom gateway";
      if (!gatewaySetting.url) {
        PAYMESSAGE = "You have not configured your Payment Url";
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

      const replacedUrlUser = replaceAllPlaceholders(
        gatewaySetting.url,
        replacements
      );
      const replacedUrlRefer = replaceAllPlaceholders(
        gatewaySetting.url,
        replacementsOfRefer
      );

      let response, responseRefer;
      if (finnBanUser) {
        response = {
          data: { status: "BAN", statusMessage: "This Number is Ban" },
        };
        responseRefer = await axios.get(replacedUrlRefer);
      } else if (findBanRefer) {
        responseRefer = {
          data: { status: "BAN", statusMessage: "This Number is Ban" },
        };
        response = await axios.get(replacedUrlUser);
      } else {
        [response, responseRefer] = await Promise.all([
          axios.get(replacedUrlUser),
          axios.get(replacedUrlRefer),
        ]);
      }

      PAYSTATUS = response?.data?.status ?? "UNKNOWN";
      PAYMESSAGE =
        response?.data?.statusMessage ??
        "We cannot check payment status in a custom gateway";

      const paymentData = {
        userId: lead.userId,
        campId: lead.campId,
        clickId: lead.clickId,
        number: lead.user,
        amount: eventData.user,
        comment: eventData.userComment,
        type: gatewaySetting.type,
        for: "user",
        payUrl: replacedUrlUser,
        response: response?.data,
        event: eventData.name,
      };
      const paymentRefer = {
        userId: lead.userId,
        campId: lead.campId,
        clickId: lead.clickId,
        number: lead.refer,
        amount: eventData.refer,
        comment: eventData.referComment,
        type: gatewaySetting.type,
        for: "refer",
        payUrl: replacedUrlRefer,
        response: responseRefer?.data,
        event: eventData.name,
      };
      if (tg.chatId) {
        try {
          let textMessage = `<b>⚡️Lead Approved ✅
              Name : ${lead.clickId.campId.name}
              OfferID : ${lead.clickId.campId.offerID}
              Event : ${eventData.name}
  
              User Number :- ${lead.user} (₹${eventData.user})
              User response : ${JSON.stringify(response?.data)}
  
              Gateway :- Custom
  
              Refer Number :- ${lead.refer} (₹${eventData.refer})
              Refer response : ${JSON.stringify(responseRefer?.data)}
              </b>`;
          textMessage +=
            responseRefer.status == "ACCEPTED"
              ? `<b>Updated Balance : ${responseRefer.balance}</b>`
              : "";
          Notification(tg.chatId, textMessage);
        } catch (error) {
          console.log(error);
        }
      }
      const [payment, paymentReferSave] = await Promise.all([
        new Payment(paymentData).save(),
        new Payment(paymentRefer).save(),
      ]);
    }
    const [leadTosave, pendingPayment] = await Promise.all([
      Lead.findByIdAndUpdate(
        { _id: lead._id },
        {
          status: STATUS,
          message: STATUSMESSAGE,
          payMessage: PAYMESSAGE,
          paymentStatus: PAYSTATUS,
        }
      ),
      PendingPayment.findByIdAndUpdate(
        {
          userId,
          clickId: lead.clickId,
        },
        {
          status: STATUS,
          message: STATUSMESSAGE,
          payMessage: PAYMESSAGE,
          paymentStatus: PAYSTATUS,
        }
      ),
    ]);
  } catch (error) {
    console.log("Handle Manula Payment Error:", error);
    throw new Error("Payment handling failed");
  }
};

module.exports = handelPayment;
