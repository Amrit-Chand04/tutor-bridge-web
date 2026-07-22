const express = require("express");
const router = express.Router();
const { registerUser, verifyOtp } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);

module.exports = router;
