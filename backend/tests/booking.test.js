// ── tests/booking.test.js 
// Tests for  GET  /api/bookings/my        (student)
//        GET     /api/bookings/tutor/my   (tutor)
//        GET     /api/bookings/           (admin)
//        PUT     /api/bookings/:id/accept (admin)
//        PUT     /api/bookings/:id/reject (admin)

// ── Step 1: Mocks BEFORE imports 
jest.mock("../models/bookingModel", () => ({
  getBookingsByStudent: jest.fn(),
  getBookingsByTutor: jest.fn(),
  getAllBookings: jest.fn(),
  getBookingById: jest.fn(),
  acceptBooking: jest.fn(),
  rejectBooking: jest.fn(),
}));

jest.mock("../models/notificationModel", () => ({
  createNotification: jest.fn(),
}));

jest.mock("../services/socketService", () => ({
  init: jest.fn(),
  emitToUser: jest.fn(),
  emitToRole: jest.fn(),
}));

// jwt.verify decodes based on the fake token used in each request
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token) => {
    if (token === "tutor_token") return { user_id: 5, role: "tutor" };
    if (token === "admin_token") return { user_id: 99, role: "admin" };
    return { user_id: 1, role: "student" };
  }),
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports
const request = require("supertest");
const app = require("../server");
const {
  getBookingsByStudent,
  getBookingsByTutor,
  getAllBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
} = require("../models/bookingModel");

const STUDENT_AUTH = "Bearer student_token";
const TUTOR_AUTH = "Bearer tutor_token";
const ADMIN_AUTH = "Bearer admin_token";

// ── Step 3: Suite — GET /my (student) 
describe("GET /api/bookings/my", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 200 and the student's bookings", async () => {
    getBookingsByStudent.mockResolvedValue([{ id: 1 }]);

    const res = await request(app).get("/api/bookings/my").set("Authorization", STUDENT_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.bookings).toHaveLength(1);
  });
});

// ── Suite — GET /tutor/my (tutor)
describe("GET /api/bookings/tutor/my", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 200 and the tutor's bookings", async () => {
    getBookingsByTutor.mockResolvedValue([{ id: 2 }]);

    const res = await request(app).get("/api/bookings/tutor/my").set("Authorization", TUTOR_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.bookings).toHaveLength(1);
  });
});

// ── Suite — GET / (admin) 
describe("GET /api/bookings/", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 200 and all bookings for an admin", async () => {
    getAllBookings.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const res = await request(app).get("/api/bookings/").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.bookings).toHaveLength(2);
  });
});

// ── Suite — PUT /:id/accept (admin) =
describe("PUT /api/bookings/:id/accept", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 404 if the booking does not exist", async () => {
    getBookingById.mockResolvedValue(null);

    const res = await request(app).put("/api/bookings/999/accept").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(404);
  });

  test("should return 400 if the booking is already decided", async () => {
    getBookingById.mockResolvedValue({ id: 1, status: "accepted" });

    const res = await request(app).put("/api/bookings/1/accept").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("This booking has already been decided");
  });

  test("should return 200 and accept the booking", async () => {
    getBookingById.mockResolvedValue({ id: 1, status: "pending", student_id: 1, tutor_id: 5 });
    acceptBooking.mockResolvedValue({ id: 1, status: "accepted" });

    const res = await request(app).put("/api/bookings/1/accept").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Booking accepted");
  });
});

// ── Suite — PUT /:id/reject (admin) 
describe("PUT /api/bookings/:id/reject", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if no rejection reason is provided", async () => {
    getBookingById.mockResolvedValue({ id: 1, status: "pending" });

    const res = await request(app)
      .put("/api/bookings/1/reject")
      .set("Authorization", ADMIN_AUTH)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("A rejection reason is required");
  });

  test("should return 200 and reject the booking", async () => {
    getBookingById.mockResolvedValue({ id: 1, status: "pending" });
    rejectBooking.mockResolvedValue({ id: 1, status: "rejected" });

    const res = await request(app)
      .put("/api/bookings/1/reject")
      .set("Authorization", ADMIN_AUTH)
      .send({ reason: "Schedule conflict" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Booking rejected");
  });
});
