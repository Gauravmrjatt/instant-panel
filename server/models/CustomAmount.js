const mongoose = require("mongoose");

const { Schema } = mongoose;

const CustomAmountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: String, required: true },
  campId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  number: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  event: {
    type: String,
  },
  userAmount: {
    type: Number,
    default: "",
  },
  referAmount: {
    type: Number,
    default: 0,
  },
  userComment: {
    type: String,
  },
  referInstant: {
    type: Boolean,
    default: true,
  },

  referComment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

const CustomAmount = mongoose.model("CoustomAmount", CustomAmountSchema);

module.exports = CustomAmount;
