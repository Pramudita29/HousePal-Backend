const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  HelperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Helper",
    required: true,
  },
  seekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seeker",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comments: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
