const express = require("express");
const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Submit Blog
router.post("/submit", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ message: "Title and Content are required" });

        // Create new blog post
        const newBlog = new Blog({
            title,
            content,
            userId: req.user.userId // Extracted from token in middleware
        });

        await newBlog.save();
        res.status(201).json({ message: "Blog submitted successfully!", blog: newBlog });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Fetch all blogs of the logged-in user
router.get("/user-blogs", authMiddleware, async (req, res) => {
    try {
        const blogs = await Blog.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Edit a blog post (only by the owner)
router.put("/edit/:id", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const blog = await Blog.findOne({ _id: req.params.id, userId: req.user.userId });

        if (!blog) {
            return res.status(404).json({ message: "Blog not found or unauthorized" });
        }

        blog.title = title;
        blog.content = content;
        await blog.save();

        res.json({ message: "Blog updated successfully", blog });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Delete a blog post (only by the owner)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

        if (!blog) {
            return res.status(404).json({ message: "Blog not found or unauthorized" });
        }

        res.json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
