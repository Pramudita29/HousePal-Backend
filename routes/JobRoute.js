const express = require("express");
const router = express.Router();
const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    filterJobs,
    getPublicJobs,
    getJobApplications
} = require("../controller/jobController");
const { authenticateToken } = require("../security/auth");

// Define /public before /:id to ensure correct routing
router.get("/public", getPublicJobs); // Public jobs endpoint
router.get("/", getAllJobs); // All jobs (authenticated)
router.get("/filter", filterJobs); // Filtered jobs
router.get("/:id", getJobById); // Specific job by ID (after /public)
router.post("/", authenticateToken, createJob);
router.put("/:id", authenticateToken, updateJob);
router.delete("/:id", authenticateToken, deleteJob);
router.get("/:id/applications", authenticateToken, getJobApplications);
module.exports = router;