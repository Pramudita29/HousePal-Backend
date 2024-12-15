const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Credential = require("../model/Credentials");
const Seeker = require("../model/seeker");
const Helper = require("../model/Helper");

const SECRET_KEY = "336aa64a46bc046c582d411fcd8a424cde5bc5c5f6965df5fff9f8451c84e9d3";

// Allowed roles for registration
const ALLOWED_ROLES = ["seeker", "helper"];

const register = async (req, res) => {
    const {
      username,
      password,
      role,
      full_name,
      email,
      contact_no,
      address,
      skills,
      experience,
      profile_picture,
    } = req.body;
  
    try {
      // Validate common fields
      if (!username || !password || !role) {
        return res
          .status(400)
          .send("Fields 'username', 'password', and 'role' are required");
      }
  
      // Role-specific validations
      if (role === "seeker" && (!full_name || !email || !contact_no || !address)) {
        return res
          .status(400)
          .send("Seekers must provide 'full_name', 'email', 'contact_no', and 'address'");
      }
  
      if (role === "helper" && (!skills || !experience)) {
        return res
          .status(400)
          .send("Helpers must provide 'skills' and 'experience'");
      }
  
      // Check for duplicate username
      const existingUser = await Credential.findOne({ username });
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
  
      // Check for duplicate email
      if (role !== "admin") {
        const existingEmail = role === "seeker"
          ? await Seeker.findOne({ email })
          : await Helper.findOne({ email });
        if (existingEmail) {
          return res.status(400).send("Email already exists");
        }
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Save credential data
      const cred = new Credential({ username, password: hashedPassword, role });
      await cred.save();
  
      // Save role-specific data
      if (role === "seeker") {
        const seeker = new Seeker({
          username,
          full_name,
          email,
          contact_no,
          address,
        });
        await seeker.save();
      } else if (role === "helper") {
        const helper = new Helper({
          username,
          full_name,
          email,
          contact_no,
          skills,
          experience,
          profile_picture: profile_picture || "",
        });
        await helper.save();
      }
  
      res.status(201).send({ message: "User registered successfully", cred });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  


const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const cred = await Credential.findOne({ username });
        if (!cred || !(await bcrypt.compare(password, cred.password))) {
            return res.status(403).send("Invalid username or password");
        }

        // Generate token
        const token = jwt.sign(
            { username: cred.username, role: cred.role }, // Payload
            SECRET_KEY, // Secret key
            { expiresIn: "1h" } // Token expiration
        );

        res.status(200).json({ token, message: "Login successful!" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
};


module.exports = {
    login,
    register
}