const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeadSchema = new Schema({
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
    click: {
        type: String,
        default: ""
    },
    user: {
        type: String,
        required: true
    },
    userAmount: {
        type: Number,
        default: 0
    },
    referAmount: {
        type: Number,
        default: 0
    },
    refer: {
        type: String,
        required: true,
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
    referPaymentStatus: {
        type: String,
        required: true,
        default: "UNKNOWN"
    },
    referPayMessage: {
        type: String,
        required: true,
        default: "Payment is not Initiated"
    },
    message: {
        type: String,
        required: true,
    },
    params: {
        type: Object,
        default: ""
    },
    clicktoconv: {
        type: String,
        default: ''
    },
    uniqueClick: {
        type: Object,
        unique: true,
        required: [true, "Unique Click id ID is required"],
        message: 'Duplicate ClickID'
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        required: true
    },
});

const Lead = mongoose.model("Lead", LeadSchema);

module.exports = Lead;
