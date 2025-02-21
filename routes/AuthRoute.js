const express = require("express");
const router = express.Router();
const { login, register, getCurrentUser, getMe, updateProfile } = require("../controller/AuthController");
const { authenticateToken } = require("../security/auth");

router.post("/login", login);
router.post("/register", register);
router.get("/user", authenticateToken, getCurrentUser);
router.get("/me", authenticateToken, getMe); // New endpoint
router.put("/update", authenticateToken, updateProfile);

module.exports = router;