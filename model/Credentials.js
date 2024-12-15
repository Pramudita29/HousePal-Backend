const mongoose = require('mongoose');

const credSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures the username is unique
  },
  password: {
    type: String,
    required: true, // Ensures the password is provided
  },
  role: {
    type: String,
    required: true,
    enum: ['seeker', 'helper', 'admin'], // Restricts to valid roles
  },
});

const Credential = mongoose.model('Credential', credSchema);
module.exports = Credential;
