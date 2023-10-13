const mongoose = require("mongoose");

const { Schema } = mongoose;

const loginToken = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, required: true, default: () => Date.now() },
    device: { type: Object, default: null, required: true },
    ip: { type: String, default: null }
});

module.exports = mongoose.model('loginToken', loginToken);
