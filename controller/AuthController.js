const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Credential = require("../model/Credentials");
const Seeker = require("../model/Seeker");
const Helper = require("../model/Helper");

const SECRET_KEY = "336aa64a46bc046c582d411fcd8a424cde5bc5c5f6965df5fff9f8451c84e9d3";

const ALLOWED_ROLES = ["Seeker", "Helper"];

const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, role, skills, experience, contactNo } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Allowed roles are Seeker or Helper." });
    }

    const existingCredential = await Credential.findOne({ email });
    if (existingCredential) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCredential = new Credential({ email, password: hashedPassword, role });
    await newCredential.save();

    let user;
    if (role === "Seeker") {
      user = new Seeker({ fullName, email, contactNo, password: hashedPassword });
    } else {
      user = new Helper({ fullName, email, contactNo, password: hashedPassword, skills, experience });
    }

    await user.save();
    return res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Error during registration:", error);
    if (req.body.email) {
      await Credential.deleteOne({ email: req.body.email });
    }
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const cred = await Credential.findOne({ email });
    if (!cred || !(await bcrypt.compare(password, cred.password))) {
      return res.status(403).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email: cred.email, role: cred.role }, SECRET_KEY, { expiresIn: "7h" });

    let user = await Seeker.findOne({ email }) || await Helper.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        image: user.image || "",
        role: cred.role,
        skills: user.skills || "",
        experience: user.experience || "",
      },
      message: "Login successful!",
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token is missing" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const { email, role } = decoded;

    let user = await Seeker.findOne({ email }) || await Helper.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      contactNo: user.contactNo,
      skills: user.skills,
      image: user.image || "",
      experience: user.experience,
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await Seeker.findOne({ email: req.user.email }) || await Helper.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      contactNo: user.contactNo || "N/A",
      skills: user.skills || [],
      experience: user.experience || "N/A",
      image: user.image || "",
      role: req.user.role,
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Error fetching user data", error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id, fullName, contactNo } = req.body;
    console.log("Updating user with data:", req.body);

    // Determine model based on role
    const role = req.user.role; // From authenticateToken
    const Model = role === "Seeker" ? Seeker : Helper;

    const updatedUser = await Model.findByIdAndUpdate(
      id,
      { fullName, contactNo },
      { new: true }
    );
    if (!updatedUser) {
      console.log("User not found for ID:", id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Updated user:", updatedUser);
    res.json({
      id: updatedUser._id.toString(),
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      contactNo: updatedUser.contactNo || "N/A",
      skills: updatedUser.skills || [],
      experience: updatedUser.experience || "N/A",
      image: updatedUser.image || "",
      role: role,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};
module.exports = { login, register, getCurrentUser, getMe, updateProfile };