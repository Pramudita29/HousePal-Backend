// JobApplication.js
const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job", // References the Job model
    required: true,
  },
  applicantEmail: {
    type: String, // Changed from mongoose.Schema.Types.ObjectId to String
    required: true,
  },
  helperDetails: {
    fullName: String,
    email: String,
    contactNo: String,
    skills: [String],
    experience: String,
    image: String,
  },
  appliedAt: {
    type: Date,
    default: Date.now, // Automatically sets the date when the application is created
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"], // Define possible status values
    default: "pending", // Default status is "pending"
  },
});

module.exports = mongoose.model("JobApplication", jobApplicationSchema);