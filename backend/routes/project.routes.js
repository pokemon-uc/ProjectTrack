const express = require("express");
const router = express.Router();

const {
  addProject,
  getMyProjects,
  getAssignedProjects,
  getCoordinatorProjects,
  listGuides,
  getProject,
  assignGuide,
  submitProject,
  viewStatusHistory,
} = require("../controllers/project.controller");
const protect = require("../middleware/auth");
const authorize = require("../middleware/roles");

router.post("/", protect, authorize("student"), addProject);
router.get("/mine", protect, authorize("student"), getMyProjects);
router.get("/assigned", protect, authorize("guide"), getAssignedProjects);
router.get("/all", protect, authorize("coordinator"), getCoordinatorProjects);
router.get("/guides", protect, authorize("coordinator"), listGuides);
router.put("/:id/assign-guide", protect, authorize("coordinator"), assignGuide);
router.put("/:id/submit", protect, authorize("student"), submitProject);
router.get("/:id/status-history", protect, viewStatusHistory);
router.get("/:id", protect, getProject);

module.exports = router;
