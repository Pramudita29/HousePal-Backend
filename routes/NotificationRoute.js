const express = require("express");
const router = express.Router();
const { getNotifications, markAllNotificationsAsRead, addNotification } = require("../controller/NotificationController");
const { authenticateToken } = require("../security/auth");

router.get("/", authenticateToken, getNotifications);
router.patch("/mark-all-as-read", authenticateToken, markAllNotificationsAsRead);
router.post("/add", authenticateToken, async (req, res) => {
    try {
        const { recipientEmail, recipientType, title, message, type, jobId } = req.body;
        await addNotification(recipientEmail, recipientType, title, message, type, jobId);
        res.status(201).json({ message: 'Notification added successfully' });
    } catch (error) {
        console.error('Error adding notification:', error);
        res.status(500).json({ message: 'Error adding notification', error: error.message });
    }
});

module.exports = router;