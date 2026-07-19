const pool = require('../config/database');

// create a new project
const createProject = async (studentId, title, description) => {
  const result = await pool.query(
    `INSERT INTO projects (student_id, title, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [studentId, title, description]
  );
  return result.rows[0];
};

// all projects for one student
const getProjectsByStudent = async (studentId) => {
  const result = await pool.query(
    `SELECT * FROM projects WHERE student_id = $1 AND is_deleted = FALSE
     ORDER BY created_at DESC`,
    [studentId]
  );
  return result.rows;
};

// one project by id
const getProjectById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM projects WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );
  return result.rows[0];
};

// change a project's status
const updateProjectStatus = async (id, newStatus, changedBy) => {
  const result = await pool.query(
    `UPDATE projects
     SET status = $1, status_changed_at = NOW(), status_changed_by = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [newStatus, changedBy, id]
  );
  return result.rows[0];
};

// record a status change in the audit trail
const addStatusHistory = async (projectId, oldStatus, newStatus, changedBy, remarks) => {
  await pool.query(
    `INSERT INTO project_status_history (project_id, old_status, new_status, changed_by, remarks)
     VALUES ($1, $2, $3, $4, $5)`,
    [projectId, oldStatus, newStatus, changedBy, remarks]
  );
};

// get the audit trail for a project
const getStatusHistory = async (projectId) => {
  const result = await pool.query(
    `SELECT h.*, u.name AS changed_by_name
     FROM project_status_history h
     JOIN users u ON h.changed_by = u.id
     WHERE h.project_id = $1
     ORDER BY h.changed_at ASC`,
    [projectId]
  );
  return result.rows;
};

module.exports = {
  createProject,
  getProjectsByStudent,
  getProjectById,
  updateProjectStatus,
  addStatusHistory,
  getStatusHistory,
};