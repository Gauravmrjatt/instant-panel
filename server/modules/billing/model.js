const mongoose = require("mongoose");

const PremiumSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  number: { type: Number },
  amount: { type: Number },
  comment: { type: String },
  type: { type: String },
  email: { type: String },
  name: { type: String },
  discount: { type: Number },
  status: { type: String },
  payStatus: { type: String },
  ExpireAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});
PremiumSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Premium", PremiumSchema);
