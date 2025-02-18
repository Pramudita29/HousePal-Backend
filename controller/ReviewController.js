const Review = require("../model/Review");
const Task = require("../model/Tasks");
const mongoose = require("mongoose"); // Added

const createReview = async (req, res) => {
  try {
    const { seekerId, helperId, taskId, rating, comments } = req.body;
    console.log("Creating review with data:", { seekerId, helperId, taskId, rating, comments });

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.log("Invalid taskId:", taskId);
      return res.status(400).json({ error: "Invalid task ID format" });
    }

    const task = await Task.findById(taskId);
    console.log("Found task:", task);
    if (!task || task.status !== "completed") {
      console.log("Task check failed:", { taskExists: !!task, status: task?.status });
      return res.status(400).json({ error: "Task is not completed yet" });
    }

    const review = new Review({ seekerId, helperId, taskId, rating, comments });
    await review.save();
    console.log("Review saved:", review);

    res.status(201).json({ message: "Review created successfully", review });
  } catch (error) {
    console.error("Error in createReview:", error.stack);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const getReviewsForHelper = async (req, res) => {
  try {
    const reviews = await Review.find({ helperId: req.params.helperId })
      .populate("seekerId", "fullName")
      .populate("taskId", "jobCategory");
    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found for this helper" });
    }
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in getReviewsForHelper:", error.stack);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const getReviewsForSeeker = async (req, res) => {
  try {
    const reviews = await Review.find({ seekerId: req.params.seekerId })
      .populate("helperId", "fullName")
      .populate("taskId", "jobCategory");
    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found for this seeker" });
    }
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in getReviewsForSeeker:", error.stack);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

module.exports = { createReview, getReviewsForHelper, getReviewsForSeeker };