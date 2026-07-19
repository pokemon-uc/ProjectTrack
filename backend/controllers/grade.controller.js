const { upsertGrade, getGradeByProject } = require('../models/grade.model');
const { getProjectById } = require('../models/project.model');
const { createNotification } = require('../models/notification.model');

// convert a score into a letter grade automatically
const toLetter = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

const gradeProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { score, remarks } = req.body;

    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const gradeLetter = toLetter(Number(score));
    const grade = await upsertGrade(projectId, req.user.id, score, gradeLetter, remarks);

    // 🔔 notify the student
    await createNotification(
      project.student_id,
      'project_graded',
      'Your project was graded',
      `You scored ${score}/100 (${gradeLetter})`,
      projectId
    );

    res.status(201).json({ message: 'Project graded', grade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGrade = async (req, res) => {
  try {
    const grade = await getGradeByProject(req.params.id);
    res.json({ grade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { gradeProject, getGrade };