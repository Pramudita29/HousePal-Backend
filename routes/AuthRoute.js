const express = require("express");
const { login, register } = require("../controller/AuthController");

const router = express.Router();

// Authentication Routes
router.post("/login", login);       // Login route
router.post("/register", register); // Register route (if needed)

module.exports = router;
