const Helper = require("../model/Helper");

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

// Create a new helper
const createHelper = async (req, res) => {
  try {
    const { full_name, email, contact_no, skills, experience, availability } = req.body;
    const profileImage = req.file ? req.file.path : "";

    const newHelper = new Helper({
      full_name,
      email,
      contact_no,
      skills,
      experience,
      availability,
      profile_picture: profileImage,
    });

    await newHelper.save();
    res.status(201).json(newHelper);
  } catch (err) {
    res.status(400).json({ message: "Error creating helper", error: err });
  }
};

// Update an existing helper
const updateHelper = async (req, res) => {
  try {
    // If a new profile image is uploaded, handle it
    const profileImage = req.file ? req.file.path : undefined;

    // Prepare the update data
    const updateData = { ...req.body };
    if (profileImage) {
      updateData.profile_image = profileImage; // Update the profile_image field with new image path
    }

    // Update the helper document
    const updatedHelper = await Helper.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedHelper) return res.status(404).json({ message: "Helper not found" });
    res.status(200).json(updatedHelper);
  } catch (err) {
    res.status(400).json({ message: "Error updating helper", error: err });
  }
};

// Delete a helper
const deleteHelper = async (req, res) => {
  try {
    const deletedHelper = await Helper.findByIdAndDelete(req.params.id);
    if (!deletedHelper) return res.status(404).json({ message: "Helper not found" });
    res.status(200).json({ message: "Helper deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting helper", error: err });
  }
};

module.exports = {
  getAllHelper,
  getHelperById,
  createHelper,
  updateHelper,
  deleteHelper,
};
