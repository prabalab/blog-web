require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // Import User Routes
const blogRoutes = require("./routes/blogRoutes");

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

// Route to serve the main React page
app.get("/user-profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user-profile.html"));
});

//Blog form
app.get("/blog-form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "blog-form.html"));
});

/** 🔹 Use the User Routes */
app.use("/api/user", userRoutes);

// Use blog routes
app.use("/api/blogs", blogRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
