const express = require("express");
const router = express.Router();
const multer = require("multer");  // Import multer for file uploads
const {
  getAllSeeker,
  getSeekerById,
  updateSeekerProfile,
  deleteSeeker,
  imageUpload,
  getCurrentSeeker,
} = require("../controller/SeekerController");

const SeekerValidation = require("../validation/SeekerValidation");
const { authenticateToken, authorizeRole } = require("../security/auth");



// Set up multer storage for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, 'images');  // Define the folder to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);  // Generate a unique filename using timestamp
  }
});

const upload = multer({ storage: storage });  // Create multer upload instance

// Define routes

// GET all Seekers
router.get("/", getAllSeeker);

// GET a single Seeker by ID
router.get("/:id", getSeekerById);

// PUT route for updating Seeker's profile or other information (and optionally update image)
router.put("/:id", authenticateToken, upload.single('image'), SeekerValidation, async (req, res) => {
  const seekerId = req.params.id;
  const updatedData = req.body;

  // If a new file is uploaded, include the file path in the updated data
  if (req.file) {
    updatedData.image = req.file.path;
  }

  try {
    // Update Seeker information in the database
    const updatedSeeker = await updateSeekerProfile(seekerId, updatedData);

    if (!updatedSeeker) {
      return res.status(404).json({ message: "Seeker not found." });
    }

    return res.status(200).json({
      message: "Seeker updated successfully",
      updatedSeeker,
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while updating Seeker.", error: error.message });
  }
});

// DELETE route for deleting a Seeker
router.delete("/:id", authenticateToken, deleteSeeker);

router.post("/uploadImage", upload.single("image"), imageUpload); // Use imageUpload function here


router.get("/me", getCurrentSeeker);


module.exports = router;
