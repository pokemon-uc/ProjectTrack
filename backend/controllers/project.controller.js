const {
  createProject,
  getProjectsByStudent,
  getProjectById,
  updateProjectStatus,
  addStatusHistory,
  getStatusHistory,
} = require('../models/project.model');

// student creates a project
const addProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const studentId = req.user.id; // from the token
    const project = await createProject(studentId, title, description);
    res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// logged-in student's own projects
const getMyProjects = async (req, res) => {
  try {
    const projects = await getProjectsByStudent(req.user.id);
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// one project by id
const getProject = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// student submits their project for review
const submitProject = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your project' });
    }

    const oldStatus = project.status;
    const updated = await updateProjectStatus(project.id, 'submitted', req.user.id);
    await addStatusHistory(project.id, oldStatus, 'submitted', req.user.id, 'Proposal submitted for review');

    res.json({ message: 'Project submitted', project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// view a project's audit trail
const viewStatusHistory = async (req, res) => {
  try {
    const history = await getStatusHistory(req.params.id);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addProject, getMyProjects, getProject, submitProject, viewStatusHistory };