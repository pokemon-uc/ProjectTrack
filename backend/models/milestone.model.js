const pool = require('../config/database');

const createMilestone = async (projectId, title, description, deadline) => {
  const result = await pool.query(
    `INSERT INTO milestones (project_id, title, description, deadline)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [projectId, title, description, deadline]
  );
  return result.rows[0];
};

const getMilestonesByProject = async (projectId) => {
  const result = await pool.query(
    `SELECT * FROM milestones WHERE project_id = $1 ORDER BY deadline ASC`,
    [projectId]
  );
  return result.rows;
};

const completeMilestone = async (id) => {
  const result = await pool.query(
    `UPDATE milestones
     SET status = 'completed', is_late = (NOW() > deadline)
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

// counts total vs completed milestones
const getCompletion = async (projectId) => {
  const result = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed
     FROM milestones WHERE project_id = $1`,
    [projectId]
  );
  return result.rows[0];
};

module.exports = { createMilestone, getMilestonesByProject, completeMilestone, getCompletion };