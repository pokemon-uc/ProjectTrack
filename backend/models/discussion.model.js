const pool = require('../config/database');

const createThread = async (projectId, title, createdBy) => {
  const result = await pool.query(
    `INSERT INTO discussion_threads (project_id, title, created_by)
     VALUES ($1, $2, $3) RETURNING *`,
    [projectId, title, createdBy]
  );
  return result.rows[0];
};

const getThreadsByProject = async (projectId) => {
  const result = await pool.query(
    `SELECT t.*, u.name AS created_by_name
     FROM discussion_threads t JOIN users u ON t.created_by = u.id
     WHERE t.project_id = $1 ORDER BY t.created_at DESC`,
    [projectId]
  );
  return result.rows;
};

const addReply = async (threadId, userId, message) => {
  const result = await pool.query(
    `INSERT INTO discussion_replies (thread_id, user_id, message)
     VALUES ($1, $2, $3) RETURNING *`,
    [threadId, userId, message]
  );
  return result.rows[0];
};

const getReplies = async (threadId) => {
  const result = await pool.query(
    `SELECT r.*, u.name AS user_name, u.role AS user_role
     FROM discussion_replies r JOIN users u ON r.user_id = u.id
     WHERE r.thread_id = $1 ORDER BY r.created_at ASC`,
    [threadId]
  );
  return result.rows;
};

module.exports = { createThread, getThreadsByProject, addReply, getReplies };