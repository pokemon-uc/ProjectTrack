const express = require('express');
const router = express.Router();

const { getDashboard } = require('../controllers/analytics.controller');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

// only coordinators can see the dashboard
router.get('/analytics/dashboard', protect, authorize('coordinator'), getDashboard);

module.exports = router;