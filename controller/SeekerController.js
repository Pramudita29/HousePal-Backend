const Seeker = require("../model/seeker");
const nodemailer = require("nodemailer");

// Get all seekers
const getAllSeeker = async (req, res) => {
  try {
    const seekers = await Seeker.find().sort({ createdAt: -1 }); // Sorted by most recent
    res.status(200).json(seekers);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving seekers", error: err });
  }
};

// Get a single seeker by ID
const getSeekerById = async (req, res) => {
  try {
    const seeker = await Seeker.findById(req.params.id);
    if (!seeker) return res.status(404).json({ message: "Seeker not found" });
    res.status(200).json(seeker);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving seeker", error: err });
  }
};

// Create a new seeker
const createSeeker = async (req, res) => {
  try {
    const { full_name, address, contact_no, email } = req.body;
    const image = req.file ? req.file.path : "";

    const newSeeker = new Seeker({ full_name, address, contact_no, email, image });
    await newSeeker.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: newSeeker.email,
      subject: "Seeker Registration",
      html: `<h1>Your Registration has been Completed</h1><p>Your user id is ${newSeeker._id}</p>`,
    });

    res.status(201).json(newSeeker);
  } catch (err) {
    res.status(400).json({ message: "Error creating seeker", error: err });
  }
};

// Update an existing seeker
const updateSeeker = async (req, res) => {
  try {
    // Handle file upload if exists
    const image = req.file ? req.file.path : undefined;  // If a file is uploaded, get the path, otherwise leave it undefined

    // Prepare the updated data
    const updateData = { ...req.body };
    if (image) {
      updateData.image = image;  // Update the image path if a new file is uploaded
    }

    const updatedSeeker = await Seeker.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSeeker) return res.status(404).json({ message: "Seeker not found" });
    res.status(200).json(updatedSeeker);
  } catch (err) {
    res.status(400).json({ message: "Error updating seeker", error: err });
  }
};

// Delete a seeker
const deleteSeeker = async (req, res) => {
  try {
    const deletedSeeker = await Seeker.findByIdAndDelete(req.params.id);
    if (!deletedSeeker) return res.status(404).json({ message: "Seeker not found" });
    res.status(200).json({ message: "Seeker deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting seeker", error: err });
  }
};

module.exports = {
  getAllSeeker,
  getSeekerById,
  createSeeker,
  updateSeeker,
  deleteSeeker,
};
