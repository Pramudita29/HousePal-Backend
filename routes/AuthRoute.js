const express = require("express");
const { login, register, getCurrentUser } = require("../controller/AuthController");
const { authenticateToken } = require("../security/auth");

const router = express.Router();

// Authentication Routes
router.post("/login", login);       // Login route
router.post("/register", register); // Register route
router.get("/current", authenticateToken, getCurrentUser); // Get current authenticated user

module.exports = router;
