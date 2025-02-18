const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  seekerId: { type: String, required: true }, // Changed to String for email
  helperId: { type: String, required: true }, // Changed to String for email
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);