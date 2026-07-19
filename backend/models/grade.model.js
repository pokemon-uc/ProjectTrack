const pool = require('../config/database');

// insert a grade, or update it if the project is already graded
const upsertGrade = async (projectId, guideId, score, gradeLetter, remarks) => {
  const result = await pool.query(
    `INSERT INTO grades (project_id, guide_id, score, grade_letter, remarks)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (project_id) DO UPDATE
       SET score = EXCLUDED.score, grade_letter = EXCLUDED.grade_letter,
           remarks = EXCLUDED.remarks, guide_id = EXCLUDED.guide_id, created_at = NOW()
     RETURNING *`,
    [projectId, guideId, score, gradeLetter, remarks]
  );
  return result.rows[0];
};

const getGradeByProject = async (projectId) => {
  const result = await pool.query(
    `SELECT g.*, u.name AS guide_name
     FROM grades g JOIN users u ON g.guide_id = u.id
     WHERE g.project_id = $1`,
    [projectId]
  );
  return result.rows[0];
};

module.exports = { upsertGrade, getGradeByProject };