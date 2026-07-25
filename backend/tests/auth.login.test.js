// ── tests/auth.login.test.js ─────────────────────────────────────────────
// Tests for  POST /api/users/login

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock("../models/userModel", () => ({
  findUserByEmail: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail } = require("../models/userModel");

const activeUser = {
  user_id: 1,
  full_name: "John",
  email: "john@example.com",
  password: "hashedPassword",
  role: "student",
  status: "active",
};

// ── Step 3: Suite ─────────────────────────────────────────────────────────
describe("POST /api/users/login", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if email or password is missing", async () => {
    const res = await request(app).post("/api/users/login").send({ email: "john@example.com" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email and password are required");
  });

  test("should return 401 if user is not found", async () => {
    findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "nobody@example.com", password: "secret123" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  test("should return 401 if password is incorrect", async () => {
    findUserByEmail.mockResolvedValue(activeUser);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "john@example.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  test("should return 403 if the account is not active", async () => {
    findUserByEmail.mockResolvedValue({ ...activeUser, status: "pending" });
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "john@example.com", password: "secret123" });

    expect(res.statusCode).toBe(403);
  });

  test("should return 200 and a token on successful login", async () => {
    findUserByEmail.mockResolvedValue(activeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fakeToken123");

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "john@example.com", password: "secret123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.token).toBe("fakeToken123");
    expect(res.body.user.password).toBeUndefined();
  });

  test("should return 500 if the database fails", async () => {
    findUserByEmail.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "john@example.com", password: "secret123" });

    expect(res.statusCode).toBe(500);
  });
});
