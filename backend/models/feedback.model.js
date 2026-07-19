const pool = require('../config/database');

const createFeedback = async (submissionId, guideId, status, comments) => {
  const result = await pool.query(
    `INSERT INTO feedbacks (submission_id, guide_id, status, comments)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [submissionId, guideId, status, comments]
  );
  return result.rows[0];
};

const getFeedbackBySubmission = async (submissionId) => {
  const result = await pool.query(
    `SELECT f.*, u.name AS guide_name
     FROM feedbacks f JOIN users u ON f.guide_id = u.id
     WHERE f.submission_id = $1 ORDER BY f.created_at DESC`,
    [submissionId]
  );
  return result.rows;
};

// find the student + project behind a submission (so we can notify them)
const getSubmissionOwner = async (submissionId) => {
  const result = await pool.query(
    `SELECT p.id AS project_id, p.student_id
     FROM submissions s JOIN projects p ON s.project_id = p.id
     WHERE s.id = $1`,
    [submissionId]
  );
  return result.rows[0];
};

module.exports = { createFeedback, getFeedbackBySubmission, getSubmissionOwner };