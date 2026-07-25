const {
  createFeedback,
  getFeedbackBySubmission,
  getSubmissionOwner,
} = require("../models/feedback.model");
const { createNotification } = require("../models/notification.model");

const allowedStatuses = new Set(["approved", "rejected", "revision_needed"]);

const canAccessProject = (project, user) => {
  if (user.role === "coordinator") return true;
  if (user.role === "student") return project.student_id === user.id;
  if (user.role === "guide") return project.guide_id === user.id;
  return false;
};

const positiveId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const giveFeedback = async (req, res) => {
  try {
    const submissionId = positiveId(req.params.subId);
    const status = req.body.status;
    const comments =
      typeof req.body.comments === "string" ? req.body.comments.trim() : null;

    if (!submissionId) {
      return res.status(400).json({ error: "Invalid submission ID" });
    }
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ error: "Invalid feedback status" });
    }
    if (comments && comments.length > 5000) {
      return res.status(400).json({ error: "Comments are too long" });
    }

    const owner = await getSubmissionOwner(submissionId);
    if (!owner) return res.status(404).json({ error: "Submission not found" });
    if (owner.guide_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this project" });
    }

    const feedback = await createFeedback(
      submissionId,
      req.user.id,
      status,
      comments || null,
    );

    const typeMap = {
      approved: "proposal_approved",
      rejected: "proposal_rejected",
      revision_needed: "changes_requested",
    };

    await createNotification(
      owner.student_id,
      typeMap[status],
      `Submission ${status}`,
      comments || `Your submission was ${status}`,
      owner.project_id,
    );

    return res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to submit feedback" });
  }
};

const getFeedback = async (req, res) => {
  try {
    const submissionId = positiveId(req.params.subId);
    if (!submissionId) {
      return res.status(400).json({ error: "Invalid submission ID" });
    }

    const owner = await getSubmissionOwner(submissionId);
    if (!owner) return res.status(404).json({ error: "Submission not found" });
    if (!canAccessProject(owner, req.user)) {
      return res.status(403).json({ error: "You cannot access this feedback" });
    }

    const feedback = await getFeedbackBySubmission(submissionId);
    return res.json({ feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load feedback" });
  }
};

module.exports = { giveFeedback, getFeedback };
