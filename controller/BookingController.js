const Booking = require("../model/Booking"); // Import your Booking model

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: "Error creating booking", error: err });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate(["seekerId"]);
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving bookings", error: err });
  }
};

// Get a single booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving booking", error: err });
  }
};

// Update a booking
const updateBooking = async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: "Error updating booking", error: err });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting booking", error: err });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
