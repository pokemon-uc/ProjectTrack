const fs = require("fs/promises");
const path = require("path");
const {
  findSubmission,
  createSubmission,
  updateSubmissionVersion,
  addVersion,
  getSubmissionsByProject,
  getSubmissionWithProject,
  getVersions,
  getVersionWithProject,
  milestoneBelongsToProject,
} = require("../models/submission.model");
const { getProjectById } = require("../models/project.model");

const allowedTypes = new Set(["proposal", "milestone", "final_report"]);
const uploadsRoot = path.resolve(__dirname, "..", "uploads");

const canAccessProject = (project, user) => {
  if (user.role === "coordinator") return true;
  if (user.role === "student") return project.student_id === user.id;
  if (user.role === "guide") return project.guide_id === user.id;
  return false;
};

const removeUploadedFile = async (file) => {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch {
    // Ignore cleanup failures; the original request error is more useful.
  }
};

const uploadSubmission = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const projectId = Number(req.params.id);
    const type = req.body.type;
    const notes = req.body.notes?.trim() || null;
    const milestoneId = req.body.milestone_id
      ? Number(req.body.milestone_id)
      : null;

    if (!projectId || !allowedTypes.has(type)) {
      await removeUploadedFile(req.file);
      return res
        .status(400)
        .json({ error: "Invalid project or submission type" });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      await removeUploadedFile(req.file);
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.student_id !== req.user.id) {
      await removeUploadedFile(req.file);
      return res.status(403).json({ error: "Not your project" });
    }

    if (type === "milestone") {
      if (!milestoneId) {
        await removeUploadedFile(req.file);
        return res.status(400).json({ error: "milestone_id is required" });
      }
      const validMilestone = await milestoneBelongsToProject(
        milestoneId,
        projectId,
      );
      if (!validMilestone) {
        await removeUploadedFile(req.file);
        return res.status(400).json({ error: "Invalid milestone" });
      }
    }

    const submissionMilestoneId = type === "milestone" ? milestoneId : null;
    let submission = await findSubmission(
      projectId,
      type,
      submissionMilestoneId,
    );
    let versionNumber;

    if (!submission) {
      submission = await createSubmission(
        projectId,
        submissionMilestoneId,
        type,
      );
      versionNumber = 1;
    } else {
      versionNumber = Number(submission.current_version) + 1;
      submission = await updateSubmissionVersion(submission.id, versionNumber);
    }

    const version = await addVersion(
      submission.id,
      versionNumber,
      req.file.path,
      notes,
      req.user.id,
    );

    const safeVersion = {
      id: version.id,
      submission_id: version.submission_id,
      version_number: version.version_number,
      notes: version.notes,
      uploaded_at: version.uploaded_at,
      has_file: true,
    };

    res.status(201).json({
      message: `File uploaded as version ${versionNumber}`,
      submission,
      version: safeVersion,
    });
  } catch (err) {
    await removeUploadedFile(req.file);
    console.error(err);
    res.status(500).json({ error: "Unable to upload submission" });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ error: "You cannot access this project" });
    }

    const submissions = await getSubmissionsByProject(project.id);
    res.json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to load submissions" });
  }
};

const getSubmissionVersions = async (req, res) => {
  try {
    const submission = await getSubmissionWithProject(req.params.subId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    if (!canAccessProject(submission, req.user)) {
      return res
        .status(403)
        .json({ error: "You cannot access this submission" });
    }

    const versions = await getVersions(submission.id);
    res.json({ versions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to load submission versions" });
  }
};

const downloadSubmissionVersion = async (req, res) => {
  try {
    const version = await getVersionWithProject(req.params.versionId);
    if (!version) {
      return res.status(404).json({ error: "Submission version not found" });
    }
    if (!canAccessProject(version, req.user)) {
      return res.status(403).json({ error: "You cannot download this file" });
    }

    const storedPath = path.resolve(version.file_path);
    const insideUploads =
      storedPath === uploadsRoot ||
      storedPath.startsWith(`${uploadsRoot}${path.sep}`);
    if (!insideUploads) {
      return res.status(403).json({ error: "Invalid file location" });
    }

    try {
      await fs.access(storedPath);
    } catch {
      return res.status(404).json({ error: "File not found" });
    }

    const extension = path.extname(storedPath).toLowerCase();
    const projectName = version.project_title
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    const typeName = version.type.replace(/_/g, "-");
    const downloadName = `${projectName || "project"}-${typeName}-v${version.version_number}${extension}`;

    return res.download(storedPath, downloadName);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to download file" });
  }
};

module.exports = {
  uploadSubmission,
  getSubmissions,
  getSubmissionVersions,
  downloadSubmissionVersion,
};
