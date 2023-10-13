const mongoose = require("mongoose");
const { Schema } = mongoose;

const PendingSchema = new Schema({
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
    user: {
        type: String,
        required: true
    },
    userAmount: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        required: true,
        default: "Payment is not Initiated"
    },
    ip: {
        type: String,
        required: true,
    },
    event: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        required: true,
        default: "UNKNOWN"
    },
    payMessage: {
        type: String,
        required: true,
        default: "Payment is not Initiated"
    },
    message: {
        type: String,
        required: true,
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
    },
    orderId: {
        type: String,
        unique: true,
        required: [true, "Unique Order ID is required"],
        message: 'Duplicate ClickID'
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        required: true
    },
});

const Pending = mongoose.model("PendingPayment", PendingSchema);

module.exports = Pending;
