const PendingPayments = require("../modules/payments/model").PendingPayment;

const Pending = async (lead) => {
    const savePending = new PendingPayments(lead);
    await savePending.save();
};

module.exports = Pending;
