const mongoose = require("mongoose");

const BanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: String },
  number: { type: String },
  banDate: { type: Date, default: Date.now },
});
BanSchema.index({ userId: 1, number: 1 });

module.exports = mongoose.model("Ban", BanSchema);
