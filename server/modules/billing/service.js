const Premium = require("./model");

async function getBilling(user) {
  const { _id } = user;
  if (!user.premium) {
    return { status: false, msg: "You don't have any plan", code: 0, plan: user.plan, expireAt: user.premiumExpireDate };
  }
  const billingData = await Premium.findOne({ userId: _id }).sort({ createdAt: -1 }).lean();
  return { status: true, msg: "Billing details found", data: billingData || null };
}

module.exports = { getBilling };
