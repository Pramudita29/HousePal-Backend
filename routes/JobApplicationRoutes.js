const express = require("express");
const router = express.Router();
const { applyForJob, getApplicationsForJob, updateApplicationStatus, getApplicationHistory, deleteApplication, rescheduleApplication } = require("../controller/JobApplicationController");
const { authenticateToken } = require("../security/auth");

router.post("/:jobId/apply", authenticateToken, applyForJob);
router.get("/:jobId/applications", authenticateToken, getApplicationsForJob);
router.put("/:jobId/applications/:applicationId/status", authenticateToken, updateApplicationStatus);
router.get("/history", authenticateToken, getApplicationHistory); // Added this route
router.delete("/:jobId/applications/:applicationId", authenticateToken, deleteApplication);
router.post("/:jobId/reschedule", authenticateToken, rescheduleApplication);
module.exports = router;