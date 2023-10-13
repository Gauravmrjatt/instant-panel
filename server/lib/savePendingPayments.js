const PendingPayments = require("../models/PendingPayments");

const Pending = async (lead) => {
    const savePending = new PendingPayments(lead);
    await savePending.save();
};

module.exports = Pending;
