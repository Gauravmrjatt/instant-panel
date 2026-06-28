const mongoose = require("mongoose");

const GatewaySettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  user: { type: String },
  type: { type: String, default: "Earning Area" },
  guid: { type: String },
  url: { type: String },
});

module.exports = mongoose.model("getwaySetting", GatewaySettingsSchema);
