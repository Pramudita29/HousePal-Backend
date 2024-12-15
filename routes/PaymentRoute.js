const express = require("express");
const router = express.Router();
const {
  processPayment,
  getEarningsSummary,
  getPaymentDetails,
} = require("../controllers/PaymentController");

router.post("/process", processPayment); // Record a payment
router.get("/earnings/:helperId", getEarningsSummary); // Get a helper's earnings summary
router.get("/details/:bookingId", getPaymentDetails); // Get payment details for a booking

module.exports = router;
