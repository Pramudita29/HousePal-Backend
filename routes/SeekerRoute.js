const express = require("express");
const router = express.Router();
const multer = require("multer");  // Import multer
const {
  getAllSeeker,
  getSeekerById,
  createSeeker,
  updateSeeker,
  deleteSeeker,
} = require("../controller/SeekerController");

const SeekerValidation=require("../validation/SeekerValidation");
const {authenticateToken, authorizeRole} =require("../security/auth");


// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function(req, res, cb) {
    cb(null, 'images');  // Set the destination folder for uploaded files
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);  // Keep the original filename
  }
});

const upload = multer({ storage: storage });  // Create multer upload instance

// Define routes
router.get("/", getAllSeeker);  // Get all Seekers
router.get("/:id", getSeekerById);  // Get a single Seeker by ID
router.post("/", upload.single('file'), createSeeker);  // Create a new Seeker with an image
router.put("/:id", upload.single('file'),SeekerValidation ,updateSeeker);  // Update a Seeker with a new image
router.delete("/:id", authenticateToken,deleteSeeker);  // Delete a Seeker

module.exports = router;
