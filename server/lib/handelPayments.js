const GetwaySettings = require("../models/GatewaySettings");
const axios = require('axios');
function generateRandomOrderId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const orderIdLength = length || 10; // Default length is 10
    let orderId = '';

    for (let i = 0; i < orderIdLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        orderId += characters.charAt(randomIndex);
    }

    return orderId;
}
function replaceAllPlaceholders(str, replacements) {
    for (const placeholder in replacements) {
        const replaceValue = replacements[placeholder];
        str = str?.replace(new RegExp(placeholder, 'g'), replaceValue);
    }
    return str;
}
const handelPayment = async (userId, number, amount, comment) => {
    try {
        const gatewaySetting = await GetwaySettings.findOne({ userId });
        const orderId = "inst-pend-" + generateRandomOrderId(7);
        if (!gatewaySetting) {
            return {
                status: "fail",
                statusMessage: "You have not configred your gateway settings"
            }
        }

        if (gatewaySetting.type === "Earning Area") {
            if (!gatewaySetting.guid) {
                return {
                    status: "fail",
                    statusMessage: "You have not configred your guid"
                }
            }
            else {
                const gatewayUrl = `https://toolsadda.in/nogetway.php?guid=${gatewaySetting.guid}&amo=${amount}&num=${number}&com=${comment}&order-id=${orderId}`;
                const response = await axios.get(gatewayUrl)
                return response.data
            }
        }
        else {
            if (!gatewaySetting.url) {
                return {
                    status: "fail",
                    statusMessage: "You have not configred your url"
                }
            }
            const replacements = {
                '{payout_number}': number,
                '{payout_amount}': amount,
                '{comment}': comment,
                '{order_id}': orderId,
            };
            const replacedUrl = replaceAllPlaceholders(gatewaySetting.url, replacements);
            const response = await axios.get(replacedUrl)
            return response.data
        }

    } catch (error) {
        console.log("Error:", error);
        throw new Error("Payment handling failed");
    }
};

module.exports = handelPayment;


