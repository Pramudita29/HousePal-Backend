const express = require("express");
const router = express.Router();
const {
    getAllHelper,
    getHelperById,
    updateHelperProfile,
    deleteHelper,
    markTaskAsCompleted,
    getHelperDashboard,
    imageUpload, 
} = require("../controller/HelperController");

const HelperValidation = require("../validation/HelperValidation");
const { authenticateToken, authorizeRole } = require("../security/auth"); // Security middleware
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Define routes
router.get("/", getAllHelper);
router.get("/:id", getHelperById);

// POST route with image upload (optional) for creating a helper
router.post("/", upload.single("image"), HelperValidation, async (req, res) => {
    try {
        // If file exists, handle the file path logic here
        if (req.file) {
            req.body.image = req.file.path; // Add the image path to the body for saving
        }
        // Proceed to helper creation logic here (not implemented in controller)
        res.status(201).json({ message: "Helper created successfully", data: req.body });
    } catch (err) {
        res.status(500).json({ message: "Error creating helper", error: err });
    }
});

// PUT route for updating the helper's profile (with image upload handling)
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("helper"),
    upload.single("image"),  // Image upload
    HelperValidation,  // Custom validation for updating helper
    updateHelperProfile
);

// DELETE route for deleting a helper
router.delete("/:id", deleteHelper);

// PATCH route for marking a task as completed
router.patch("/task/:taskId/complete", markTaskAsCompleted);

// Route for fetching the helper's dashboard data
router.get("/dashboard", getHelperDashboard);

// New route for uploading the profile image separately
router.post("/uploadImage", upload.single("image"), imageUpload); // Use imageUpload function here



module.exports = router;
