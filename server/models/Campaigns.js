const mongoose = require("mongoose");

const { Schema } = mongoose;
const EventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: Number,
    required: true,
  },
  refer: {
    type: Number,
    required: true,
  },
  userComment: {
    type: String,
    required: true,
  },
  referComment: {
    type: String,
    required: true,
  },
  caps: {
    type: Number,
    default: "",
  },
  dailyCaps: {
    type: Number,
    default: 0,
  },
  eventNumber: {
    type: Number,
    default: { $indexOfArray: ["$arrayField", "element"] },
    required: true,
    unique: true,
  },
  time: {
    type: Number,
    required: true,
  },
  payMode: {
    type: String,
    required: true,
    default: "auto",
  },
});

const CampaignSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  user: { type: String, required: [true, "User is required"] },
  name: {
    type: String,
    required: [true, "Campaign name is required"],
  },
  offerID: {
    type: Number,
    required: [true, "Offer ID is required"],
  },
  campStatus: {
    type: Boolean,
    default: true,
  },
  paytm: {
    type: Boolean,
    required: [true, "Paytm field is required"],
  },
  ip: {
    type: Boolean,
    required: [true, "IP field is required"],
  },
  same: {
    type: Boolean,
    required: [true, "Same field is required"],
  },
  crDelay: {
    type: Boolean,
  },
  delay: String,
  prevEvent: {
    type: Boolean,
    default: true,
  },
  userPending: {
    type: Boolean,
    default: false,
  },
  referPending: {
    type: Boolean,
    default: false,
  },
  tracking: {
    type: String,
    required: true,
  },
  uniqueOfferID: {
    type: Object,
    unique: true,
    required: [true, "Unique offer ID is required"],
    message: "Duplicate OfferID",
  },
  ips: {
    type: Array,
    default: null,
  },
  events: {
    type: Array,
    required: [true, "Events are required"],
    EventSchema,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    required: true,
  },
});

const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = Campaign;
