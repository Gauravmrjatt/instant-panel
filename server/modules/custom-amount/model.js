const mongoose = require("mongoose");

const CustomAmountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: String },
  campId: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
  number: { type: String },
  name: { type: String },
  event: { type: String },
  userAmount: { type: Number },
  referAmount: { type: Number },
  userComment: { type: String },
  referInstant: { type: Boolean },
  referComment: { type: String },
  createdAt: { type: Date, default: Date.now },
});
CustomAmountSchema.index({ number: 1, event: 1, campId: 1 });
CustomAmountSchema.index({ userId: 1, campId: 1 });

module.exports = mongoose.model("CustomAmount", CustomAmountSchema);
