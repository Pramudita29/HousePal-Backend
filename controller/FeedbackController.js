const Feedback = require("../model/Feedback"); // Import your Feedback model

// Create new feedback
const createFeedback = async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body);
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(400).json({ message: "Error creating feedback", error: err });
  }
};

// Get all feedback
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving feedback", error: err });
  }
};

// Get a single feedback by ID
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving feedback", error: err });
  }
};

// Update feedback
const updateFeedback = async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedFeedback) return res.status(404).json({ message: "Feedback not found" });
    res.status(200).json(updatedFeedback);
  } catch (err) {
    res.status(400).json({ message: "Error updating feedback", error: err });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!deletedFeedback) return res.status(404).json({ message: "Feedback not found" });
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting feedback", error: err });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
};
