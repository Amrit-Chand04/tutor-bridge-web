const express = require("express");
const router = express.Router();
const { getMyNotifications, readAllNotifications } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyNotifications);
router.put("/read-all", protect, readAllNotifications);

module.exports = router;
