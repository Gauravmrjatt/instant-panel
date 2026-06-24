const Campaign = require("../../modules/campaigns/model");
const Click = require("../../modules/clicks/model");
const Lead = require("../../modules/leads/model");
const Payment = require("../../modules/payments/model");
const PendingPayment = require("../../modules/payments/model").PendingPayment;
const Ban = require("../../modules/ban/model");
const CustomAmount = require("../../modules/custom-amount/model");
const GatewaySettings = require("../../modules/gateway-settings/model");

async function createCampaign(userId, userName, overrides = {}) {
  const offerID = Math.floor(Math.random() * 900000) + 100000;
  return Campaign.create({
    userId,
    user: userName,
    name: "Test Campaign",
    offerID,
    campStatus: true,
    paytm: true,
    ip: true,
    same: true,
    tracking: "test-tracking",
    postbackToken: "camp_token_" + Date.now(),
    uniqueOfferID: { offerID },
    events: [
      {
        name: "lead",
        user: 100,
        refer: 50,
        userComment: "User commission",
        referComment: "Refer commission",
        caps: 0,
        dailyCaps: 0,
        time: 0,
        payMode: "auto",
      },
      {
        name: "install",
        user: 200,
        refer: 100,
        userComment: "User commission for install",
        referComment: "Refer commission for install",
        caps: 0,
        dailyCaps: 0,
        time: 0,
        payMode: "auto",
      },
    ],
    ...overrides,
  });
}

async function createClick(userId, campId, userName, overrides = {}) {
  return Click.create({
    userId,
    campId,
    click: "click_" + Date.now(),
    user: userName,
    refer: "refer_" + Date.now(),
    number: "9876543210",
    ip: "127.0.0.1",
    device: { client: { type: "test" }, os: { name: "test" } },
    params: { source: "test" },
    ...overrides,
  });
}

async function createLead(userId, campId, clickId, overrides = {}) {
  return Lead.create({
    userId,
    campId,
    clickId,
    click: "click_ref",
    user: "test_user",
    userAmount: 100,
    referAmount: 50,
    refer: "test_refer",
    ip: "127.0.0.1",
    event: "lead",
    status: "Approved",
    message: "Test lead",
    uniqueClick: { campId: campId.toString(), event: "lead", clickId: clickId.toString() },
    ...overrides,
  });
}

async function createBan(userId, number) {
  return Ban.create({
    userId,
    user: "test_user",
    number,
  });
}

async function createCustomAmount(userId, campId, overrides = {}) {
  return CustomAmount.create({
    userId,
    user: "test_user",
    campId,
    number: "test_refer",
    event: "lead",
    userAmount: 150,
    referAmount: 75,
    referInstant: true,
    ...overrides,
  });
}

async function createPayment(userId, campId, clickId, overrides = {}) {
  return Payment.create({
    userId,
    campId,
    clickId,
    number: "9876543210",
    amount: 100,
    comment: "Test payment",
    type: "Earning Area",
    response: { status: "ACCEPTED" },
    for: "user",
    event: "lead",
    payUrl: "https://example.com/pay",
    ...overrides,
  });
}

async function createPendingPayment(userId, campId, clickId, overrides = {}) {
  return PendingPayment.create({
    userId,
    campId,
    clickId,
    user: "test_user",
    userAmount: 100,
    type: "user",
    ip: "127.0.0.1",
    event: "lead",
    status: "PENDING",
    message: "Pending payment",
    orderId: "order_" + Date.now(),
    ...overrides,
  });
}

async function createGatewaySettings(userId, user, overrides = {}) {
  return GatewaySettings.create({
    userId,
    user,
    type: "Earning Area",
    guid: "test_guid",
    url: null,
    ...overrides,
  });
}

module.exports = {
  createCampaign,
  createClick,
  createLead,
  createPayment,
  createPendingPayment,
  createBan,
  createCustomAmount,
  createGatewaySettings,
};
