const express = require("express");
const router = express.Router();
const {
  getAllSeeker,
  getSeekerById,
  updateSeekerProfile,
  deleteSeeker,
  imageUpload,
  getCurrentSeeker,
  getAllApplications,
} = require("../controller/SeekerController");
const { authenticateToken } = require("../security/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, res, cb) { cb(null, 'images'); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// Specific routes come BEFORE parameterized routes
router.get("/all-applications", authenticateToken, getAllApplications); // Changed from /recent-applications
router.get("/me", authenticateToken, getCurrentSeeker);
router.get("/:id", getSeekerById); // Move this AFTER specific routes
router.put("/:id", authenticateToken, upload.single('image'), updateSeekerProfile);
router.delete("/:id", authenticateToken, deleteSeeker);
router.post("/uploadImage", authenticateToken, upload.single("image"), imageUpload);

module.exports = router;