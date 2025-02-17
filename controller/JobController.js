const Job = require("../model/Job");  // Updated model to 'Job'
const { addNotification } = require("../controller/NotificationController"); // Import notification function

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving jobs", error: err });
  }
};

// Get a single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving job", error: err });
  }
};

// Create a new job
const createJob = async (req, res) => {
  try {
    console.log(req.body); // Log the incoming request body

    const referenceImages = req.files ? req.files.map(file => file.path) : []; // Multiple images

    // Extract data from the request body and create a new job object
    const { posterEmail,jobTitle, jobDescription, category, subCategory, location, salaryRange, contractType, applicationDeadline, contactInfo } = req.body;

    const newJob = new Job({
      posterEmail,
      jobTitle,
      jobDescription,
      category,
      subCategory,
      location,
      salaryRange,
      contractType,
      applicationDeadline,
      contactInfo,
    });

    await newJob.save();



    res.status(201).json(newJob);
  } catch (err) {
    console.error(err); // Log the full error for debugging
    res.status(400).json({ message: "Error creating job", error: err }); // Send the error details in the response
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, posterEmail: req.user.email },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found or not authorized" });
    res.status(200).json({ message: "Job updated successfully", data: job });
  } catch (err) {
    res.status(500).json({ message: "Error updating job", error: err.message });
  }
};
// Delete a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, posterEmail: req.user.email });
    if (!job) return res.status(404).json({ message: "Job not found or not authorized" });
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting job", error: err.message });
  }
};

// Filter jobs based on given criteria
const filterJobs = async (req, res) => {
  try {
    const { category, location, salaryRange, contractType } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (salaryRange) filters.salaryRange = salaryRange; // May need parsing if range is complex
    if (contractType) filters.contractType = contractType;

    const jobs = await Job.find(filters);
    const jobCounts = await Job.aggregate([
      { $match: filters },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.status(200).json({ jobs, jobCounts });
  } catch (err) {
    console.error("Error filtering jobs:", err);
    res.status(500).json({ message: "Error filtering jobs", error: err.message });
  }
};


const getPublicJobs = async (req, res) => {
  try {
    console.log("Fetching public jobs with filters:", req.query);
    const { category, location, salaryRange, contractType } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (salaryRange) filters.salaryRange = salaryRange;
    if (contractType) filters.contractType = contractType;

    const jobs = await Job.find(filters);
    console.log("Jobs retrieved:", jobs);
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error retrieving public jobs:", err.stack);
    res.status(500).json({ message: "Error retrieving public jobs", error: err.message });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("applications");
    if (!job || job.posterEmail !== req.user.email) return res.status(404).json({ message: "Job not found or not authorized" });
    res.status(200).json(job.applications || []);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving applications", error: err.message });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  filterJobs,
  getPublicJobs,
  getJobApplications,
};
