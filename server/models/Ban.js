const mongoose = require("mongoose");

const { Schema } = mongoose;

const BanSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: String, required: true },
    number: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
    },
    banDate: {
        type: Date,
        default: Date.now,
    },
});

const Ban = mongoose.model("Ban", BanSchema);

module.exports = Ban;
