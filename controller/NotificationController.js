const Notification = require('../model/Notification');
const Helper = require('../model/Helper');
const Seeker = require('../model/Seeker');

const addNotification = async (recipientEmail, recipientType, title, message, jobId) => {
    try {
        const recipient = recipientType === 'Helper'
            ? await Helper.findOne({ email: recipientEmail })
            : await Seeker.findOne({ email: recipientEmail });

        if (!recipient) {
            throw new Error(`Recipient not found for email: ${recipientEmail}`);
        }

        const notification = new Notification({
            recipientEmail,
            recipientType,
            title,
            message,
            jobId, // Include jobId in the notification
        });

        await notification.save();
        console.log(`Notification saved for recipientEmail ${recipientEmail}: ${title} - ${message}`);
    } catch (error) {
        console.error(`Error saving notification for recipientEmail ${recipientEmail}:`, error);
        throw error;
    }
};

const getNotifications = async (req, res) => {
    try {
        const user = req.user; // Assuming req.user is set by authenticateToken middleware
        console.log('User:', user);

        if (!user.email) {
            console.error('User email is missing');
            return res.status(400).json({ message: 'User email is missing' });
        }

        const notifications = await Notification.find({ recipientEmail: user.email })
            .sort({ createdAt: -1 });

        console.log('Notifications:', notifications);

        res.status(200).json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Error fetching notifications", error: err });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userEmail = req.user.email; // Assuming the email is stored in req.user.email

        await Notification.updateMany(
            { recipientEmail: userEmail },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error(`Error marking notifications as read for user ${req.user.email}:`, err);
        res.status(500).json({ message: 'Error marking notifications', error: err.message });
    }
};

module.exports = {
    addNotification,
    getNotifications,
    markAllNotificationsAsRead,
};