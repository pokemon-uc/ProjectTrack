const {
  createMilestone, getMilestonesByProject, completeMilestone, getCompletion,
} = require('../models/milestone.model');
const { createNotification } = require('../models/notification.model');
const addMilestone = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const milestone = await createMilestone(req.params.id, title, description, deadline);
    res.status(201).json({ message: 'Milestone added', milestone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMilestones = async (req, res) => {
  try {
    const milestones = await getMilestonesByProject(req.params.id);
    res.json({ milestones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markComplete = async (req, res) => {
  try {
    const milestone = await completeMilestone(req.params.mid);

    // 🔔 notify the user that their milestone is done
    await createNotification(
      req.user.id,
      'milestone_completed',
      'Milestone completed',
      `You completed the milestone: ${milestone.title}`,
      milestone.project_id
    );

    res.json({ message: 'Milestone completed', milestone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// the completion % — visible to students AND teachers
const getProjectProgress = async (req, res) => {
  try {
    const { total, completed } = await getCompletion(req.params.id);
    const percent = Number(total) === 0 ? 0 : Math.round((completed / total) * 100);
    res.json({
      total: Number(total),
      completed: Number(completed),
      completion: percent + '%',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addMilestone, getMilestones, markComplete, getProjectProgress };