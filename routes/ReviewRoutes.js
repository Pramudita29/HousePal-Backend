const express = require("express");
const router = express.Router();
const reviewController = require("../controller/ReviewController");

// POST route to create a review
router.post("/create", reviewController.createReview);

// GET route to get reviews for a specific helper
router.get("/helper/:helperId", reviewController.getReviewsForHelper);

// GET route to get reviews for a specific seeker
router.get("/seeker/:seekerId", reviewController.getReviewsForSeeker);

module.exports = router;
