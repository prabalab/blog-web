const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false }, // Email verification status
    otp: { type: String }, // OTP for email verification
    otpExpires: { type: Date }, // OTP expiration time
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("User", UserSchema);
