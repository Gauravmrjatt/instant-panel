const mongoose = require("mongoose");

const { Schema } = mongoose;

const BanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: String, required: true },
  number: {
    type: String,
    required: true,
  },
  banDate: {
    type: Date,
    default: Date.now,
  },
});

const Ban = mongoose.model("Ban", BanSchema);

module.exports = Ban;
