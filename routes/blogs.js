const express = require('express');
const Blog = require('../models/Blog');
const User = require('../models/User');
const router = express.Router();

// Route to get all blogs with the writer's name
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('userId', 'name') // Populate the userId with the user's name
            .sort({ createdAt: -1 });  // Sort blogs by creation date in descending order

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ message: "No blogs found" });
        }

        // Send blogs with the writer's name included
        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Error fetching blogs" });
    }
});

// Get a single blog by ID
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("userId", "name");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blog", error });
    }
});

module.exports = router;
