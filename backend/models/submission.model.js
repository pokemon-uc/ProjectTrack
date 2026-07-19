const pool = require('../config/database');

const findSubmission = async (projectId, type) => {
  const result = await pool.query(
    `SELECT * FROM submissions WHERE project_id = $1 AND type = $2`,
    [projectId, type]
  );
  return result.rows[0];
};

const createSubmission = async (projectId, milestoneId, type) => {
  const result = await pool.query(
    `INSERT INTO submissions (project_id, milestone_id, type, current_version)
     VALUES ($1, $2, $3, 1) RETURNING *`,
    [projectId, milestoneId, type]
  );
  return result.rows[0];
};

const updateSubmissionVersion = async (submissionId, newVersion) => {
  const result = await pool.query(
    `UPDATE submissions SET current_version = $1, submitted_at = NOW()
     WHERE id = $2 RETURNING *`,
    [newVersion, submissionId]
  );
  return result.rows[0];
};

const addVersion = async (submissionId, versionNumber, filePath, notes, uploadedBy) => {
  const result = await pool.query(
    `INSERT INTO submission_versions (submission_id, version_number, file_path, notes, uploaded_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [submissionId, versionNumber, filePath, notes, uploadedBy]
  );
  return result.rows[0];
};

const getSubmissionsByProject = async (projectId) => {
  const result = await pool.query(
    `SELECT * FROM submissions WHERE project_id = $1 ORDER BY submitted_at DESC`,
    [projectId]
  );
  return result.rows;
};

const getVersions = async (submissionId) => {
  const result = await pool.query(
    `SELECT v.*, u.name AS uploaded_by_name
     FROM submission_versions v
     JOIN users u ON v.uploaded_by = u.id
     WHERE v.submission_id = $1 ORDER BY v.version_number ASC`,
    [submissionId]
  );
  return result.rows;
};

module.exports = {
  findSubmission, createSubmission, updateSubmissionVersion,
  addVersion, getSubmissionsByProject, getVersions,
};