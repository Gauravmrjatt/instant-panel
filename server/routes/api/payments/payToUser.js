const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth")
const Leads = require("../../../models/Leads")
const GetwaySettings = require('../../../models/GatewaySettings');
const { default: axios } = require("axios");
const Ban = require("../../../models/Ban")
const Notification = require('../../../lib/handelNotification')
router.post("/", authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const { amount, user, comment } = req.body.pay
        if (!amount || !user) {
            return res.json({
                status: false,
                msg: "Number and Amount are required"
            })
        }
        const checkban = await Ban.findOne({ userId: userDetails._id, number: user })
        if (checkban) {
            return res.json({
                status: false,
                msg: "Number is Ban",
            })
        }
        const gatewaySetting = await GetwaySettings.findOne({ userId: userDetails._id });
        if (!gatewaySetting) {
            return res.json({
                status: false,
                msg: "Gateway Setting not found",
            })
        }
        if (gatewaySetting.type === "Earning Area") {
            if (gatewaySetting.guid) {
                const gatewayUrl = `https://toolsadda.in/nogetway.php?guid=${gatewaySetting.guid}&amo=${amount}&num=${user}&com=${comment}`;
                const { data } = await axios.get(gatewayUrl)
                let textMessage = `<b>⚡️New Paid ✅
Number : ${user}
Amount : ${amount}
Comment : ${comment}

Gateway :- EarningArea

Response : ${JSON.stringify(data)}
</b>`;
                if (userDetails.tgId.chatId) {
                    try {
                        Notification(userDetails.tgId.chatId, textMessage)
                    } catch (erorr) {

                    }
                }
                return res.json({
                    status: true,
                    msg: "Request Successful",
                    type: 'ea',
                    data
                })
            } else {
                return res.json({
                    status: false,
                    msg: "Guid not found ",
                })
            }
        }
        else {
            if (!gatewaySetting.url) {
                return res.json({
                    status: false,
                    msg: "Url not found ",
                })
            }
            const replacements = {
                '{payout_number}': user,
                '{payout_amount}': amount,
                '{comment}': comment ?? '',
                '{order_id}': generateRandomOrderId(10),
            };
            const replacedUrl = replaceAllPlaceholders(gatewaySetting.url, replacements);
            const { data } = await axios.get(replacedUrl)
            let textMessage = `<b>⚡️New Paid ✅
Number : ${user}
Amount : ${amount}
Comment : ${comment}

Gateway :- Custom

Response : ${JSON.stringify(data)}
</b>`;
            console.log(userDetails);
            if (userDetails.tgId.chatId) {
                try {
                    Notification(userDetails.tgId.chatId, textMessage)
                } catch (erorr) {

                }
            }
            return res.json({
                status: true,
                msg: "Request Successful",
                type: 'custom',
                data
            })
        }

    } catch (error) {
        res.json({
            status: false,
            msg: "Somthing went wrong",
            error
        })
        console.log(error);
    }
});

module.exports = router;


function replaceAllPlaceholders(str, replacements) {
    for (const placeholder in replacements) {
        const replaceValue = replacements[placeholder];
        str = str?.replace(new RegExp(placeholder, 'g'), replaceValue);
    }
    return str;
}

function generateRandomOrderId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let orderId = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        orderId += characters.charAt(randomIndex);
    }

    return orderId;
}

