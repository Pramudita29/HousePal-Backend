const mongoose = require("mongoose")

const helperSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => /\S+@\S+\.\S+/.test(email),
      message: "Invalid email format.",
    },
  },
  contact_no: {
    type: String,
    required: true,
    validate: {
      validator: (number) => /^\d{10}$/.test(number),
      message: "Contact number must be 10 digits.",
    },
  },
  skills: {
    type: [String],
    required: true,
  },
  experience: {
    type: Number,
    min: 0,
    required: true,
  },
  availability: {
    type: String,
    enum: ["available", "not available"],
    default: "available",
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  profile_picture: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const Helper = mongoose.models.Helper || mongoose.model("Helper", helperSchema);
module.exports = Helper;
