const express = require('express');
const router = express.Router();

const { startThread, getThreads, postReply, getThreadReplies } = require('../controllers/discussion.controller');
const protect = require('../middleware/auth');

router.post('/projects/:id/threads', protect, startThread);       // start a thread
router.get('/projects/:id/threads', protect, getThreads);         // list threads
router.post('/threads/:tid/replies', protect, postReply);         // reply in a thread
router.get('/threads/:tid/replies', protect, getThreadReplies);   // read a thread

module.exports = router;