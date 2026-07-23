const {
  createProject,
  getProjectsByStudent,
  getProjectsByGuide,
  getAllProjects,
  getGuides,
  getProjectById,
  assignGuideToProject,
  updateProjectStatus,
  addStatusHistory,
  getStatusHistory,
} = require("../models/project.model");
const { createNotification } = require("../models/notification.model");

const canAccessProject = (project, user) => {
  if (user.role === "coordinator") return true;
  if (user.role === "student") return project.student_id === user.id;
  if (user.role === "guide") return project.guide_id === user.id;
  return false;
};

const addProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Project title is required" });
    }

    const project = await createProject(
      req.user.id,
      title.trim(),
      description?.trim() || null,
    );
    res.status(201).json({ message: "Project created", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyProjects = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student access required" });
    }
    const projects = await getProjectsByStudent(req.user.id);
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAssignedProjects = async (req, res) => {
  try {
    const projects = await getProjectsByGuide(req.user.id);
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCoordinatorProjects = async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listGuides = async (req, res) => {
  try {
    const guides = await getGuides();
    res.json({ guides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ error: "You cannot access this project" });
    }
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignGuide = async (req, res) => {
  try {
    const guideId = Number(req.body.guide_id);
    if (!guideId) {
      return res.status(400).json({ error: "guide_id is required" });
    }

    const project = await assignGuideToProject(req.params.id, guideId);
    if (!project) {
      return res.status(400).json({ error: "Project or guide not found" });
    }

    await createNotification(
      guideId,
      "guide_assigned",
      "New project assigned",
      `You have been assigned to project #${project.id}`,
      project.id,
    );

    res.json({ message: "Guide assigned", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitProject = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.student_id !== req.user.id) {
      return res.status(403).json({ error: "Not your project" });
    }

    const oldStatus = project.status;
    const updated = await updateProjectStatus(
      project.id,
      "submitted",
      req.user.id,
    );
    await addStatusHistory(
      project.id,
      oldStatus,
      "submitted",
      req.user.id,
      "Proposal submitted for review",
    );

    res.json({ message: "Project submitted", project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const viewStatusHistory = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ error: "You cannot access this project" });
    }

    const history = await getStatusHistory(project.id);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addProject,
  getMyProjects,
  getAssignedProjects,
  getCoordinatorProjects,
  listGuides,
  getProject,
  assignGuide,
  submitProject,
  viewStatusHistory,
};
