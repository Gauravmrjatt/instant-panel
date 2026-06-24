const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  campId: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
  clickId: { type: mongoose.Schema.Types.ObjectId, ref: "click" },
  number: { type: String },
  amount: { type: Number, default: 0 },
  comment: { type: String, default: "" },
  type: { type: String, default: "" },
  response: { type: mongoose.Schema.Types.Mixed, default: {} },
  for: { type: String },
  event: { type: String },
  payUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ campId: 1 });

const PendingPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  campId: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
  clickId: { type: mongoose.Schema.Types.ObjectId, ref: "click" },
  user: { type: String },
  userAmount: { type: Number },
  type: { type: String },
  ip: { type: String },
  event: { type: String },
  status: { type: String, default: "PENDING" },
  paymentStatus: { type: String, default: "PENDING" },
  payMessage: { type: String, default: "" },
  message: { type: String, default: "" },
  response: { type: mongoose.Schema.Types.Mixed },
  orderId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

PendingPaymentSchema.index({ userId: 1, campId: 1, status: 1, paymentStatus: 1, type: 1 });
PendingPaymentSchema.index({ userId: 1, status: 1, paymentStatus: 1 });

module.exports = mongoose.model("payment", PaymentSchema);
module.exports.PendingPayment = mongoose.model("pendingPayment", PendingPaymentSchema);
