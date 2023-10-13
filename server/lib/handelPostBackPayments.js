const GetwaySettings = require("../models/GatewaySettings");
const saveLead = require("../lib/saveLead");
const axios = require('axios');
const Payment = require("../models/Payments");
const Ban = require("../models/Ban")
const { Notification, hideMiddleFourLetters } = require("./handelNotification")
const PendingPayments = require("../lib/savePendingPayments")
const handelPayment = async (userId, eventData, lead, tg, camp, leadCount, totalLeadsCount, clickToConv) => {
    try {
        function replaceAllPlaceholders(str, replacements) {
            for (const placeholder in replacements) {
                const replaceValue = replacements[placeholder];
                str = str?.replace(new RegExp(placeholder, 'g'), replaceValue);
            }
            return str;
        }
        const gatewaySetting = await GetwaySettings.findOne({ userId });
        let STATUS = 'Approved';
        let PAYSTATUS = 'PENDING';
        let PAYMESSAGE = 'Something went wrong';
        let PAYSTATUSREFER = 'PENDING';
        let PAYMESSAGEREFER = 'Something went wrong';
        const orderId = lead.clickId + "-" + eventData.name;
        const orderIdRefer = lead.clickId + "-" + eventData.name + "-refer";
        if (!gatewaySetting) {
            STATUS = 'Approved';
            PAYSTATUS = 'PENDING';
            PAYMESSAGE = 'You have not configured your Gateway settings';
            PAYSTATUSREFER = 'PENDING';
            PAYMESSAGEREFER = 'You have not configured your Gateway settings';
        }
        const [finnBanUser, findBanRefer] = await Promise.all([
            Ban.findOne({ userId, number: lead.user }),
            Ban.findOne({ userId, number: lead.refer })
        ])
        if (gatewaySetting.type === "Earning Area") {
            if (gatewaySetting.guid) {

                const gatewayUrl = `https://toolsadda.in/nogetway.php?guid=${gatewaySetting.guid}&amo=${eventData.user}&num=${lead.user}&com=${eventData.userComment}&order-id=${orderId}`;
                const gatewayUrlRefer = `https://toolsadda.in/nogetway.php?guid=${gatewaySetting.guid}&amo=${eventData.refer}&num=${lead.refer}&com=${eventData.referComment}&order-id=${orderIdRefer}`;

                let response, responseRefer;

                if (camp.userPending) {
                    response = { data: { status: 'PENDING', statusMessage: 'Payment pending' } };
                    await PendingPayments({
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
                        message: "You have set to pending all refer amount",
                        orderId: orderId,
                    })
                } else {
                    response = await axios.get(gatewayUrl)
                }
                if (camp.referPending) {
                    await PendingPayments({
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
                        message: "You have set to pending all refer amount",
                        orderId: orderIdRefer,
                    })
                    responseRefer = { data: { status: 'PENDING', statusMessage: 'Payment pending' } };
                } else {
                    responseRefer = await axios.get(gatewayUrlRefer)
                }
                PAYSTATUS = response?.data?.status ?? "UNKNOWN";
                PAYMESSAGE = response?.data?.statusMessage ?? "We cannot check payment status in a custom gateway";

                PAYSTATUSREFER = responseRefer?.data?.status ?? "UNKNOWN";
                PAYMESSAGEREFER = responseRefer?.data?.statusMessage ?? "We cannot check payment status in a custom gateway";


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
                    event: eventData.name
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
                    event: eventData.name
                };
                if (tg.chatId) {
                    let textMessage = `<b>
⚠️ ${camp.name} Conversion Alert ⚠️
♻️ [${camp.offerID}] [${eventData.name}]

🌀 User : ${lead.user} [${eventData.user} Rs]
🔆 Response : ${response?.data?.status + " || " + response?.data?.statusMessage}

📣 Gateway : Earning Area

🌀 Refer : ${lead.refer} [${eventData.refer} Rs]
🔆 Response : ${responseRefer?.data?.status + " || " + responseRefer?.data?.statusMessage}

⛔️ Click to Conv : ${clickToConv} sec
⭐️ Total Leads : ${(totalLeadsCount + 1)} ( Today ${(leadCount + 1)} )

🧲 Powered By <a href='https://earningarea.in/redirectto?instant'>Earning Area</a>
                </b>`;
                    textMessage += responseRefer.status == "ACCEPTED" ? `<b>✅Updated Balance : ${responseRefer.balance}</b>` : "";
                    Notification(tg.chatId, textMessage)
                    let channelPost = `<b>💖 New Payment Done
🛑 Campaign : ${camp.name}

♻️ User Paytm Number : ${hideMiddleFourLetters(lead.user)}
✅ Cashback Distributed : ${eventData.user} Rs.

⭕️ Refer Paytm Number : ${hideMiddleFourLetters(lead.refer)} 
✅ Cashback Distributed : ${eventData.refer} Rs.

⚡️ Powered By ${tg?.label ?? "Earning area"}</b>`
                    if (tg.username) {
                        Notification(tg.username, channelPost)
                    }
                }
                const [payment, paymentReferSave] = await Promise.all([
                    new Payment(paymentData).save(),
                    new Payment(paymentRefer).save()
                ]);
            } else {
                PAYMESSAGE = 'You have not configured your guid';
                PAYMESSAGEREFER = 'You have not configured your guid';
            }
        } else {
            STATUS = 'Approved';
            PAYSTATUS = 'UNKNOWN';
            PAYMESSAGE = "We cannot check payment status in a custom gateway";
            PAYSTATUSREFER = 'UNKNOWN';
            PAYMESSAGEREFER = "We cannot check payment status in a custom gateway";
            if (!gatewaySetting.url) {
                PAYMESSAGE = 'You have not configured your Url';
            }

            const replacements = {
                '{payout_number}': lead.user,
                '{payout_amount}': eventData.user,
                '{comment}': eventData.userComment,
                '{order_id}': orderId,
            };
            const replacementsOfRefer = {
                '{payout_number}': lead.refer,
                '{payout_amount}': eventData.refer,
                '{comment}': eventData.referComment,
                '{order_id}': orderIdRefer,
            };

            const replacedUrlUser = replaceAllPlaceholders(gatewaySetting.url, replacements);
            const replacedUrlRefer = replaceAllPlaceholders(gatewaySetting.url, replacementsOfRefer);

            let response, responseRefer;
            if (camp.userPending) {
                response = { data: { status: 'PENDING', statusMessage: 'Payment pending' } };
                await PendingPayments({
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
                    message: "You have set to pending all refer amount",
                    orderId: orderId,
                })
            } else {
                response = await axios.get(replacedUrlUser)
            }
            if (camp.referPending) {
                await PendingPayments({
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
                    message: "You have set to pending all refer amount",
                    orderId: orderIdRefer,
                })
                responseRefer = { data: { status: 'PENDING', statusMessage: 'Payment pending' } };
            } else {
                responseRefer = await axios.get(replacedUrlRefer)
            }

            PAYSTATUS = response?.data?.status ?? "UNKNOWN";
            PAYMESSAGE = response?.data?.statusMessage ?? "We cannot check payment status in a custom gateway";

            PAYSTATUSREFER = responseRefer?.data?.status ?? "UNKNOWN";
            PAYMESSAGEREFER = responseRefer?.data?.statusMessage ?? "We cannot check payment status in a custom gateway";

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
                event: eventData.name
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
                event: eventData.name
            };
            if (tg.chatId) {
                let textMessage = `<b>
⚠️ ${camp.name} Conversion Alert ⚠️
♻️ [${camp.offerID}] [${eventData.name}]

🌀 User : ${lead.user} [${eventData.user} Rs]
🔆 Response : ${JSON.stringify(response?.data)}

📣 Gateway : Custom

🌀 Refer : ${lead.refer} [${eventData.refer} Rs]
🔆 Response : ${JSON.stringify(responseRefer?.data)}

⛔️ Click to Conv : ${clickToConv} sec
⭐️ Total Leads : ${(totalLeadsCount + 1)} ( Today ${(leadCount + 1)} )

🧲 Powered By <a href='https://earningarea.in/redirectto?instant'>Earning Area</a>
                </b>`;
                Notification(tg.chatId, textMessage)

                let channelPost = `<b>💖 New Lead Tracked
🛑 Campaign : ${camp.name}

♻️ User Paytm Number : ${hideMiddleFourLetters(lead.user)}
✅ Cashback Distributed : ${eventData.user} Rs.

⭕️ Refer Paytm Number : ${hideMiddleFourLetters(lead.refer)} 
✅ Cashback Distributed : ${eventData.refer} Rs.

⚡️ Powered By ${tg?.label ?? "Earning area"}</b>`
                if (tg.username) {
                    Notification(tg.username, channelPost)
                }
            }
            const [payment, paymentReferSave] = await Promise.all([
                new Payment(paymentData).save(),
                new Payment(paymentRefer).save()
            ]);
        }

        await saveLead({
            ...lead,
            status: STATUS,
            message: "This Lead request has been successfully completed. Please check payment status.",
            payMessage: PAYMESSAGE,
            paymentStatus: PAYSTATUS,
            referPaymentStatus: PAYSTATUSREFER,
            referPayMessage: PAYMESSAGEREFER,
            ReferpaymentStatus: ""
        });
    } catch (error) {
        console.log("Error:", error);
        throw new Error("Payment handling failed");
    }
};

module.exports = handelPayment;


