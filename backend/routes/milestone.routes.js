const express = require('express');
const router = express.Router();

const { addMilestone, getMilestones, markComplete, getProjectProgress } = require('../controllers/milestone.controller');
const protect = require('../middleware/auth');

router.post('/projects/:id/milestones', protect, addMilestone);      // add a milestone
router.get('/projects/:id/milestones', protect, getMilestones);      // list milestones
router.put('/milestones/:mid/complete', protect, markComplete);      // mark one complete
router.get('/projects/:id/completion', protect, getProjectProgress); // completion %

module.exports = router;