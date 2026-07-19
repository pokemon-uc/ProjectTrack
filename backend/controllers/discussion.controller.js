const { createThread, getThreadsByProject, addReply, getReplies } = require('../models/discussion.model');

const startThread = async (req, res) => {
  try {
    const { title } = req.body;
    const thread = await createThread(req.params.id, title, req.user.id);
    res.status(201).json({ message: 'Thread created', thread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getThreads = async (req, res) => {
  try {
    const threads = await getThreadsByProject(req.params.id);
    res.json({ threads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const postReply = async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await addReply(req.params.tid, req.user.id, message);
    res.status(201).json({ message: 'Reply added', reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getThreadReplies = async (req, res) => {
  try {
    const replies = await getReplies(req.params.tid);
    res.json({ replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { startThread, getThreads, postReply, getThreadReplies };