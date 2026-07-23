const pool = require("../config/database");

const findSubmission = async (projectId, type, milestoneId = null) => {
  const result = await pool.query(
    `SELECT *
     FROM submissions
     WHERE project_id = $1
       AND type = $2
       AND (
         ($3::int IS NULL AND milestone_id IS NULL)
         OR milestone_id = $3
       )`,
    [projectId, type, milestoneId],
  );
  return result.rows[0];
};

const createSubmission = async (projectId, milestoneId, type) => {
  const result = await pool.query(
    `INSERT INTO submissions (project_id, milestone_id, type, current_version)
     VALUES ($1, $2, $3, 1)
     RETURNING *`,
    [projectId, milestoneId, type],
  );
  return result.rows[0];
};

const updateSubmissionVersion = async (submissionId, newVersion) => {
  const result = await pool.query(
    `UPDATE submissions
     SET current_version = $1, submitted_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [newVersion, submissionId],
  );
  return result.rows[0];
};

const addVersion = async (
  submissionId,
  versionNumber,
  filePath,
  notes,
  uploadedBy,
) => {
  const result = await pool.query(
    `INSERT INTO submission_versions
       (submission_id, version_number, file_path, notes, uploaded_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [submissionId, versionNumber, filePath, notes, uploadedBy],
  );
  return result.rows[0];
};

const getSubmissionsByProject = async (projectId) => {
  const result = await pool.query(
    `SELECT s.*, m.title AS milestone_title
     FROM submissions s
     LEFT JOIN milestones m ON m.id = s.milestone_id
     WHERE s.project_id = $1
     ORDER BY s.submitted_at DESC`,
    [projectId],
  );
  return result.rows;
};

const getSubmissionWithProject = async (submissionId) => {
  const result = await pool.query(
    `SELECT
       s.*,
       p.student_id,
       p.guide_id,
       p.title AS project_title,
       p.is_deleted AS project_is_deleted
     FROM submissions s
     JOIN projects p ON p.id = s.project_id
     WHERE s.id = $1 AND p.is_deleted = FALSE`,
    [submissionId],
  );
  return result.rows[0];
};

const getVersions = async (submissionId) => {
  const result = await pool.query(
    `SELECT
       v.id,
       v.submission_id,
       v.version_number,
       v.notes,
       v.uploaded_at,
       v.uploaded_by,
       u.name AS uploaded_by_name,
       (v.file_path IS NOT NULL) AS has_file
     FROM submission_versions v
     JOIN users u ON u.id = v.uploaded_by
     WHERE v.submission_id = $1
     ORDER BY v.version_number ASC`,
    [submissionId],
  );
  return result.rows;
};

const getVersionWithProject = async (versionId) => {
  const result = await pool.query(
    `SELECT
       v.*,
       s.type,
       s.project_id,
       p.title AS project_title,
       p.student_id,
       p.guide_id,
       p.is_deleted AS project_is_deleted
     FROM submission_versions v
     JOIN submissions s ON s.id = v.submission_id
     JOIN projects p ON p.id = s.project_id
     WHERE v.id = $1 AND p.is_deleted = FALSE`,
    [versionId],
  );
  return result.rows[0];
};

const milestoneBelongsToProject = async (milestoneId, projectId) => {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT 1
       FROM milestones
       WHERE id = $1 AND project_id = $2
     ) AS belongs`,
    [milestoneId, projectId],
  );
  return result.rows[0].belongs;
};

module.exports = {
  findSubmission,
  createSubmission,
  updateSubmissionVersion,
  addVersion,
  getSubmissionsByProject,
  getSubmissionWithProject,
  getVersions,
  getVersionWithProject,
  milestoneBelongsToProject,
};
