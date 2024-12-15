const mongoose = require("mongoose");

const jobPostingSchema = new mongoose.Schema({
  seekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seeker",
    required: true,
  },
  jobDetails: {
    type: String,
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["open", "booked", "completed", "cancelled"],
    default: "open",
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String, // Subcategory (e.g., deep cleaning, babysitting infants)
    required: true,
  },
  reference_images: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return v.every((url) => /^(https?|ftp):\/\/.+$/.test(url));
      },
      message: "Invalid image URL(s).",
    },
  },
  location: {
    type: String,
    required: true,
  },
  salaryRange: {
    type: String,
    required: true,
  },
  contractType: {
    type: String,
    enum: ["Part-time", "Full-time", "Contract"],
    required: true,
  },
  applicationDeadline: {
    type: Date,
    required: true,
  },
  contactInfo: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const JobPosting = mongoose.model("JobPosting", jobPostingSchema);
module.exports = JobPosting;