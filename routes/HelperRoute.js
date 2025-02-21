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
  getSavedJobs,
  saveJob,
  removeSavedJob,
  getRecommendedJobs,
  getApplicationHistory,
} = require("../controller/HelperController");
const { authenticateToken, authorizeRole } = require("../security/auth");
const multer = require("multer");
const fs = require("fs"); // Added missing import
const path = require("path"); // Ensure path is imported (already present in your controller)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'images';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Specific routes first
router.get("/saved-jobs", authenticateToken, authorizeRole("helper"), getSavedJobs);
router.post("/saved-jobs/:jobId", authenticateToken, authorizeRole("helper"), saveJob);
router.delete("/saved-jobs/:jobId", authenticateToken, authorizeRole("helper"), removeSavedJob);
router.get("/recommended-jobs", authenticateToken, authorizeRole("helper"), getRecommendedJobs);
router.get("/application-history", authenticateToken, authorizeRole("helper"), getApplicationHistory);
router.get("/dashboard", authenticateToken, authorizeRole("helper"), getHelperDashboard);
router.post("/uploadImage", upload.single("image"), imageUpload);
router.patch("/task/:taskId/complete", authenticateToken, authorizeRole("helper"), markTaskAsCompleted);

// General routes after specific ones
router.get("/", getAllHelper);
router.get("/:id", getHelperById);
router.put("/:id", authenticateToken, authorizeRole("helper"), upload.single("image"), updateHelperProfile);
router.delete("/:id", authenticateToken, authorizeRole("helper"), deleteHelper);

module.exports = router;