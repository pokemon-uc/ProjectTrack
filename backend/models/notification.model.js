const pool = require('../config/database');

const createNotification = async (userId, type, title, message, linkProjectId = null) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, link_project_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, type, title, message, linkProjectId]
  );
  return result.rows[0];
};

const getNotificationsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getUnreadCount = async (userId) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return result.rows[0].unread;
};

const markAsRead = async (id) => {
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

const markAllAsRead = async (userId) => {
  await pool.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [userId]);
};

module.exports = {
  createNotification, getNotificationsByUser, getUnreadCount, markAsRead, markAllAsRead,
};