const {
  createMilestone,
  getMilestonesByProject,
  getMilestoneById,
  updateMilestoneStatus,
  getCompletion,
} = require("../models/milestone.model");
const { getProjectById } = require("../models/project.model");
const { createNotification } = require("../models/notification.model");

const canAccessProject = (project, user) => {
  if (user.role === "coordinator") return true;
  if (user.role === "student") return project.student_id === user.id;
  if (user.role === "guide") return project.guide_id === user.id;
  return false;
};

const addMilestone = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role === "guide" && project.guide_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this project" });
    }

    const { title, description, deadline } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Milestone title is required" });
    }

    const milestone = await createMilestone(
      project.id,
      title.trim(),
      description?.trim() || null,
      deadline || null,
    );

    await createNotification(
      project.student_id,
      "deadline_reminder",
      "New milestone added",
      deadline
        ? `${milestone.title} is due on ${new Date(deadline).toLocaleDateString("en-IN")}`
        : `${milestone.title} was added to your project`,
      project.id,
    );

    res.status(201).json({ message: "Milestone added", milestone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMilestones = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ error: "You cannot access this project" });
    }

    const milestones = await getMilestonesByProject(project.id);
    res.json({ milestones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitMilestone = async (req, res) => {
  try {
    const milestone = await getMilestoneById(req.params.mid);
    if (!milestone)
      return res.status(404).json({ error: "Milestone not found" });
    if (milestone.student_id !== req.user.id) {
      return res.status(403).json({ error: "This is not your milestone" });
    }
    if (milestone.status === "completed") {
      return res
        .status(400)
        .json({ error: "Completed milestone cannot be resubmitted" });
    }

    const updated = await updateMilestoneStatus(milestone.id, "submitted");
    res.json({ message: "Milestone submitted for review", milestone: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reviewMilestone = async (req, res) => {
  try {
    const milestone = await getMilestoneById(req.params.mid);
    if (!milestone)
      return res.status(404).json({ error: "Milestone not found" });

    if (req.user.role === "guide" && milestone.guide_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this project" });
    }

    const { status } = req.body;
    if (!["completed", "revision_needed"].includes(status)) {
      return res.status(400).json({
        error: "Status must be completed or revision_needed",
      });
    }
    if (milestone.status !== "submitted") {
      return res
        .status(400)
        .json({ error: "Student must submit the milestone first" });
    }

    const updated = await updateMilestoneStatus(milestone.id, status);
    const completed = status === "completed";

    await createNotification(
      milestone.student_id,
      completed ? "milestone_completed" : "milestone_revision",
      completed ? "Milestone completed" : "Milestone needs revision",
      completed
        ? `${milestone.title} was approved`
        : `${milestone.title} requires changes`,
      milestone.project_id,
    );

    res.json({
      message: completed ? "Milestone completed" : "Revision requested",
      milestone: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProjectProgress = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ error: "You cannot access this project" });
    }

    const { total, completed } = await getCompletion(project.id);
    const totalNumber = Number(total);
    const completedNumber = Number(completed);
    const percent = totalNumber
      ? Math.round((completedNumber / totalNumber) * 100)
      : 0;

    res.json({
      total: totalNumber,
      completed: completedNumber,
      completion: `${percent}%`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addMilestone,
  getMilestones,
  submitMilestone,
  reviewMilestone,
  getProjectProgress,
};
