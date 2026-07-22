const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail, createUser, updatePassword } = require("../models/userModel");
const {
  upsertPendingRegistration,
  findPendingByEmail,
  deletePendingByEmail,
} = require("../models/otpModel");
const {
  upsertPasswordReset,
  findPasswordResetByEmail,
  deletePasswordResetByEmail,
} = require("../models/passwordResetModel");
const { sendOtpEmail, sendPasswordResetOtpEmail } = require("../services/emailService");

const ALLOWED_ROLES = ["student", "tutor"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MINUTES = 10;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (req, res) => {
  try {
    const { full_name, password, role } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Role must be either student or tutor",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await upsertPendingRegistration(
      full_name,
      email,
      hashedPassword,
      role,
      otp,
      expiresAt,
    );

    try {
      await sendOtpEmail(email, full_name, otp);
    } catch (emailError) {
      console.error(`[registerUser] OTP saved for ${email} but email send failed:`, emailError.message);
      return res.status(502).json({
        message: "OTP generated but the email could not be sent. Please try again in a moment.",
      });
    }

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      email,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const pending = await findPendingByEmail(email);
    if (!pending) {
      return res.status(400).json({
        message: "No pending registration found for this email",
      });
    }

    if (new Date(pending.expires_at) < new Date()) {
      await deletePendingByEmail(email);
      return res.status(400).json({
        message: "OTP expired. Please register again.",
      });
    }

    if (pending.otp_code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      await deletePendingByEmail(email);
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const user = await createUser(
      pending.full_name,
      pending.email,
      pending.password,
      pending.role,
    );
    await deletePendingByEmail(email);

    res.status(201).json({
      message: "Registered successfully",
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      await deletePendingByEmail(req.body.email?.trim().toLowerCase());
      return res.status(409).json({
        message: "Email is already registered",
      });
    }
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is not active. Please contact support.",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const { password: _password, ...safeUser } = user;

    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { password: _password, ...safeUser } = user;
    res.status(200).json({
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(user.email, hashedPassword);

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await upsertPasswordReset(email, otp, expiresAt);

    try {
      await sendPasswordResetOtpEmail(email, user.full_name, otp);
    } catch (emailError) {
      console.error(`[forgotPassword] OTP saved for ${email} but email send failed:`, emailError.message);
      return res.status(502).json({
        message: "OTP generated but the email could not be sent. Please try again in a moment.",
      });
    }

    res.status(200).json({
      message: "OTP sent to your email. Please verify to reset your password.",
      email,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process forgot password request",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const pending = await findPasswordResetByEmail(email);
    if (!pending) {
      return res.status(400).json({
        message: "No password reset request found for this email",
      });
    }

    if (new Date(pending.expires_at) < new Date()) {
      await deletePasswordResetByEmail(email);
      return res.status(400).json({
        message: "OTP expired. Please request a new one.",
      });
    }

    if (pending.otp_code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await updatePassword(email, hashedPassword);
    await deletePasswordResetByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    res.status(200).json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Password reset failed",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
};
