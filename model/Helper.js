const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const helperSchema = new mongoose.Schema({
  fullName: {
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
  contactNo: {
    type: String,
    required: true,
    validate: {
      validator: (number) => /^\d{10}$/.test(number),
      message: "Contact number must be 10 digits.",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,  // Enforcing a minimum length for security
  },

  skills: {
    type: [String],
    required: true,
  },
  experience: {
    type: String,
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
  image: {
    type: String,
    default: "",
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  notifications: [
    {
      message: String,
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// Pre-save hook to hash password before saving
helperSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


const Helper = mongoose.models.Helper || mongoose.model("Helper", helperSchema);
module.exports = Helper;
