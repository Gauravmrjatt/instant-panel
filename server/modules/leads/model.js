const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  campId: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
  clickId: { type: mongoose.Schema.Types.ObjectId, ref: "click" },
  click: { type: String },
  user: { type: String },
  userAmount: { type: Number },
  referAmount: { type: Number },
  refer: { type: String },
  ip: { type: String },
  event: { type: String },
  status: { type: String, default: "Pending" },
  paymentStatus: { type: String, default: "PENDING" },
  payMessage: { type: String, default: "" },
  referPaymentStatus: { type: String, default: "PENDING" },
  referPayMessage: { type: String, default: "" },
  message: { type: String },
  params: { type: Object, default: {} },
  clicktoconv: { type: String },
  uniqueClick: { type: Object, unique: true },
  createdAt: { type: Date, default: Date.now },
});

LeadSchema.index({ userId: 1, campId: 1, createdAt: -1 });
LeadSchema.index({ campId: 1, event: 1, status: 1, createdAt: -1 });
LeadSchema.index({ campId: 1, user: 1, event: 1 });
LeadSchema.index({ campId: 1, ip: 1, event: 1 });
LeadSchema.index({ campId: 1, user: 1, click: 1, event: 1, status: 1 });
LeadSchema.index({ campId: 1, clickId: 1, event: 1 });
LeadSchema.index({ clickId: 1, event: 1 });

module.exports = mongoose.model("lead", LeadSchema);
