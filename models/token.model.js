const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  isValid: { type: Boolean, default: true },
  refreshToken: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Token", TokenSchema);
