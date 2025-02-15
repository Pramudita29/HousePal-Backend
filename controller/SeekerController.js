const Seeker = require("../model/Seeker");
const Job = require("../model/Job");
const JobApplication = require("../model/JobApplication");
const fs = require("fs");
const path = require("path");

// Get all seekers
const getAllSeeker = async (req, res) => {
  try {
    const seekers = await Seeker.find().sort({ createdAt: -1 }); // Sorted by most recent
    res.status(200).json(seekers);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving seekers", error: err });
  }
};

const getSeekerById = async (req, res) => {
  try {
    const seeker = await Seeker.findById(req.params.id);
    if (!seeker) return res.status(404).json({ message: "Seeker not found" });
    res.status(200).json(seeker);
  } catch (err) {
    console.error("Error retrieving seeker:", err);
    res.status(500).json({ message: "Error retrieving seeker", error: err.message });
  }
};

// Update an existing seeker profile with image upload (and old image deletion)
const updateSeekerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ensure required fields are provided (e.g., name or contact)
    if (!updates.name && !updates.contactNo) {
      return res.status(400).json({ message: "Name or Contact number must be provided." });
    }

    // Handle image upload
    if (req.file) {
      updates.image = req.file.path; // Save image path to updates

      // Delete old image if exists
      const oldSeeker = await Seeker.findById(id);
      if (oldSeeker && oldSeeker.image) {
        const oldImagePath = path.join(__dirname, "..", oldSeeker.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Remove the old image file
        }
      }
    }

    const updatedSeeker = await Seeker.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedSeeker) {
      return res.status(404).json({ message: "Seeker not found" });
    }

    res.status(200).json({
      message: "Seeker profile updated successfully",
      data: updatedSeeker,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a seeker
const deleteSeeker = async (req, res) => {
  try {
    const deletedSeeker = await Seeker.findByIdAndDelete(req.params.id);
    if (!deletedSeeker) return res.status(404).json({ message: "Seeker not found" });

    // Optionally, you can delete the image file associated with the seeker
    if (deletedSeeker.image) {
      const imagePath = path.join(__dirname, "..", deletedSeeker.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image from the server
      }
    }

    res.status(200).json({ message: "Seeker deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting seeker", error: err });
  }
};

const imageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const image = req.file.path;  // Ensure image path is correctly extracted

    const { email } = req.body;
    const seeker = await Seeker.findOne({ email });


    if (!seeker) {
      return res.status(404).json({ error: "Seeker not found" });
    }


    // Update the helper's image field
    seeker.image = image;
    await seeker.save();

    res.status(200).json({ message: 'Image uploaded successfully', imageUrl: image });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getCurrentSeeker = async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Authentication token is missing" });
    }

    // Decode the JWT token to get user info
    const decoded = jwt.verify(token, SECRET_KEY);

    // Find the seeker based on their ID
    const seeker = await Seeker.findById(decoded._id);
    if (!seeker) {
      return res.status(404).json({ message: "Seeker not found" });
    }

    res.status(200).json(seeker);  // Return seeker details
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    console.log("Fetching all applications for seeker email:", req.user.email);

    if (!req.user.email) {
      console.log("No email provided in token");
      return res.status(401).json({ message: "Authentication error: No email in token" });
    }

    const jobs = await Job.find({ posterEmail: req.user.email });
    console.log("Jobs posted by seeker:", jobs);

    if (!jobs.length) {
      console.log("No jobs found for seeker:", req.user.email);
      return res.status(200).json([]);
    }

    const jobIds = jobs.map(job => new mongoose.Types.ObjectId(job._id));
    console.log("Job IDs:", jobIds);

    const applications = await JobApplication.find({ jobId: { $in: jobIds } })
      .populate({
        path: 'jobId',
        select: 'jobTitle jobDescription category subCategory location salaryRange contractType applicationDeadline'
      })
      .sort({ createdAt: -1 });
    console.log("All applications retrieved:", applications);

    res.status(200).json(applications);
  } catch (err) {
    console.error("Error retrieving all applications:", err.stack);
    res.status(500).json({ message: "Server error fetching applications", error: err.message });
  }
};


// Export all functions correctly
module.exports = {
  getAllSeeker,
  getSeekerById,
  updateSeekerProfile,
  deleteSeeker,
  imageUpload,
  getCurrentSeeker,
  getAllApplications,
};