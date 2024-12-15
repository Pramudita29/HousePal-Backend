const Helper = require("../model/Helper");
const Booking = require("../model/Booking");
const { addNotification } = require("./NotificationController");

// Record a payment and update the helper's earnings
const processPayment = async (req, res) => {
  try {
    const { helperId, amount, bookingId } = req.body;

    // Find the helper
    const helper = await Helper.findById(helperId);
    if (!helper) return res.status(404).json({ message: "Helper not found" });

    // Update earnings and payment history
    helper.earnings += amount;
    helper.paymentHistory.push({ amount, bookingId, date: new Date() });

    await helper.save();

    // Notify the helper
    await addNotification(helperId, "helper", `You have received a payment of $${amount}.`);

    res.status(200).json({ message: "Payment processed successfully", helper });
  } catch (err) {
    res.status(500).json({ message: "Error processing payment", error: err });
  }
};

// Get a helper's earnings summary
const getEarningsSummary = async (req, res) => {
  try {
    const { helperId } = req.params;

    const helper = await Helper.findById(helperId).select("earnings paymentHistory");
    if (!helper) return res.status(404).json({ message: "Helper not found" });

    res.status(200).json(helper);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving earnings summary", error: err });
  }
};

// Get payment details for a specific booking
const getPaymentDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("helperId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const paymentDetails = {
      helper: booking.helperId.name,
      amount: booking.paymentAmount,
      date: booking.paymentDate,
    };

    res.status(200).json(paymentDetails);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving payment details", error: err });
  }
};

module.exports = {
  processPayment,
  getEarningsSummary,
  getPaymentDetails,
};
