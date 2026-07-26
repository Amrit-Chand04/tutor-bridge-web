// ── tests/auth.verifyOtp.test.js
// Tests for  POST /api/users/verify-otp

// ── Step 1: Mocks BEFORE imports
jest.mock("../models/userModel", () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock("../models/otpModel", () => ({
  findPendingByEmail: jest.fn(),
  deletePendingByEmail: jest.fn(),
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports 
const request = require("supertest");
const app = require("../server");
const { findUserByEmail, createUser } = require("../models/userModel");
const { findPendingByEmail, deletePendingByEmail } = require("../models/otpModel");

// ── Step 3: Suite
describe("POST /api/users/verify-otp", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if email or otp is missing", async () => {
    const res = await request(app).post("/api/users/verify-otp").send({ email: "john@example.com" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email and OTP are required");
  });

  test("should return 400 if no pending registration exists", async () => {
    findPendingByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/verify-otp")
      .send({ email: "john@example.com", otp: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("No pending registration found for this email");
  });

  test("should return 400 if the OTP has expired", async () => {
    findPendingByEmail.mockResolvedValue({
      full_name: "John",
      email: "john@example.com",
      password: "hashed",
      role: "student",
      otp_code: "123456",
      expires_at: new Date(Date.now() - 60 * 1000).toISOString(),
    });

    const res = await request(app)
      .post("/api/users/verify-otp")
      .send({ email: "john@example.com", otp: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("OTP expired. Please register again.");
  });

  test("should return 400 if the OTP does not match", async () => {
    findPendingByEmail.mockResolvedValue({
      full_name: "John",
      email: "john@example.com",
      password: "hashed",
      role: "student",
      otp_code: "123456",
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
    });

    const res = await request(app)
      .post("/api/users/verify-otp")
      .send({ email: "john@example.com", otp: "000000" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid OTP");
  });

  test("should return 201 and create the user on success", async () => {
    findPendingByEmail.mockResolvedValue({
      full_name: "John",
      email: "john@example.com",
      password: "hashed",
      role: "student",
      otp_code: "123456",
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
    });
    findUserByEmail.mockResolvedValue(null);
    createUser.mockResolvedValue({ user_id: 1, full_name: "John", email: "john@example.com", role: "student" });
    deletePendingByEmail.mockResolvedValue({});

    const res = await request(app)
      .post("/api/users/verify-otp")
      .send({ email: "john@example.com", otp: "123456" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Registered successfully");
    expect(res.body.user.email).toBe("john@example.com");
  });
});
