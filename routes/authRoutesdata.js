const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// Nodemailer Setup
// Create a Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your Gmail address
    pass: process.env.EMAIL_PASS,  // Your 16-character Gmail App Password
  },
});

// Function to generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ✅ **1. User Registration & Send OTP**
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP & expiry
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Save user to DB (unverified)
    const newUser = new User({ name, email, password: hashedPassword, otp, otpExpires });
    await newUser.save();

    // Send OTP via email
    /*const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };*/

    const mailOptions = {
  from: process.env.EMAIL_USER,  // Sender's email address
  to: 'mithun.ultra@yahoo.com',  // Recipient's email address
  subject: 'OTP for Email Verification',
  text: 'Your OTP is 123456', // OTP message
};

    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ error: "Error sending OTP" });
      res.json({ message: "OTP sent. Please verify your email." });
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ **2. Verify OTP**
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.isVerified) return res.status(400).json({ error: "Email already verified" });

    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    if (user.otpExpires < new Date()) return res.status(400).json({ error: "OTP expired" });

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ **3. Resend OTP**
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "Email already verified" });

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your New OTP Code",
      text: `Your new OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ error: "Error sending OTP" });
      res.json({ message: "New OTP sent" });
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
