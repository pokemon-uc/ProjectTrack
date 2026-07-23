const express = require("express");
const router = express.Router();

const {
  uploadSubmission,
  getSubmissions,
  getSubmissionVersions,
  downloadSubmissionVersion,
} = require("../controllers/submission.controller");
const protect = require("../middleware/auth");
const authorize = require("../middleware/roles");
const upload = require("../config/multer");

router.post(
  "/projects/:id/submissions",
  protect,
  authorize("student"),
  upload.single("file"),
  uploadSubmission,
);
router.get("/projects/:id/submissions", protect, getSubmissions);
router.get("/submissions/:subId/versions", protect, getSubmissionVersions);
router.get(
  "/submission-versions/:versionId/download",
  protect,
  downloadSubmissionVersion,
);

module.exports = router;
