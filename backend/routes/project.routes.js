const express = require('express');
const router = express.Router();

const {
  addProject,
  getMyProjects,
  getProject,
  submitProject,
  viewStatusHistory,
} = require('../controllers/project.controller');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

router.post('/', protect, authorize('student'), addProject);      // create (students only)
router.get('/mine', protect, getMyProjects);                      // my projects
router.get('/:id', protect, getProject);                          // one project
router.put('/:id/submit', protect, authorize('student'), submitProject); // submit
router.get('/:id/status-history', protect, viewStatusHistory);    // audit trail

module.exports = router;