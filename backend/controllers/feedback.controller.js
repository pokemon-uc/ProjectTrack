const { createFeedback, getFeedbackBySubmission, getSubmissionOwner } = require('../models/feedback.model');
const { createNotification } = require('../models/notification.model');

// guide reviews a submission (approved / rejected / revision_needed)
const giveFeedback = async (req, res) => {
  try {
    const submissionId = req.params.subId;
    const { status, comments } = req.body;

    const feedback = await createFeedback(submissionId, req.user.id, status, comments);

    // 🔔 notify the student who owns this submission
    const owner = await getSubmissionOwner(submissionId);
    if (owner) {
      const typeMap = {
        approved: 'proposal_approved',
        rejected: 'proposal_rejected',
        revision_needed: 'changes_requested',
      };
      await createNotification(
        owner.student_id,
        typeMap[status] || 'changes_requested',
        `Submission ${status}`,
        comments || `Your submission was ${status}`,
        owner.project_id
      );
    }

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    const feedback = await getFeedbackBySubmission(req.params.subId);
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { giveFeedback, getFeedback };