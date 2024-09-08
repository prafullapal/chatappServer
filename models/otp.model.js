const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  otpCode: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("OTP", OTPSchema);
