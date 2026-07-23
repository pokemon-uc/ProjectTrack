const express = require("express");
const router = express.Router();

const { gradeProject, getGrade } = require("../controllers/grade.controller");
const protect = require("../middleware/auth");
const authorize = require("../middleware/roles");

router.post(
  "/projects/:id/grade",
  protect,
  authorize("coordinator"),
  gradeProject,
);
router.get("/projects/:id/grade", protect, getGrade);

module.exports = router;
