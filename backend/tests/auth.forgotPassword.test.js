// ── tests/auth.forgotPassword.test.js ────────────────────────────────────
// Tests for  POST /api/users/forgot-password
//        and POST /api/users/reset-password

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock("../models/userModel", () => ({
  findUserByEmail: jest.fn(),
  updatePassword: jest.fn(),
}));

jest.mock("../models/passwordResetModel", () => ({
  upsertPasswordReset: jest.fn(),
  findPasswordResetByEmail: jest.fn(),
  deletePasswordResetByEmail: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("../services/emailService", () => ({
  sendPasswordResetOtpEmail: jest.fn(),
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcrypt");
const { findUserByEmail, updatePassword } = require("../models/userModel");
const {
  findPasswordResetByEmail,
} = require("../models/passwordResetModel");
const { sendPasswordResetOtpEmail } = require("../services/emailService");

// ── Step 3: Suite — forgot-password ───────────────────────────────────────
describe("POST /api/users/forgot-password", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if email is missing", async () => {
    const res = await request(app).post("/api/users/forgot-password").send({});
    expect(res.statusCode).toBe(400);
  });

  test("should return 404 if no account exists for that email", async () => {
    findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "nobody@example.com" });

    expect(res.statusCode).toBe(404);
  });

  test("should return 200 and send the reset OTP on success", async () => {
    findUserByEmail.mockResolvedValue({ full_name: "John", email: "john@example.com" });
    sendPasswordResetOtpEmail.mockResolvedValue({});

    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "john@example.com" });

    expect(res.statusCode).toBe(200);
    expect(sendPasswordResetOtpEmail).toHaveBeenCalledTimes(1);
  });
});

// ── Suite — reset-password ────────────────────────────────────────────────
describe("POST /api/users/reset-password", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if fields are missing", async () => {
    const res = await request(app)
      .post("/api/users/reset-password")
      .send({ email: "john@example.com" });
    expect(res.statusCode).toBe(400);
  });

  test("should return 400 if no reset request exists", async () => {
    findPasswordResetByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/reset-password")
      .send({ email: "john@example.com", otp: "123456", newPassword: "newpass1" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("No password reset request found for this email");
  });

  test("should return 400 if the OTP does not match", async () => {
    findPasswordResetByEmail.mockResolvedValue({
      otp_code: "999999",
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
    });

    const res = await request(app)
      .post("/api/users/reset-password")
      .send({ email: "john@example.com", otp: "123456", newPassword: "newpass1" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid OTP");
  });

  test("should return 200 and reset the password on success", async () => {
    findPasswordResetByEmail.mockResolvedValue({
      otp_code: "123456",
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
    });
    bcrypt.hash.mockResolvedValue("newHashedPassword");
    updatePassword.mockResolvedValue({ user_id: 1, email: "john@example.com" });

    const res = await request(app)
      .post("/api/users/reset-password")
      .send({ email: "john@example.com", otp: "123456", newPassword: "newpass1" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password reset successfully. You can now log in.");
  });
});
