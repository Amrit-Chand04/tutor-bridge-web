// ── tests/tuitionRequest.test.js 
// Tests for  POST   /api/tuition-requests/       (student)
//        GET     /api/tuition-requests/       (tutor)
//        GET     /api/tuition-requests/my     (student)
//        DELETE  /api/tuition-requests/:id    (student)

// ── Step 1: Mocks BEFORE imports 
jest.mock("../models/tuitionRequestModel", () => ({
  createTuitionRequest: jest.fn(),
  getOpenTuitionRequests: jest.fn(),
  getRequestsByUser: jest.fn(),
  getRequestById: jest.fn(),
  deleteTuitionRequest: jest.fn(),
}));

jest.mock("../models/notificationModel", () => ({
  createNotificationsForRole: jest.fn(),
}));

jest.mock("../services/socketService", () => ({
  init: jest.fn(),
  emitToUser: jest.fn(),
  emitToRole: jest.fn(),
}));

// jwt.verify decodes based on the fake token used in each request
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token) =>
    token === "tutor_token"
      ? { user_id: 5, email: "tutor@example.com", role: "tutor" }
      : { user_id: 1, email: "student@example.com", role: "student" },
  ),
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports
const request = require("supertest");
const app = require("../server");
const {
  createTuitionRequest,
  getOpenTuitionRequests,
  getRequestsByUser,
  getRequestById,
  deleteTuitionRequest,
} = require("../models/tuitionRequestModel");
const { createNotificationsForRole } = require("../models/notificationModel");

const STUDENT_AUTH = "Bearer student_token";
const TUTOR_AUTH = "Bearer tutor_token";

const validRequest = {
  subject: "Math",
  location: "Kathmandu",
  classLevel: "Grade 10",
  budget: 2000,
  contactNumber: "9800000000",
  description: "Need help with algebra",
};

// ── Step 3: Suite — POST / 
describe("POST /api/tuition-requests/", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/tuition-requests/")
      .set("Authorization", STUDENT_AUTH)
      .send({ subject: "Math" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 400 for an invalid budget", async () => {
    const res = await request(app)
      .post("/api/tuition-requests/")
      .set("Authorization", STUDENT_AUTH)
      .send({ ...validRequest, budget: -100 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Budget must be a valid positive number");
  });

  test("should return 400 for a non-numeric contact number", async () => {
    const res = await request(app)
      .post("/api/tuition-requests/")
      .set("Authorization", STUDENT_AUTH)
      .send({ ...validRequest, contactNumber: "98-000-000" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Contact number must contain digits only");
  });

  test("should return 201 and create the tuition request on success", async () => {
    createTuitionRequest.mockResolvedValue({ id: 1, ...validRequest });
    createNotificationsForRole.mockResolvedValue([]);

    const res = await request(app)
      .post("/api/tuition-requests/")
      .set("Authorization", STUDENT_AUTH)
      .send(validRequest);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Tuition request created successfully");
  });
});

// ── Suite — GET / (tutor) 
describe("GET /api/tuition-requests/", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 200 and open requests for a tutor", async () => {
    getOpenTuitionRequests.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const res = await request(app).get("/api/tuition-requests/").set("Authorization", TUTOR_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.requests).toHaveLength(2);
  });
});

// ── Suite — DELETE /:id 
describe("DELETE /api/tuition-requests/:id", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 404 if the request does not belong to this student", async () => {
    getRequestById.mockResolvedValue({ user_id: 999, status: "open" });

    const res = await request(app).delete("/api/tuition-requests/1").set("Authorization", STUDENT_AUTH);

    expect(res.statusCode).toBe(404);
  });

  test("should return 400 if the request already has a booked tutor", async () => {
    getRequestById.mockResolvedValue({ user_id: 1, status: "booked" });

    const res = await request(app).delete("/api/tuition-requests/1").set("Authorization", STUDENT_AUTH);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Cannot delete a request that already has a booked tutor");
  });

  test("should return 200 and delete the request on success", async () => {
    getRequestById.mockResolvedValue({ user_id: 1, status: "open" });
    deleteTuitionRequest.mockResolvedValue({});

    const res = await request(app).delete("/api/tuition-requests/1").set("Authorization", STUDENT_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Tuition request deleted");
  });
});
