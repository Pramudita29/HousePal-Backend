const Helper = require("../model/Helper");
const Task = require("../model/Tasks");
const JobApplication = require("../model/JobApplication");
const fs = require("fs");
const path = require("path");

// Get all helpers
const getAllHelper = async (req, res) => {
  try {
    const helpers = await Helper.find().sort({ createdAt: -1 });
    res.status(200).json(helpers);
  } catch (err) {
    console.error("Error retrieving helpers:", err.stack);
    res.status(500).json({ message: "Error retrieving helpers", error: err.message });
  }
};

// Get a single helper by ID
const getHelperById = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);
    if (!helper) return res.status(404).json({ message: "Helper not found" });
    res.status(200).json(helper);
  } catch (err) {
    console.error("Error retrieving helper:", err.stack);
    res.status(500).json({ message: "Error retrieving helper", error: err.message });
  }
};

// Update an existing helper profile with image upload (and old image deletion)
const updateHelperProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates.name && !updates.contactNo) {
      return res.status(400).json({ message: "Name or Contact number must be provided." });
    }

    if (req.file) {
      updates.image = req.file.path;
      const oldHelper = await Helper.findById(id);
      if (oldHelper && oldHelper.image) {
        const oldImagePath = path.join(__dirname, "..", oldHelper.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedHelper = await Helper.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedHelper) {
      return res.status(404).json({ message: "Helper not found" });
    }

    res.status(200).json({
      message: "Helper profile updated successfully",
      data: updatedHelper,
    });
  } catch (error) {
    console.error("Error updating helper profile:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a helper
const deleteHelper = async (req, res) => {
  try {
    const deletedHelper = await Helper.findByIdAndDelete(req.params.id);
    if (!deletedHelper) return res.status(404).json({ message: "Helper not found" });

    if (deletedHelper.image) {
      const imagePath = path.join(__dirname, "..", deletedHelper.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({ message: "Helper deleted successfully" });
  } catch (err) {
    console.error("Error deleting helper:", err.stack);
    res.status(500).json({ message: "Error deleting helper", error: err.message });
  }
};

// Get helper dashboard data
const getHelperDashboard = async (req, res) => {
  try {
    const helperId = req.user.id; // Assuming authenticated user
    const completedTasks = await Task.find({ 'helperDetails.email': helperId, status: "completed" }).countDocuments();
    const earnings = await Task.aggregate([
      { $match: { 'helperDetails.email': helperId, status: "completed" } },
      { $group: { _id: null, totalEarnings: { $sum: "$salary" } } },
    ]);

    const upcomingServices = await Task.find({ 'helperDetails.email': helperId, status: "pending" });
    const todayServices = await Task.find({
      'helperDetails.email': helperId,
      scheduledTime: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) },
    });

    res.status(200).json({
      totalEarnings: earnings[0]?.totalEarnings || 0,
      totalServicesDone: completedTasks,
      upcomingServices,
      todayServices,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err.stack);
    res.status(500).json({ message: "Error fetching dashboard data", error: err.message });
  }
};

// Mark a task as completed
const markTaskAsCompleted = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task || task.status !== "in-progress") {
      return res.status(400).json({ message: "Invalid task or status" });
    }

    task.status = "completed";
    await task.save();
    res.status(200).json({ message: "Task marked as completed" });
  } catch (err) {
    console.error("Error marking task as completed:", err.stack);
    res.status(500).json({ message: "Error marking task as completed", error: err.message });
  }
};

// Image upload
const imageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const image = "images/" + req.file.filename;
    const { email } = req.body;
    const helper = await Helper.findOne({ email });

    if (!helper) {
      return res.status(404).json({ error: "Helper not found" });
    }

    helper.image = image;
    await helper.save();

    res.status(200).json({ message: "Image uploaded successfully", imageUrl: image });
  } catch (error) {
    console.error("Error uploading image:", error.stack);
    res.status(500).json({ error: "Something went wrong" });
  }
};
// Save a job
const saveJob = async (req, res) => {
  try {
    console.log("Saving job - User:", req.user);
    const helper = await Helper.findOne({ email: req.user.email });
    console.log("Found helper:", helper);
    if (!helper) return res.status(404).json({ message: "Helper not found" });
    const jobId = req.params.jobId;
    if (!helper.savedJobs.includes(jobId)) {
      helper.savedJobs.push(jobId);
      await helper.save();
      console.log("Job saved:", jobId);
    }
    res.status(200).json({ message: "Job saved successfully" });
  } catch (err) {
    console.error("Error saving job:", err.stack);
    res.status(500).json({ message: "Error saving job", error: err.message });
  }
};

// Remove a saved job
const removeSavedJob = async (req, res) => {
  try {
    const helper = await Helper.findOne({ email: req.user.email });
    if (!helper) return res.status(404).json({ message: "Helper not found" });
    helper.savedJobs = helper.savedJobs.filter(id => id.toString() !== req.params.jobId);
    await helper.save();
    res.status(200).json({ message: "Job removed from saved" });
  } catch (err) {
    console.error("Error removing saved job:", err.stack);
    res.status(500).json({ message: "Error removing saved job", error: err.message });
  }
};

// Get saved jobs
const getSavedJobs = async (req, res) => {
  try {
    console.log("Starting getSavedJobs - Request User:", req.user);
    if (!req.user || !req.user.email) {
      console.error("Authentication failure - No user or email:", req.user);
      return res.status(401).json({ message: "User not authenticated or email missing" });
    }

    console.log("Attempting to query Helper for email:", req.user.email);
    let helper = await Helper.findOne({ email: req.user.email });
    console.log("Query result - Helper:", helper);

    if (!helper) {
      console.log("No Helper document found, creating one for email:", req.user.email);
      helper = new Helper({
        email: req.user.email,
        fullName: "Default Helper", // Placeholder, adjust as needed
        savedJobs: []
      });
      await helper.save();
      console.log("Created new helper:", helper);
    }

    if (!helper.savedJobs) {
      console.log("savedJobs field missing, initializing:", helper);
      helper.savedJobs = [];
      await helper.save();
    }

    console.log("Populating savedJobs for helper:", helper._id);
    await helper.populate('savedJobs');
    console.log("Populated savedJobs:", helper.savedJobs);

    res.status(200).json(helper.savedJobs || []);
  } catch (err) {
    console.error("Error in getSavedJobs - Full stack trace:", err.stack);
    console.error("Error details:", err.message, err.name);
    res.status(500).json({ message: "Error retrieving helper", error: err.message });
  }
};

// Get recommended jobs
const getRecommendedJobs = async (req, res) => {
  try {
    const helper = await Helper.findOne({ email: req.user.email });
    if (!helper) return res.status(404).json({ message: "Helper not found" });
    const skills = helper.skills ? helper.skills.split(',').map(s => s.trim()) : [];
    const jobs = await Job.find({ category: { $in: skills } }).limit(10);
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving recommended jobs:", err.stack);
    res.status(500).json({ message: "Error retrieving recommended jobs", error: err.message });
  }
};

// Get application history
const getApplicationHistory = async (req, res) => {
  try {
    const applications = await JobApplication.find({ 'helperDetails.email': req.user.email }).populate('jobId');
    res.status(200).json(applications);
  } catch (err) {
    console.error("Error retrieving application history:", err.stack);
    res.status(500).json({ message: "Error retrieving application history", error: err.message });
  }
};

module.exports = {
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
};