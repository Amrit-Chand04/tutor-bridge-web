const express = require("express");
const router = express.Router();
const { getMessages, sendMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/with/:otherUserId", protect, getMessages);
router.post("/with/:otherUserId", protect, sendMessage);

module.exports = router;
