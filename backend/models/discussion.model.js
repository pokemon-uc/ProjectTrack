const pool = require("../config/database");

const getProjectAccess = async (projectId) => {
  const result = await pool.query(
    `SELECT id, student_id, guide_id
     FROM projects
     WHERE id = $1 AND is_deleted = FALSE`,
    [projectId],
  );
  return result.rows[0];
};

const getThreadAccess = async (threadId) => {
  const result = await pool.query(
    `SELECT
       t.id,
       t.project_id,
       p.student_id,
       p.guide_id
     FROM discussion_threads t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1 AND p.is_deleted = FALSE`,
    [threadId],
  );
  return result.rows[0];
};

const createThread = async (projectId, title, createdBy) => {
  const result = await pool.query(
    `INSERT INTO discussion_threads (project_id, title, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, project_id, title, created_by, created_at`,
    [projectId, title, createdBy],
  );
  return result.rows[0];
};

const getThreadsByProject = async (projectId) => {
  const result = await pool.query(
    `SELECT
       t.id,
       t.project_id,
       t.title,
       t.created_by,
       t.created_at,
       u.name AS created_by_name
     FROM discussion_threads t
     JOIN users u ON u.id = t.created_by
     WHERE t.project_id = $1
     ORDER BY t.created_at DESC`,
    [projectId],
  );
  return result.rows;
};

const addReply = async (threadId, userId, message) => {
  const result = await pool.query(
    `INSERT INTO discussion_replies (thread_id, user_id, message)
     VALUES ($1, $2, $3)
     RETURNING id, thread_id, user_id, message, created_at`,
    [threadId, userId, message],
  );
  return result.rows[0];
};

const getReplies = async (threadId) => {
  const result = await pool.query(
    `SELECT
       r.id,
       r.thread_id,
       r.user_id,
       r.message,
       r.created_at,
       u.name AS user_name,
       u.role AS user_role
     FROM discussion_replies r
     JOIN users u ON u.id = r.user_id
     WHERE r.thread_id = $1
     ORDER BY r.created_at ASC`,
    [threadId],
  );
  return result.rows;
};

module.exports = {
  getProjectAccess,
  getThreadAccess,
  createThread,
  getThreadsByProject,
  addReply,
  getReplies,
};
