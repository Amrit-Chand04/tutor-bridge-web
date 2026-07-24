const express = require("express");
const router = express.Router();
const { createRequest, getRequests, getMyRequests, deleteRequest } = require("../controllers/tuitionRequestController");
const {
  applyToRequest,
  listMyApplications,
  listApplicationsForRequest,
  acceptTutorApplication,
  rejectTutorApplication,
} = require("../controllers/tuitionApplicationController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/", protect, restrictTo("student"), createRequest);
router.get("/", protect, restrictTo("tutor"), getRequests);
router.get("/my", protect, restrictTo("student"), getMyRequests);
router.get("/my-applications", protect, restrictTo("tutor"), listMyApplications);

router.post("/:id/apply", protect, restrictTo("tutor"), applyToRequest);
router.get("/:id/applications", protect, restrictTo("student"), listApplicationsForRequest);
router.put("/applications/:appId/accept", protect, restrictTo("student"), acceptTutorApplication);
router.put("/applications/:appId/reject", protect, restrictTo("student"), rejectTutorApplication);
router.delete("/:id", protect, restrictTo("student"), deleteRequest);

module.exports = router;
