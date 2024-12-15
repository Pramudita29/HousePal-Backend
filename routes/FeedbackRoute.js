const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} = require("../controller/FeedbackController"); // Adjust the path if necessary

const FeedbackValidation=require("../validation/FeedbackValidation");


// Define routes
router.post("/",FeedbackValidation ,createFeedback); // Create new feedback
router.get("/", getAllFeedback); // Get all feedback
router.get("/:id", getFeedbackById); // Get a single feedback by ID
router.put("/:id", updateFeedback); // Update feedback by ID
router.delete("/:id", deleteFeedback); // Delete feedback by ID

module.exports = router;
