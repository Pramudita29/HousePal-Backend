const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAllNotificationsAsRead,
} = require("../controller/NotificationController");
const authenticate = require("../security/auth"); // Import authentication functions from auth.js

// Route to get all notifications
// This route is protected by the authenticateToken middleware
router.get("/", authenticate.authenticateToken, async (req, res) => {
  try {
    // Call the controller function to get notifications
    await getNotifications(req, res);
  } catch (error) {
    res.status(500).send("Error fetching notifications");
  }
});

// Route to mark all notifications as read
// This route is also protected by the authenticateToken middleware
router.patch("/mark-all-as-read", authenticate.authenticateToken, async (req, res) => {
  try {
    // Call the controller function to mark all notifications as read
    await markAllNotificationsAsRead(req, res);
  } catch (error) {
    res.status(500).send("Error marking notifications as read");
  }
});

module.exports = router;
