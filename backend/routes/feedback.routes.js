const express = require('express');
const router = express.Router();

const { giveFeedback, getFeedback } = require('../controllers/feedback.controller');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

router.post('/submissions/:subId/feedback', protect, authorize('guide'), giveFeedback);
router.get('/submissions/:subId/feedback', protect, getFeedback);

module.exports = router;