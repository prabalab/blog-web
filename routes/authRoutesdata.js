const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

    // Check if the email already exists and is verified
const existingUser = await User.findOne({ email });

if (existingUser && existingUser.isVerified) {
  return res.status(400).json({ error: "Email already exists and is verified" });
}

    if (existingUser && !existingUser.isVerified) {
const otp = generateOTP(); // Generate 6-digit OTP
const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findOneAndUpdate(
  { email }, // Find user by email
  { name, password: hashedPassword, otp, otpExpires }, // Update fields
  { new: true, runValidators: true } // Return updated doc & validate fields
);

console.log(updatedUser);


      const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

      transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending OTP:", error); // Log the full error
    return res.status(500).json({ error: "Error sending OTP", details: error.message });
  }
  console.log("OTP sent successfully:", info);
  res.json({ message: "OTP sent. Please verify your email." });
});

    return res.status(400).json({ error: "Email already exists but is not verified. Please verify your email." });
      
    }
    else {
// Send OTP via email (assuming a sendMail function exists)
//await sendMail(existingUser.email, "Your OTP Code", `Your OTP is ${otp}`);

return res.status(200).json({ message: "OTP sent successfully" });
    // Check if the email already exists
    /*const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });
*/
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP & expiry
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Save user to DB (unverified)
    const newUser = new User({ name, email, password: hashedPassword, otp, otpExpires });
    await newUser.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

   /* transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ error: "Error sending OTP" });
      res.json({ message: "OTP sent. Please verify your email." });
    });*/

    transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending OTP:", error); // Log the full error
    return res.status(500).json({ error: "Error sending OTP", details: error.message });
  }
  console.log("OTP sent successfully:", info);
  res.json({ message: "OTP sent. Please verify your email." });
});
    }

  } catch (err) {
  console.error("Registration Error:", err); // Log the full error
  res.status(500).json({ error: "Server error", details: err.message });
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

router.get('/usersdata', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Return the list of users as a JSON response
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

//Delete user
router.delete('/usersdata/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

//login router 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user is verified
    if (!user.isVerified) return res.status(400).json({ message: "User not verified" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
