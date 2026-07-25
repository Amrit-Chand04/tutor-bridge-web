// ── tests/users.profile.test.js ──────────────────────────────────────────
// Tests for  GET /api/users/me
//        and PUT /api/users/profile
//        and POST /api/users/change-password

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock("../models/userModel", () => ({
  findUserByEmail: jest.fn(),
  updateProfile: jest.fn(),
  updatePassword: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// jwt.verify is mocked so `protect` always decodes to the same logged-in user
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({ user_id: 1, email: "john@example.com", role: "student" })),
}));

// Multer upload middleware — skip real file handling.
// server.js also loads tutorProfileRoutes.js which needs uploadCv from the
// same module, so both functions must be mocked here even though this file
// only exercises uploadProfilePhoto.
jest.mock("../middleware/upload", () => ({
  uploadProfilePhoto: (req, res, next) => {
    req.file = null;
    next();
  },
  uploadCv: (req, res, next) => {
    req.file = null;
    next();
  },
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcrypt");
const { findUserByEmail, updateProfile, updatePassword } = require("../models/userModel");

const AUTH = "Bearer usertoken";

// ── Step 3: Suite — GET /api/users/me ─────────────────────────────────────
describe("GET /api/users/me", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 200 and the current user", async () => {
    findUserByEmail.mockResolvedValue({
      user_id: 1, full_name: "John", email: "john@example.com", password: "hashed",
    });

    const res = await request(app).get("/api/users/me").set("Authorization", AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("john@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  test("should return 404 if the user no longer exists", async () => {
    findUserByEmail.mockResolvedValue(null);

    const res = await request(app).get("/api/users/me").set("Authorization", AUTH);

    expect(res.statusCode).toBe(404);
  });
});

// ── Suite — PUT /api/users/profile ─────────────────────────────────────────
describe("PUT /api/users/profile", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if full_name is missing", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", AUTH)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Full name is required");
  });

  test("should return 200 and update the profile", async () => {
    updateProfile.mockResolvedValue({ user_id: 1, full_name: "John Updated" });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", AUTH)
      .send({ full_name: "John Updated" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");
    expect(res.body.user.full_name).toBe("John Updated");
  });
});

// ── Suite — POST /api/users/change-password ────────────────────────────────
describe("POST /api/users/change-password", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if fields are missing", async () => {
    const res = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", AUTH)
      .send({ currentPassword: "old12345" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 401 if the current password is wrong", async () => {
    findUserByEmail.mockResolvedValue({ email: "john@example.com", password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", AUTH)
      .send({ currentPassword: "wrongpass", newPassword: "newpass1" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Current password is incorrect");
  });

  test("should return 200 on successful password change", async () => {
    findUserByEmail.mockResolvedValue({ email: "john@example.com", password: "hashed" });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("newHashed");
    updatePassword.mockResolvedValue({});

    const res = await request(app)
      .post("/api/users/change-password")
      .set("Authorization", AUTH)
      .send({ currentPassword: "old12345", newPassword: "newpass1" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password changed successfully");
  });
});
