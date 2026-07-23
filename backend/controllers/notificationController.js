const { getNotificationsByUser, markAllAsRead } = require("../models/notificationModel");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsByUser(req.user.user_id);
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    await markAllAsRead(req.user.user_id);
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update notifications",
      error: error.message,
    });
  }
};

module.exports = { getMyNotifications, readAllNotifications };
