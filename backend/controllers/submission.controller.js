const {
  findSubmission, createSubmission, updateSubmissionVersion,
  addVersion, getSubmissionsByProject, getVersions,
} = require('../models/submission.model');
const { getProjectById } = require('../models/project.model');

// student uploads a file -> becomes a new version
const uploadSubmission = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { type, milestone_id, notes } = req.body;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your project' });
    }

    let submission = await findSubmission(projectId, type);
    let versionNumber;

    if (!submission) {
      submission = await createSubmission(projectId, milestone_id || null, type);
      versionNumber = 1;
    } else {
      versionNumber = submission.current_version + 1;
      await updateSubmissionVersion(submission.id, versionNumber);
    }

    const version = await addVersion(submission.id, versionNumber, req.file.path, notes || null, req.user.id);

    res.status(201).json({ message: `File uploaded as version ${versionNumber}`, submission, version });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// teachers + students view all submissions for a project
const getSubmissions = async (req, res) => {
  try {
    const submissions = await getSubmissionsByProject(req.params.id);
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// view all versions (V1, V2, V3...) of a submission
const getSubmissionVersions = async (req, res) => {
  try {
    const versions = await getVersions(req.params.subId);
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadSubmission, getSubmissions, getSubmissionVersions };