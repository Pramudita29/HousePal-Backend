const JobPosting = require("../model/jobposting");

// Get all job postings
const getAllJobPostings = async (req, res) => {
  try {
    const jobPostings = await JobPosting.find();
    res.status(200).json(jobPostings);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving job postings", error: err });
  }
};

// Get a single job posting by ID
const getJobPostingById = async (req, res) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id);
    if (!jobPosting) return res.status(404).json({ message: "Job posting not found" });
    res.status(200).json(jobPosting);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving job posting", error: err });
  }
};

// Create a new job posting
const createJobPosting = async (req, res) => {
  try {
    // Handle the uploaded images if they exist
    const referenceImages = req.files ? req.files.map(file => file.path) : []; // Multiple images

    // Extract data from the request body and create a new job posting object
    const { seekerId, jobDetails, category, location, salaryRange, contractType, applicationDeadline, contactInfo } = req.body;
    
    const newJobPosting = new JobPosting({
      seekerId,
      jobDetails,
      category,
      location,
      salaryRange,
      contractType,
      applicationDeadline,
      contactInfo,
      reference_images: referenceImages,
    });

    await newJobPosting.save();
    res.status(201).json(newJobPosting);
  } catch (err) {
    res.status(400).json({ message: "Error creating job posting", error: err });
  }
};

// Update an existing job posting
const updateJobPosting = async (req, res) => {
  try {
    // If new images are uploaded, handle them
    const referenceImages = req.files ? req.files.map(file => file.path) : undefined;

    // Prepare the update data, checking for the image field
    const updateData = { ...req.body };
    if (referenceImages) {
      updateData.reference_images = referenceImages; // Update the reference_images field with new image paths
    }

    const updatedJobPosting = await JobPosting.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedJobPosting) return res.status(404).json({ message: "Job posting not found" });
    res.status(200).json(updatedJobPosting);
  } catch (err) {
    res.status(400).json({ message: "Error updating job posting", error: err });
  }
};

// Delete a job posting
const deleteJobPosting = async (req, res) => {
  try {
    const deletedJobPosting = await JobPosting.findByIdAndDelete(req.params.id);
    if (!deletedJobPosting) return res.status(404).json({ message: "Job posting not found" });
    res.status(200).json({ message: "Job posting deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting job posting", error: err });
  }
};

module.exports = {
  getAllJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
};
