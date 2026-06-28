const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  device: { type: Object },
  ip: { type: String },
});
LoginSchema.index({ userId: 1, createdAt: -1 });

const ResetPasswordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String },
  expires: { type: Date },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
ResetPasswordSchema.index({ token: 1 });
ResetPasswordSchema.index({ userId: 1 });

module.exports = mongoose.model("Login", LoginSchema);
module.exports.ResetPassword = mongoose.model("ResetPassword", ResetPasswordSchema);
