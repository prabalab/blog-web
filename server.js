require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
//const authRoutes = require("./routes/authRoutes");
const authRoutesdata = require("./routes/authRoutesdata");
const userRoutes = require("./routes/userRoutes"); // Import User Routes
const blogRoutes = require("./routes/blogRoutes");
const blogRoutesdata = require('./routes/blogs'); // Import the blog routes
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
//app.use("/api/auth", authRoutes);

app.use("/api/authdata", authRoutesdata);

// Route to serve the main React page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "registration.html"));
});

// Route to serve the main React page
app.get("/otp-reg", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "otp-reg.html"));
});
//delete data
app.get("/userdatas", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "userdata.html"));
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

//user blog display 
app.get("/user-blog", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user-bg.html"));
});

//all blogs show
app.get("/all-blog", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "allblogs.html"));
});

//all blogs show
app.get("/blog-list", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "bloglist.html"));
});

//all blogs show one by one
app.get("/blog-one", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "blogone.html"));
});

//all blogs show one by one
app.get("/blog/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "blogone.html"));
});

/** 🔹 Use the User Routes */
app.use("/api/user", userRoutes);

// Use blog routes
app.use("/api/blogs", blogRoutes);

// Use blog routes
app.use('/api/blogsdata', blogRoutesdata);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
