// ── tests/auth.register.test.js
// Tests for  POST /api/users/register

// ── Step 1: Mocks BEFORE imports
jest.mock("../models/userModel", () => ({
  findUserByEmail: jest.fn(),
}));

jest.mock("../models/otpModel", () => ({
  upsertPendingRegistration: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("../services/emailService", () => ({
  sendOtpEmail: jest.fn(),
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports
const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../models/userModel");
const { upsertPendingRegistration } = require("../models/otpModel");
const { sendOtpEmail } = require("../services/emailService");

const validBody = {
  full_name: "John Doe",
  email: "john@example.com",
  password: "secret123",
  role: "student",
};

// ── Step 3: Suite 
describe("POST /api/users/register", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/users/register").send({
      email: "john@example.com",
      password: "secret123",
      role: "student",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  test("should return 400 for an invalid email", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validBody, email: "not-an-email" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Enter a valid email");
  });

  test("should return 400 if password is shorter than 6 characters", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validBody, password: "123" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Password must be at least 6 characters");
  });

  test("should return 400 for an invalid role", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validBody, role: "admin" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Role must be either student or tutor");
  });

  test("should return 409 if email is already registered", async () => {
    findUserByEmail.mockResolvedValue({ user_id: 1, email: "john@example.com" });

    const res = await request(app).post("/api/users/register").send(validBody);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Email is already registered");
  });

  test("should return 502 if the OTP email fails to send", async () => {
    findUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed_password");
    upsertPendingRegistration.mockResolvedValue({});
    sendOtpEmail.mockRejectedValue(new Error("SMTP down"));

    const res = await request(app).post("/api/users/register").send(validBody);

    expect(res.statusCode).toBe(502);
  });

  test("should return 200 and send OTP on success", async () => {
    findUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed_password");
    upsertPendingRegistration.mockResolvedValue({});
    sendOtpEmail.mockResolvedValue({});

    const res = await request(app).post("/api/users/register").send(validBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("john@example.com");
  });
});
