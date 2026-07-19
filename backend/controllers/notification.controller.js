const {
  getNotificationsByUser, getUnreadCount, markAsRead, markAllAsRead,
} = require('../models/notification.model');

// my notifications + unread count (the bell 🔔)
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsByUser(req.user.id);
    const unread = await getUnreadCount(req.user.id);
    res.json({ unread: Number(unread), notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const readOne = async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id);
    res.json({ message: 'Marked as read', notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const readAll = async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMyNotifications, readOne, readAll };