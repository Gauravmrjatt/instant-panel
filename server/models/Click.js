const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClickSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    campId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    click: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true
    },
    refer: {
        type: String,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    device: {
        type: Object,
        required: true,
    },
    params: {
        type: Object,
        default: ""
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        required: true
    },
});

const Click = mongoose.model("Click", ClickSchema);

module.exports = Click;
