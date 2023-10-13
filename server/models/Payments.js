const mongoose = require("mongoose");

const { Schema } = mongoose;

const PaymentsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    campId: {
        type: Schema.Types.ObjectId,
        ref: "Campaign",
        required: true
    },
    clickId: {
        type: Schema.Types.ObjectId,
        ref: "Click",
        required: true
    },
    number: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    for: {
        type: String,
        required: true,
    },
    event: {
        type: String,
        required: true,
    },
    payUrl: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: () => Date.now(),
        required: true
    },
});

const Ban = mongoose.model("Payment", PaymentsSchema);

module.exports = Ban;
