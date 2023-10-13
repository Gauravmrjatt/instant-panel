const mongoose = require("mongoose");

const { Schema } = mongoose;

const resetPasswordSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: true },
    expires: { type: Date, required: true },
    isUsed: { type: Boolean, default: false, required: true },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        required: true
    },
});

module.exports = mongoose.model('ResetPassword', resetPasswordSchema);
