const mongoose = require("mongoose");

const { Schema } = mongoose;

const GatewaySettings = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    user: { type: String, required: true, unique: true },
    type: { type: String, default: "Earning Area" },
    guid: { type: String, default: null },
    url: { type: String, default: null }
});

module.exports = mongoose.model('GatewaySetting', GatewaySettings);
