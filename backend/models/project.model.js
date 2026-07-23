const pool = require("../config/database");

const createProject = async (studentId, title, description) => {
  const result = await pool.query(
    `INSERT INTO projects (student_id, title, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [studentId, title, description],
  );
  return result.rows[0];
};

const getProjectsByStudent = async (studentId) => {
  const result = await pool.query(
    `SELECT *
     FROM projects
     WHERE student_id = $1 AND is_deleted = FALSE
     ORDER BY created_at DESC`,
    [studentId],
  );
  return result.rows;
};

const getProjectsByGuide = async (guideId) => {
  const result = await pool.query(
    `SELECT
       p.*,
       student.name AS student_name,
       student.email AS student_email,
       latest_submission.type AS latest_submission_type,
       latest_submission.current_version,
       latest_submission.submitted_at AS latest_submitted_at,
       latest_feedback.status AS latest_feedback_status,
       latest_feedback.created_at AS latest_feedback_at
     FROM projects p
     JOIN users student ON student.id = p.student_id
     LEFT JOIN LATERAL (
       SELECT s.id, s.type, s.current_version, s.submitted_at
       FROM submissions s
       WHERE s.project_id = p.id
       ORDER BY s.submitted_at DESC
       LIMIT 1
     ) latest_submission ON TRUE
     LEFT JOIN LATERAL (
       SELECT f.status, f.created_at
       FROM feedbacks f
       JOIN submissions s ON s.id = f.submission_id
       WHERE s.project_id = p.id
       ORDER BY f.created_at DESC
       LIMIT 1
     ) latest_feedback ON TRUE
     WHERE p.guide_id = $1 AND p.is_deleted = FALSE
     ORDER BY
       CASE WHEN p.status IN ('submitted', 'under_review') THEN 0 ELSE 1 END,
       COALESCE(latest_submission.submitted_at, p.updated_at, p.created_at) DESC`,
    [guideId],
  );
  return result.rows;
};

const getProjectById = async (id) => {
  const result = await pool.query(
    `SELECT
       p.*,
       student.name AS student_name,
       student.email AS student_email,
       guide.name AS guide_name
     FROM projects p
     JOIN users student ON student.id = p.student_id
     LEFT JOIN users guide ON guide.id = p.guide_id
     WHERE p.id = $1 AND p.is_deleted = FALSE`,
    [id],
  );
  return result.rows[0];
};

const assignGuideToProject = async (projectId, guideId) => {
  const result = await pool.query(
    `UPDATE projects
     SET guide_id = $1, updated_at = NOW()
     WHERE id = $2
       AND is_deleted = FALSE
       AND EXISTS (
         SELECT 1 FROM users WHERE id = $1 AND role = 'guide'
       )
     RETURNING *`,
    [guideId, projectId],
  );
  return result.rows[0];
};

const updateProjectStatus = async (id, newStatus, changedBy) => {
  const result = await pool.query(
    `UPDATE projects
     SET status = $1,
         status_changed_at = NOW(),
         status_changed_by = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [newStatus, changedBy, id],
  );
  return result.rows[0];
};

const addStatusHistory = async (
  projectId,
  oldStatus,
  newStatus,
  changedBy,
  remarks,
) => {
  await pool.query(
    `INSERT INTO project_status_history
       (project_id, old_status, new_status, changed_by, remarks)
     VALUES ($1, $2, $3, $4, $5)`,
    [projectId, oldStatus, newStatus, changedBy, remarks],
  );
};

const getStatusHistory = async (projectId) => {
  const result = await pool.query(
    `SELECT h.*, u.name AS changed_by_name
     FROM project_status_history h
     JOIN users u ON h.changed_by = u.id
     WHERE h.project_id = $1
     ORDER BY h.changed_at ASC`,
    [projectId],
  );
  return result.rows;
};

const getAllProjects = async () => {
  const result = await pool.query(
    `SELECT
       p.*,
       student.name AS student_name,
       student.email AS student_email,
       student.department AS department,
       guide.name AS guide_name,
       guide.email AS guide_email,
       latest_submission.type AS latest_submission_type,
       latest_submission.current_version,
       latest_submission.submitted_at AS latest_submitted_at,
       grade.score,
       grade.grade_letter,
       grade.remarks AS grade_remarks
     FROM projects p
     JOIN users student ON student.id = p.student_id
     LEFT JOIN users guide ON guide.id = p.guide_id
     LEFT JOIN LATERAL (
       SELECT s.type, s.current_version, s.submitted_at
       FROM submissions s
       WHERE s.project_id = p.id
       ORDER BY s.submitted_at DESC
       LIMIT 1
     ) latest_submission ON TRUE
     LEFT JOIN grades grade ON grade.project_id = p.id
     WHERE p.is_deleted = FALSE
     ORDER BY
       CASE WHEN p.guide_id IS NULL THEN 0 ELSE 1 END,
       CASE WHEN p.status IN ('submitted', 'under_review') THEN 0 ELSE 1 END,
       p.updated_at DESC`,
  );
  return result.rows;
};

const getGuides = async () => {
  const result = await pool.query(
    `SELECT id, name, email, department
     FROM users
     WHERE role = 'guide'
     ORDER BY name ASC, email ASC`,
  );
  return result.rows;
};

module.exports = {
  createProject,
  getProjectsByStudent,
  getProjectsByGuide,
  getAllProjects,
  getGuides,
  getProjectById,
  assignGuideToProject,
  updateProjectStatus,
  addStatusHistory,
  getStatusHistory,
};
