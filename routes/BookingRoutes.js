const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controller/BookingController");

const BookingValidation=require("../validation/BookingValidation");

// Define routes
router.get("/", getAllBookings); // Get all bookings
router.get("/:id", getBookingById); // Get a single booking by ID
router.post("/", BookingValidation ,createBooking); // Create a new booking
router.put("/:id", updateBooking); // Update a booking
router.delete("/:id", deleteBooking); // Delete a booking

module.exports = router;
