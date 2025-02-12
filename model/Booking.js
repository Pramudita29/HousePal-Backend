const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  seekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seeker",
    required: true,
  },
  HelperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Helper",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPosting",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "ongoing", "completed", "cancelled"],
    default: "pending",
  },  
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
