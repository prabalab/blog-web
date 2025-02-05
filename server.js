require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(cors());

const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  console.error("ERROR: Missing JWT_SECRET. Set it in Render environment variables.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);

// Route to serve the main React page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "registration.html"));
});

// Route to serve the main React page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Route to serve the main React page
app.get("/loginr", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nlog.html"));
});

// Route to serve the main React page
app.get("/login-p", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "protect.html"));
});

/** 🔹 Protected Route to Fetch User Details */
app.get("/api/user", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password"); // Exclude password
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
