const express = require("express");
const router = express.Router();

const {
  addMilestone,
  getMilestones,
  submitMilestone,
  reviewMilestone,
  getProjectProgress,
} = require("../controllers/milestone.controller");
const protect = require("../middleware/auth");
const authorize = require("../middleware/roles");

router.post(
  "/projects/:id/milestones",
  protect,
  authorize("guide", "coordinator"),
  addMilestone,
);
router.get("/projects/:id/milestones", protect, getMilestones);
router.put(
  "/milestones/:mid/submit",
  protect,
  authorize("student"),
  submitMilestone,
);
router.put(
  "/milestones/:mid/review",
  protect,
  authorize("guide", "coordinator"),
  reviewMilestone,
);
router.get("/projects/:id/completion", protect, getProjectProgress);

module.exports = router;
