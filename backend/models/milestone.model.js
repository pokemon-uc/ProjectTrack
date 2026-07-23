const pool = require("../config/database");

const createMilestone = async (projectId, title, description, deadline) => {
  const result = await pool.query(
    `INSERT INTO milestones (project_id, title, description, deadline)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [projectId, title, description, deadline],
  );
  return result.rows[0];
};

const getMilestonesByProject = async (projectId) => {
  const result = await pool.query(
    `SELECT
       m.*,
       (m.deadline IS NOT NULL
        AND NOW() > m.deadline
        AND m.status <> 'completed') AS is_overdue
     FROM milestones m
     WHERE m.project_id = $1
     ORDER BY m.deadline ASC NULLS LAST, m.created_at ASC`,
    [projectId],
  );
  return result.rows;
};

const getMilestoneById = async (id) => {
  const result = await pool.query(
    `SELECT
       m.*,
       p.student_id,
       p.guide_id,
       p.is_deleted AS project_is_deleted
     FROM milestones m
     JOIN projects p ON p.id = m.project_id
     WHERE m.id = $1 AND p.is_deleted = FALSE`,
    [id],
  );
  return result.rows[0];
};

const updateMilestoneStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE milestones
     SET status = $1,
         is_late = CASE
           WHEN $1 = 'completed' AND deadline IS NOT NULL THEN NOW() > deadline
           ELSE is_late
         END
     WHERE id = $2
     RETURNING *`,
    [status, id],
  );
  return result.rows[0];
};

const getCompletion = async (projectId) => {
  const result = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed
     FROM milestones
     WHERE project_id = $1`,
    [projectId],
  );
  return result.rows[0];
};

module.exports = {
  createMilestone,
  getMilestonesByProject,
  getMilestoneById,
  updateMilestoneStatus,
  getCompletion,
};
