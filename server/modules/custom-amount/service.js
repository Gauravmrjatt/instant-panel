const CustomAmount = require("./model");

async function createCustomAmount(userId, user, data) {
  const { number, name, event, campId, userAmount, referAmount, userComment, referComment, referInstant } = data;
  const existing = await CustomAmount.findOne({ number, event, campId });
  if (existing) return { status: false, msg: "Custom amount already exists for this number/campaign/event" };
  await new CustomAmount({ userId, user, number, name, event, campId, userAmount, referAmount, userComment, referComment, referInstant }).save();
  return { status: true, msg: "Custom Amount added successfully" };
}

async function getCustomAmounts(userId) {
  const data = await CustomAmount.find({ userId }).populate("campId", "name offerID").lean();
  return { status: true, data };
}

async function deleteCustomAmount(id) {
  await CustomAmount.findByIdAndDelete(id);
  return { status: true, msg: "Deleted Successfully" };
}

async function deleteAllCustomAmounts(userId) {
  await CustomAmount.deleteMany({ userId });
  return { status: true, msg: "All deleted" };
}

async function deleteBatchCustomAmounts(ids) {
  await CustomAmount.deleteMany({ _id: { $in: ids } });
  return { status: true, msg: "Selected deleted" };
}

module.exports = { createCustomAmount, getCustomAmounts, deleteCustomAmount, deleteAllCustomAmounts, deleteBatchCustomAmounts };
