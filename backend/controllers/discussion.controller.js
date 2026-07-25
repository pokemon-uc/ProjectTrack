const {
  getProjectAccess,
  getThreadAccess,
  createThread,
  getThreadsByProject,
  addReply,
  getReplies,
} = require("../models/discussion.model");

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

const startThread = async (req, res) => {
  try {
    const projectId = positiveId(req.params.id);
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";

    if (!projectId)
      return res.status(400).json({ error: "Invalid project ID" });
    if (!title || title.length > 200) {
      return res
        .status(400)
        .json({ error: "Thread title must be 1 to 200 characters" });
    }

    const project = await getProjectAccess(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ error: "You cannot access this project" });
    }

    const thread = await createThread(projectId, title, req.user.id);
    return res.status(201).json({ message: "Thread created", thread });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Unable to create discussion thread" });
  }
};

const getThreads = async (req, res) => {
  try {
    const projectId = positiveId(req.params.id);
    if (!projectId)
      return res.status(400).json({ error: "Invalid project ID" });

    const project = await getProjectAccess(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ error: "You cannot access this project" });
    }

    const threads = await getThreadsByProject(projectId);
    return res.json({ threads });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load discussion threads" });
  }
};

const postReply = async (req, res) => {
  try {
    const threadId = positiveId(req.params.tid);
    const message =
      typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!threadId) return res.status(400).json({ error: "Invalid thread ID" });
    if (!message || message.length > 5000) {
      return res
        .status(400)
        .json({ error: "Reply must be 1 to 5000 characters" });
    }

    const thread = await getThreadAccess(threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    if (!canAccessProject(thread, req.user)) {
      return res
        .status(403)
        .json({ error: "You cannot access this discussion" });
    }

    const reply = await addReply(threadId, req.user.id, message);
    return res.status(201).json({ message: "Reply added", reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to add discussion reply" });
  }
};

const getThreadReplies = async (req, res) => {
  try {
    const threadId = positiveId(req.params.tid);
    if (!threadId) return res.status(400).json({ error: "Invalid thread ID" });

    const thread = await getThreadAccess(threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    if (!canAccessProject(thread, req.user)) {
      return res
        .status(403)
        .json({ error: "You cannot access this discussion" });
    }

    const replies = await getReplies(threadId);
    return res.json({ replies });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load discussion replies" });
  }
};

module.exports = { startThread, getThreads, postReply, getThreadReplies };
