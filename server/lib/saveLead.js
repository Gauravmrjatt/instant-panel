const Lead = require("../modules/leads/model");

const saveLeadd = async (lead) => {
  const saveLead = new Lead(lead);
  await saveLead.save();
};

module.exports = saveLeadd;
