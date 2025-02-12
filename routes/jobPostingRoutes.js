const express = require("express");
const router = express.Router();
const {
  getAllJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  filterJobs,
} = require("../controller/jobPostingController");

const JobPostingValidation = require("../validation/JobPostingValidation");


const multer=require("multer")
const storage=multer.diskStorage({
    destination: function(req,res,cb){
        cb(null,'images')
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

const upload = multer({ storage: storage });  // Create multer upload instance


// Define routes
router.get("/", getAllJobPostings); // Get all job postings
router.get("/:id", getJobPostingById); // Get a single job posting by ID
router.post("/", upload.array("file"), JobPostingValidation ,createJobPosting); // Create a new job posting with multiple images
router.put("/:id", upload.array("file"), updateJobPosting); // Update a job posting with multiple images
router.delete("/:id", deleteJobPosting); // Delete a job posting
router.get("/filter", filterJobs);

module.exports = router;
