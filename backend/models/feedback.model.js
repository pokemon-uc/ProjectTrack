const pool = require("../config/database");

const createFeedback = async (submissionId, guideId, status, comments) => {
  const result = await pool.query(
    `INSERT INTO feedbacks (submission_id, guide_id, status, comments)
     VALUES ($1, $2, $3, $4)
     RETURNING id, submission_id, guide_id, status, comments, created_at`,
    [submissionId, guideId, status, comments],
  );
  return result.rows[0];
};

const getFeedbackBySubmission = async (submissionId) => {
  const result = await pool.query(
    `SELECT
       f.id,
       f.submission_id,
       f.guide_id,
       f.status,
       f.comments,
       f.created_at,
       u.name AS guide_name
     FROM feedbacks f
     JOIN users u ON u.id = f.guide_id
     WHERE f.submission_id = $1
     ORDER BY f.created_at DESC`,
    [submissionId],
  );
  return result.rows;
};

const getSubmissionOwner = async (submissionId) => {
  const result = await pool.query(
    `SELECT
       s.id AS submission_id,
       p.id AS project_id,
       p.student_id,
       p.guide_id
     FROM submissions s
     JOIN projects p ON p.id = s.project_id
     WHERE s.id = $1 AND p.is_deleted = FALSE`,
    [submissionId],
  );
  return result.rows[0];
};

module.exports = {
  createFeedback,
  getFeedbackBySubmission,
  getSubmissionOwner,
};
