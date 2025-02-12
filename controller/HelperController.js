const Helper = require("../model/Helper");
const Booking = require("../model/Booking");
const fs = require("fs");
const path = require("path");

// Get all helpers
const getAllHelper = async (req, res) => {
  try {
    const helpers = await Helper.find().sort({ createdAt: -1 });
    res.status(200).json(helpers);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving helpers", error: err });
  }
};

// Get a single helper by ID
const getHelperById = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);
    if (!helper) return res.status(404).json({ message: "Helper not found" });
    res.status(200).json(helper);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving helper", error: err });
  }
};

// Update an existing helper profile with image upload (and old image deletion)
const updateHelperProfile = async (req, res) => {
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
      const oldHelper = await Helper.findById(id);
      if (oldHelper && oldHelper.image) {
        const oldImagePath = path.join(__dirname, "..", oldHelper.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Remove the old image file
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
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a helper
const deleteHelper = async (req, res) => {
  try {
    const deletedHelper = await Helper.findByIdAndDelete(req.params.id);
    if (!deletedHelper) return res.status(404).json({ message: "Helper not found" });

    // Optionally, delete the profile image from the server
    if (deletedHelper.image) {
      const imagePath = path.join(__dirname, "..", deletedHelper.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file from server
      }
    }

    res.status(200).json({ message: "Helper deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting helper", error: err });
  }
};

// Get helper dashboard data
const getHelperDashboard = async (req, res) => {
  try {
    const helperId = req.user.id; // Assuming authenticated user
    const completedTasks = await Booking.find({ helperId, status: "completed" }).countDocuments();
    const earnings = await Booking.aggregate([
      { $match: { helperId, status: "completed" } },
      { $group: { _id: null, totalEarnings: { $sum: "$salary" } } },
    ]);

    const upcomingServices = await Booking.find({ helperId, status: "pending" });
    const todayServices = await Booking.find({
      helperId,
      date: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) },
    });

    res.status(200).json({
      totalEarnings: earnings[0]?.totalEarnings || 0,
      totalServicesDone: completedTasks,
      upcomingServices,
      todayServices,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard data", error: err });
  }
};

// Mark a task as completed
const markTaskAsCompleted = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Booking.findById(taskId);

    if (!task || task.status !== "ongoing") {
      return res.status(400).json({ message: "Invalid task or status" });
    }

    task.status = "completed";
    await task.save();
    res.status(200).json({ message: "Task marked as completed" });
  } catch (err) {
    res.status(500).json({ message: "Error marking task as completed", error: err });
  }
};

const imageUpload = async (req, res) => {
  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract the image path (ensure it's relative, not full path)
    const imagePath = req.file.path;  // Should be relative path (e.g., 'uploads/images/filename.jpg')

    const { email } = req.body;

    // Find the helper by email
    const helper = await Helper.findOne({ email });

    if (!helper) {
      return res.status(404).json({ error: "Helper not found" });
    }

    // Update the helper's image path in the database (storing relative path)
    helper.image = imagePath;

    // Save the updated helper record
    await helper.save();

    // Construct the full URL for the image (e.g., 'http://yourserver.com/uploads/images/filename.jpg')
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imagePath.split('/').pop()}`;

    // Send the response with the image URL
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,  // Full URL to the uploaded image
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



module.exports = {
  getAllHelper,
  getHelperById,
  updateHelperProfile,
  deleteHelper,
  getHelperDashboard,
  markTaskAsCompleted,
  imageUpload
};
