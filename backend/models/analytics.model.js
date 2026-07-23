const pool = require("../config/database");

const getSummary = async () => {
  const result = await pool.query(`
    WITH approval_times AS (
      SELECT
        p.id,
        (
          SELECT MIN(h.changed_at)
          FROM project_status_history h
          WHERE h.project_id = p.id AND h.new_status = 'submitted'
        ) AS submitted_at,
        (
          SELECT MIN(h.changed_at)
          FROM project_status_history h
          WHERE h.project_id = p.id
            AND h.new_status IN ('approved', 'completed')
        ) AS approved_at
      FROM projects p
      WHERE p.is_deleted = FALSE
    )
    SELECT
      COUNT(*) FILTER (WHERE p.is_deleted = FALSE) AS total_projects,
      COUNT(*) FILTER (
        WHERE p.is_deleted = FALSE
          AND p.status IN ('submitted', 'under_review')
          AND COALESCE(p.status_changed_at, p.updated_at, p.created_at)
            < NOW() - INTERVAL '7 days'
      ) AS waiting_over_7_days,
      COUNT(*) FILTER (
        WHERE p.is_deleted = FALSE
          AND EXISTS (
            SELECT 1
            FROM milestones m
            WHERE m.project_id = p.id
              AND m.deadline IS NOT NULL
              AND m.deadline < NOW()
              AND m.status <> 'completed'
          )
      ) AS delayed_projects,
      COUNT(*) FILTER (
        WHERE p.is_deleted = FALSE AND p.status = 'completed'
      ) AS completed_projects,
      COALESCE(
        ROUND(
          100.0 * COUNT(*) FILTER (
            WHERE p.is_deleted = FALSE AND p.status = 'completed'
          ) / NULLIF(COUNT(*) FILTER (WHERE p.is_deleted = FALSE), 0),
          1
        ),
        0
      ) AS completion_rate,
      COALESCE(
        (
          SELECT ROUND(
            AVG(EXTRACT(EPOCH FROM (approved_at - submitted_at)) / 3600)::numeric,
            1
          )
          FROM approval_times
          WHERE submitted_at IS NOT NULL
            AND approved_at IS NOT NULL
            AND approved_at >= submitted_at
        ),
        0
      ) AS average_approval_hours,
      COALESCE((SELECT ROUND(AVG(score), 1) FROM grades), 0) AS average_grade
    FROM projects p
  `);
  return result.rows[0];
};

const getStatusBreakdown = async () => {
  const result = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM projects
    WHERE is_deleted = FALSE
    GROUP BY status
    ORDER BY count DESC, status ASC
  `);
  return result.rows;
};

const getGuideWorkload = async () => {
  const result = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      COUNT(p.id) AS project_count,
      COUNT(p.id) FILTER (
        WHERE p.status IN ('submitted', 'under_review')
      ) AS awaiting_review
    FROM users u
    LEFT JOIN projects p
      ON p.guide_id = u.id AND p.is_deleted = FALSE
    WHERE u.role = 'guide'
    GROUP BY u.id, u.name, u.email
    ORDER BY project_count DESC, u.name ASC
  `);
  return result.rows;
};

const getDepartmentCompletion = async () => {
  const result = await pool.query(`
    SELECT
      COALESCE(NULLIF(TRIM(u.department), ''), 'Not specified') AS department,
      COUNT(p.id) AS total,
      COUNT(p.id) FILTER (WHERE p.status = 'completed') AS completed,
      COALESCE(
        ROUND(
          100.0 * COUNT(p.id) FILTER (WHERE p.status = 'completed')
          / NULLIF(COUNT(p.id), 0),
          1
        ),
        0
      ) AS completion_rate
    FROM projects p
    JOIN users u ON u.id = p.student_id
    WHERE p.is_deleted = FALSE
    GROUP BY COALESCE(NULLIF(TRIM(u.department), ''), 'Not specified')
    ORDER BY total DESC, department ASC
  `);
  return result.rows;
};

const getGradeDistribution = async () => {
  const result = await pool.query(`
    SELECT grade_letter, COUNT(*) AS count
    FROM grades
    GROUP BY grade_letter
    ORDER BY grade_letter ASC
  `);
  return result.rows;
};

const getStudentsMissingDeadlines = async () => {
  const result = await pool.query(`
    SELECT
      student.name AS student_name,
      student.email AS student_email,
      COALESCE(NULLIF(TRIM(student.department), ''), 'Not specified') AS department,
      p.id AS project_id,
      p.title AS project_title,
      COUNT(m.id) AS late_count
    FROM milestones m
    JOIN projects p ON p.id = m.project_id
    JOIN users student ON student.id = p.student_id
    WHERE p.is_deleted = FALSE
      AND m.deadline IS NOT NULL
      AND m.deadline < NOW()
      AND m.status <> 'completed'
    GROUP BY
      student.id,
      student.name,
      student.email,
      student.department,
      p.id,
      p.title
    ORDER BY late_count DESC, student.name ASC
    LIMIT 10
  `);
  return result.rows;
};

module.exports = {
  getSummary,
  getStatusBreakdown,
  getGuideWorkload,
  getDepartmentCompletion,
  getGradeDistribution,
  getStudentsMissingDeadlines,
};
