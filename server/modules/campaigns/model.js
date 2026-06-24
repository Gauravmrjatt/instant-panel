const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: Number, required: true },
  refer: { type: Number, required: true },
  userComment: { type: String, required: true },
  referComment: { type: String, required: true },
  caps: { type: Number, default: "" },
  dailyCaps: { type: Number, default: 0 },
  eventNumber: { type: Number, default: { $indexOfArray: ["$arrayField", "element"] }, required: true, unique: true },
  time: { type: Number, required: true },
  payMode: { type: String, required: true, default: "auto" },
});

const CampaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: String, required: true },
  name: { type: String },
  offerID: { type: Number, required: true },
  campStatus: { type: Boolean, default: true },
  paytm: { type: Boolean, default: false },
  ip: { type: Boolean, default: false },
  same: { type: Boolean, default: true },
  crDelay: { type: Boolean },
  delay: String,
  prevEvent: { type: Boolean, default: true },
  postbackToken: { type: String, unique: true, sparse: true },
  userPending: { type: Boolean, default: false },
  referPending: { type: Boolean, default: false },
  tracking: { type: String, default: "" },
  uniqueOfferID: { type: Object, unique: true, required: true, message: "Duplicate OfferID" },
  ips: { type: Array, default: null },
  events: { type: Array, required: true, EventSchema },
  createdAt: { type: Date, default: Date.now },
});

CampaignSchema.index({ userId: 1, createdAt: -1 });
CampaignSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model("campaign", CampaignSchema);
