const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  posterEmail: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String, // Subcategory (e.g., deep cleaning, babysitting infants)
    required: true,
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
    enum: ["Part-time", "Full-time", "Temporary"],
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
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobApplication" }],
  status: { type: String, enum: ["Open", "In Progress", "Closed"], default: "Open" },
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
