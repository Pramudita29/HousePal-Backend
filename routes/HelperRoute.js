const express = require("express");
const router = express.Router();
const {
  getAllHelper,
  getHelperById,
  createHelper,
  updateHelper,
  deleteHelper,
} = require("../controller/HelperController");

const HelperValidation=require("../validation/HelperValidation");


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
router.get("/", getAllHelper); // Get all Helpers
router.get("/:id", getHelperById); // Get a single Helper by ID
router.post("/", upload.single("file"),HelperValidation ,createHelper); // Create a new Helper with an image
router.put("/:id", upload.single("file"), updateHelper); // Update a Helper with a new image
router.delete("/:id", deleteHelper); // Delete a Helper

module.exports = router;
