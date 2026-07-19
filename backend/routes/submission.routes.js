const express = require('express');
const router = express.Router();

const { uploadSubmission, getSubmissions, getSubmissionVersions } = require('../controllers/submission.controller');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const upload = require('../config/multer');

// student uploads a file (the form field must be named "file")
router.post('/projects/:id/submissions', protect, authorize('student'), upload.single('file'), uploadSubmission);

// anyone logged in (incl. teachers) views a project's submissions
router.get('/projects/:id/submissions', protect, getSubmissions);

// view all versions of a submission
router.get('/submissions/:subId/versions', protect, getSubmissionVersions);

module.exports = router;