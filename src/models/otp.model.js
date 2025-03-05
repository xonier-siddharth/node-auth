const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        expiration: { type: Date, required: true, index: { expires: 0 } },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Otp', otpSchema);