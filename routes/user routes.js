const express = require("express");
const User = require("../models/User"); // Import the User model
const authMiddleware = require("../authMiddleware"); // Middleware for token verification

const router = express.Router();

/** 🔹 Protected Route to Fetch User Details */
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password"); // Exclude password
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
