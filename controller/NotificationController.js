const Helper = require("../model/Helper");
const Seeker = require("../model/Seeker");

// Add a notification for a user (helper or seeker)
const addNotification = async (userId, userType, message) => {
  try {
    const Model = userType === "helper" ? Helper : Seeker;

    const user = await Model.findById(userId);
    if (!user) throw new Error("User not found");

    user.notifications.push({ message });
    await user.save();
    return { success: true, message: "Notification added successfully" };
  } catch (err) {
    throw new Error(`Error adding notification: ${err.message}`);
  }
};

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user's ID
    const userType = req.user.role; // Either 'helper' or 'seeker'
    const Model = userType === "helper" ? Helper : Seeker;

    const user = await Model.findById(userId).select("notifications");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role; // Either 'helper' or 'seeker'
    const Model = userType === "helper" ? Helper : Seeker;

    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications.forEach((notification) => {
      notification.isRead = true;
    });
    await user.save();

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error marking notifications", error: err.message });
  }
};

// Export the notification functions
module.exports = {
  addNotification,
  getNotifications,
  markAllNotificationsAsRead,
};
