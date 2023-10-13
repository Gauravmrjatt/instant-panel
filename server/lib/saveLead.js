const Lead = require("../models/Leads");

const saveLeadd = async (lead) => {
    const saveLead = new Lead(lead);
    await saveLead.save();
};

module.exports = saveLeadd;
