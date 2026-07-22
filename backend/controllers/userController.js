const bcrypt = require("bcrypt");
const { findUserByEmail, createUser } = require("../models/userModel");
const {
  upsertPendingRegistration,
  findPendingByEmail,
  deletePendingByEmail,
} = require("../models/otpModel");
const { sendOtpEmail } = require("../services/emailService");

const ALLOWED_ROLES = ["student", "tutor"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MINUTES = 10;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

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
    const { email, otp } = req.body;

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
      await deletePendingByEmail(req.body.email);
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

module.exports = {
  registerUser,
  verifyOtp,
};
