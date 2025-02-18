// model/Tasks.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "JobApplication" },
    helperId: { type: mongoose.Schema.Types.ObjectId, ref: "Helper" }, // Added reference
    helperDetails: {
        fullName: { type: String, default: "Unnamed Helper" },
        email: { type: String },
        contactNo: String,
        skills: [String],
        experience: String,
        image: String,
    },
    scheduledDateTime: { type: Date, required: true },
    seekerEmail: { type: String, required: true },
    helperEmail: String,
    posterEmail: String,
    location: String,
    jobSubCategory: String,
    jobCategory: String,
    jobTitle: String,
    status: { type: String, default: "pending" },
    completionDateTime: Date,
});

module.exports = mongoose.model("Task", taskSchema);