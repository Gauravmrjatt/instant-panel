const mongoose = require("mongoose");

const ClickSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  campId: { type: mongoose.Schema.Types.ObjectId, ref: "campaign" },
  click: { type: String, unique: true },
  user: { type: String },
  refer: { type: String },
  number: { type: String },
  ip: { type: String },
  device: { type: Object, default: {} },
  params: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: { expires: "90d" } },
});

ClickSchema.index({ userId: 1, campId: 1, createdAt: -1 });
ClickSchema.index({ click: 1, userId: 1 });
ClickSchema.index({ campId: 1, createdAt: -1 });

module.exports = mongoose.model("click", ClickSchema);
