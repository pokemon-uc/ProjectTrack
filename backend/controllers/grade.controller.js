const { upsertGrade, getGradeByProject } = require("../models/grade.model");
const {
  getProjectById,
  updateProjectStatus,
  addStatusHistory,
} = require("../models/project.model");
const { createNotification } = require("../models/notification.model");

const toLetter = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const canAccessProject = (project, user) => {
  if (user.role === "coordinator") return true;
  if (user.role === "student") return project.student_id === user.id;
  if (user.role === "guide") return project.guide_id === user.id;
  return false;
};

const gradeProject = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const score = Number(req.body.score);
    const remarks = req.body.remarks?.trim() || null;
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return res.status(400).json({ error: "Score must be between 0 and 100" });
    }

    const gradeLetter = toLetter(score);
    const grade = await upsertGrade(
      project.id,
      req.user.id,
      score,
      gradeLetter,
      remarks,
    );

    if (project.status !== "completed") {
      await updateProjectStatus(project.id, "completed", req.user.id);
      await addStatusHistory(
        project.id,
        project.status,
        "completed",
        req.user.id,
        "Final grade recorded",
      );
    }

    await createNotification(
      project.student_id,
      "project_graded",
      "Your project was graded",
      `You scored ${score}/100 (${gradeLetter})`,
      project.id,
    );

    res.status(201).json({ message: "Final grade saved", grade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGrade = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ error: "You cannot access this project" });
    }

    const grade = await getGradeByProject(project.id);
    res.json({ grade: grade || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { gradeProject, getGrade };
