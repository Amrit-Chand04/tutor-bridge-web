// ── tests/users.admin.test.js ────────────────────────────────────────────
// Tests for  GET /api/users        (admin only)
//        and DELETE /api/users/:id (admin only)

// ── Step 1: Mocks BEFORE imports ─────────────────────────────────────────
jest.mock("../models/userModel", () => ({
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  deleteUserById: jest.fn(),
}));

// jwt.verify is mocked so `protect` always decodes to an admin user
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({ user_id: 1, email: "admin@example.com", role: "admin" })),
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports ───────────────────────────────────────────────────────
const request = require("supertest");
const app = require("../server");
const { getAllUsers, getUserById, deleteUserById } = require("../models/userModel");

const ADMIN_AUTH = "Bearer admin_token";

// ── Step 3: Suite — GET /api/users ────────────────────────────────────────
describe("GET /api/users", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 401 without a token", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(401);
  });

  test("should return 200 and the user list for an admin", async () => {
    getAllUsers.mockResolvedValue([
      { user_id: 1, full_name: "John", email: "john@example.com" },
      { user_id: 2, full_name: "Jane", email: "jane@example.com" },
    ]);

    const res = await request(app).get("/api/users").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.users).toHaveLength(2);
  });

  test("should return 500 if the database fails", async () => {
    getAllUsers.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/users").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(500);
  });
});

// ── Suite — DELETE /api/users/:id ─────────────────────────────────────────
describe("DELETE /api/users/:id", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 404 if the target user does not exist", async () => {
    getUserById.mockResolvedValue(null);

    const res = await request(app).delete("/api/users/999").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  test("should return 403 when trying to delete an admin account", async () => {
    getUserById.mockResolvedValue({ user_id: 2, role: "admin" });

    const res = await request(app).delete("/api/users/2").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Admin accounts cannot be deleted");
  });

  test("should return 200 and delete the user successfully", async () => {
    getUserById.mockResolvedValue({ user_id: 3, role: "student" });
    deleteUserById.mockResolvedValue({});

    const res = await request(app).delete("/api/users/3").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
    expect(deleteUserById).toHaveBeenCalledWith("3");
  });
});
