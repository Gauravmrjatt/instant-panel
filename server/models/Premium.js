const mongoose = require("mongoose");

const { Schema } = mongoose;

const PremiumSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
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
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    discount: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    payStatus: {
        type: String,
        required: true,
        default: "unpaid"
    },
    ExpireAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        required: true
    },
});

const Premium = mongoose.model("Premium", PremiumSchema);

module.exports = Premium;
