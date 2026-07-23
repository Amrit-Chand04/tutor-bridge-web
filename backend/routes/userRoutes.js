const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyOtp,
  loginUser,
  getCurrentUser,
  getUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUserProfile,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { uploadProfilePhoto } = require("../middleware/upload");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);
router.put("/profile", protect, uploadProfilePhoto, updateUserProfile);
router.get("/", protect, restrictTo("admin"), getUsers);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

module.exports = router;
