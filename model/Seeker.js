const mongoose = require("mongoose");

const SeekerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures username is linked with credentials
  },
  full_name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contact_no: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String, // Path or URL of the uploaded image
    default: "",
  },
});

const Seeker = mongoose.model("Seeker", SeekerSchema);
module.exports = Seeker;
