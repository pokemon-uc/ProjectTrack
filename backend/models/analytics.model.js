const pool = require('../config/database');

// overall totals
const getTotals = async () => {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM projects WHERE is_deleted = FALSE) AS total_projects,
       (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
       (SELECT COUNT(*) FROM users WHERE role = 'guide') AS total_guides`
  );
  return result.rows[0];
};

// projects grouped by status
const getStatusBreakdown = async () => {
  const result = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM projects WHERE is_deleted = FALSE
     GROUP BY status`
  );
  return result.rows;
};

// projects that have at least one late milestone
const getDelayedProjects = async () => {
  const result = await pool.query(
    `SELECT DISTINCT p.id, p.title
     FROM projects p
     JOIN milestones m ON m.project_id = p.id
     WHERE m.is_late = TRUE AND p.is_deleted = FALSE`
  );
  return result.rows;
};

// average grade across all graded projects
const getAverageGrade = async () => {
  const result = await pool.query(`SELECT ROUND(AVG(score), 1) AS average_score FROM grades`);
  return result.rows[0].average_score;
};

// projects per department
const getProjectsByDepartment = async () => {
  const result = await pool.query(
    `SELECT u.department, COUNT(p.id) AS project_count
     FROM projects p
     JOIN users u ON p.student_id = u.id
     WHERE p.is_deleted = FALSE
     GROUP BY u.department`
  );
  return result.rows;
};

module.exports = {
  getTotals, getStatusBreakdown, getDelayedProjects, getAverageGrade, getProjectsByDepartment,
};