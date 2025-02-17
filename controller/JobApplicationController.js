const JobApplication = require("../model/JobApplication");
const Job = require("../model/Job");
const Task = require("../model/Tasks");
const Helper = require("../model/Helper"); // Added import
const { addNotification } = require("../controller/NotificationController"); const mongoose = require("mongoose");
const axios = require("axios");

const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { helperDetails } = req.body;

        console.log("Received job application request:", { jobId, helperDetails });

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid job ID format" });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const existingApplication = await JobApplication.findOne({
            jobId: new mongoose.Types.ObjectId(jobId),
            "helperDetails.email": helperDetails.email,
        });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }

        const newApplication = new JobApplication({
            jobId: new mongoose.Types.ObjectId(jobId),
            applicantEmail: helperDetails.email,
            helperDetails: {
                fullName: helperDetails.fullName || "Unknown Helper",
                email: helperDetails.email,
                contactNo: helperDetails.contactNo || "N/A",
                skills: helperDetails.skills || [],
                experience: helperDetails.experience || "N/A",
                image: helperDetails.image || "",
            },
            posterEmail: job.posterEmail,
            status: "pending",
        });

        await newApplication.save();
        console.log("Application saved:", JSON.stringify(newApplication, null, 2));

        if (job.posterEmail) {
            await addNotification(
                job.posterEmail,
                "Seeker",
                "Job Application",
                `Helper ${newApplication.helperDetails.fullName} has applied for your job: ${job.jobTitle}`,
                jobId
            );
        }

        res.status(201).json(newApplication);
    } catch (err) {
        console.error("Error applying for job:", err.stack);
        res.status(500).json({ message: "Error applying for job", error: err });
    }
};

const getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log("Fetching applications for jobId:", jobId);

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            console.log("Invalid jobId:", jobId);
            return res.status(400).json({ message: "Invalid job ID format" });
        }

        const applications = await JobApplication.find({ jobId: new mongoose.Types.ObjectId(jobId) })
            .populate({
                path: "jobId",
                select: "jobTitle jobDescription category subCategory location salaryRange contractType applicationDeadline",
            })
            .sort({ createdAt: -1 });

        const enrichedApplications = await Promise.all(
            applications.map(async (app) => {
                if (!app.helperDetails.fullName || app.helperDetails.fullName === "Unknown Helper") {
                    const helper = await Helper.findOne({ email: app.helperDetails.email });
                    if (helper) {
                        app.helperDetails = {
                            fullName: helper.fullName || "Unknown Helper",
                            email: helper.email,
                            contactNo: helper.contactNo || "N/A",
                            skills: helper.skills || [],
                            experience: helper.experience || "N/A",
                            image: helper.image || "",
                        };
                    }
                }
                return app;
            })
        );

        console.log("Applications retrieved:", enrichedApplications);
        res.status(200).json(enrichedApplications);
    } catch (err) {
        console.error("Error retrieving applications:", err.stack);
        res.status(500).json({ message: "Error retrieving applications", error: err.message });
    }
};
const updateApplicationStatus = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const { status } = req.body;

        console.log("Updating application status:", { jobId, applicationId, status });

        if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(applicationId)) {
            console.log("Invalid jobId or applicationId:", { jobId, applicationId });
            return res.status(400).json({ message: "Invalid job ID or application ID format" });
        }

        const application = await JobApplication.findById(applicationId).populate("jobId");
        if (!application) {
            console.log("Application not found for ID:", applicationId);
            return res.status(404).json({ message: "Application not found" });
        }

        application.status = status;
        await application.save();
        console.log("Application status updated:", JSON.stringify(application, null, 2));

        // Send notification to helper
        const helperEmail = application.helperDetails.email;
        await addNotification(
            helperEmail,
            "Helper",
            "Application Status Update",
            `Your application for "${application.jobId.jobTitle}" has been ${status}.`,
            jobId
        );

        if (status === "accepted") {
            const job = await Job.findById(jobId);
            if (!job) return res.status(404).json({ message: "Job not found" });

            const taskData = {
                jobId,
                applicationId,
                helperDetails: application.helperDetails,
                scheduledDateTime: new Date().toISOString(),
                seekerEmail: job.posterEmail,
                helperEmail: application.helperDetails.email,
                posterEmail: job.posterEmail,
                location: job.location,
                jobSubCategory: job.subCategory,
                jobCategory: job.category,
                jobTitle: job.jobTitle,
            };

            console.log("Sending task data:", JSON.stringify(taskData, null, 2));
            try {
                const taskResponse = await axios.post(
                    "http://localhost:3000/api/tasks/create",
                    taskData,
                    { headers: { Authorization: req.headers.authorization } }
                );
                console.log("Task created:", JSON.stringify(taskResponse.data, null, 2));
            } catch (taskErr) {
                console.error("Task creation failed:", taskErr.response?.data || taskErr.message);
                throw new Error("Failed to create task: " + (taskErr.response?.data?.message || taskErr.message));
            }
        }

        res.status(200).json(application);
    } catch (err) {
        console.error("Error updating application status:", err.stack);
        res.status(500).json({ message: err.message || "Error updating application status" });
    }
};

const getApplicationHistory = async (req, res) => {
    try {
        console.log("Fetching application history for helper email:", req.user.email);

        const applications = await JobApplication.find({ "helperDetails.email": req.user.email })
            .populate({
                path: "jobId",
                select: "jobTitle jobDescription category subCategory location salaryRange contractType applicationDeadline",
            })
            .sort({ appliedAt: -1 });
        console.log("Application history retrieved:", applications);

        res.status(200).json(applications);
    } catch (err) {
        console.error("Error retrieving application history:", err.stack);
        res.status(500).json({ message: "Error retrieving application history", error: err.message });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;

        console.log("Deleting application:", { jobId, applicationId });

        if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(applicationId)) {
            console.log("Invalid jobId or applicationId:", { jobId, applicationId });
            return res.status(400).json({ message: "Invalid job ID or application ID format" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            console.log("Application not found for ID:", applicationId);
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.helperDetails.email !== req.user.email) {
            console.log(
                "Unauthorized deletion attempt by:",
                req.user.email,
                "for application owned by:",
                application.helperDetails.email
            );
            return res.status(403).json({ message: "You are not authorized to delete this application" });
        }

        const task = await Task.findOne({ applicationId });
        if (task) {
            console.log("Cannot delete application with existing task:", task._id);
            return res.status(400).json({ message: "Cannot delete application with an associated task" });
        }

        await JobApplication.findByIdAndDelete(applicationId);
        console.log("Application deleted successfully:", applicationId);

        const job = await Job.findById(jobId);
        if (job && job.posterEmail) {
            await addNotification(
                job.posterEmail,
                "Seeker",
                "Application Withdrawn",
                `Helper ${application.helperDetails.fullName} has withdrawn their application for your job: ${job.jobTitle}`,
                jobId
            );
            console.log("Notification sent to seeker:", job.posterEmail);
        }

        res.status(200).json({ message: "Application deleted successfully" });
    } catch (err) {
        console.error("Error deleting application:", err.stack);
        res.status(500).json({ message: "Error deleting application", error: err.message });
    }
};

const rescheduleApplication = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { applicationId, scheduledDateTime } = req.body;

        const job = await Job.findById(jobId);
        if (!job || job.posterEmail !== req.user.email) {
            return res.status(403).json({ message: "Unauthorized or job not found" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application || application.status !== "accepted") {
            return res.status(400).json({ message: "Application not found or not accepted" });
        }

        const newTask = await axios.post(
            "http://localhost:5000/api/tasks/create",
            {
                jobId,
                applicationId,
                helperDetails: application.helperDetails,
                scheduledDateTime,
            },
            { headers: { Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}` } }
        );

        await addNotification(
            application.helperDetails.email,
            "Helper",
            "Booking Rescheduled",
            `Your booking for ${job.jobTitle} has been rescheduled`,
            jobId
        );

        res.status(200).json(newTask.data);
    } catch (err) {
        console.error("Error rescheduling:", err);
        res.status(500).json({ message: "Error rescheduling", error: err.message });
    }
};

module.exports = {
    applyForJob,
    getApplicationsForJob,
    updateApplicationStatus,
    getApplicationHistory,
    deleteApplication,
    rescheduleApplication,
};