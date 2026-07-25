const {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../models/notification.model");

const getMyNotifications = async (req, res) => {
  try {
    const [notifications, unread] = await Promise.all([
      getNotificationsByUser(req.user.id),
      getUnreadCount(req.user.id),
    ]);
    return res.json({ unread: Number(unread), notifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load notifications" });
  }
};

const readOne = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const notification = await markAsRead(notificationId, req.user.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.json({ message: "Marked as read", notification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to update notification" });
  }
};

const readAll = async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    return res.json({ message: "All marked as read" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to update notifications" });
  }
};

module.exports = { getMyNotifications, readOne, readAll };
