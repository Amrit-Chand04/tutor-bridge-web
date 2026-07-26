// ── tests/supportTicket.test.js 
// Tests for  POST  /api/support-tickets/
//        GET     /api/support-tickets/:id
//        POST    /api/support-tickets/:id/messages

// ── Step 1: Mocks BEFORE imports 
jest.mock("../models/supportTicketModel", () => ({
  createTicket: jest.fn(),
  getTicketsByUser: jest.fn(),
  getAllTickets: jest.fn(),
  getTicketById: jest.fn(),
  markTicketResolved: jest.fn(),
}));

jest.mock("../models/ticketMessageModel", () => ({
  createMessage: jest.fn(),
  getMessagesByTicket: jest.fn(),
}));

// jwt.verify decodes based on the fake token used in each request
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token) =>
    token === "admin_token"
      ? { user_id: 99, role: "admin" }
      : { user_id: 1, role: "student" },
  ),
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports
const request = require("supertest");
const app = require("../server");
const {
  createTicket,
  getTicketById,
  markTicketResolved,
} = require("../models/supportTicketModel");
const { createMessage, getMessagesByTicket } = require("../models/ticketMessageModel");

const STUDENT_AUTH = "Bearer student_token";
const ADMIN_AUTH = "Bearer admin_token";

// ── Step 3: Suite — POST / 
describe("POST /api/support-tickets/", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if subject or description is missing", async () => {
    const res = await request(app)
      .post("/api/support-tickets/")
      .set("Authorization", STUDENT_AUTH)
      .send({ subject: "Payment issue" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 201 and create the ticket on success", async () => {
    createTicket.mockResolvedValue({ id: 1, subject: "Payment issue", status: "open" });

    const res = await request(app)
      .post("/api/support-tickets/")
      .set("Authorization", STUDENT_AUTH)
      .send({ subject: "Payment issue", description: "My payment failed" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Support ticket created successfully");
  });
});

// ── Suite — GET /:id
describe("GET /api/support-tickets/:id", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 404 if the ticket does not exist", async () => {
    getTicketById.mockResolvedValue(null);

    const res = await request(app).get("/api/support-tickets/999").set("Authorization", STUDENT_AUTH);

    expect(res.statusCode).toBe(404);
  });

  test("should return 403 if the ticket belongs to a different user", async () => {
    getTicketById.mockResolvedValue({ id: 1, user_id: 999, status: "open" });

    const res = await request(app).get("/api/support-tickets/1").set("Authorization", STUDENT_AUTH);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("You cannot access this ticket");
  });

  test("should return 200 and the ticket for its owner", async () => {
    getTicketById.mockResolvedValue({ id: 1, user_id: 1, status: "open" });
    getMessagesByTicket.mockResolvedValue([]);

    const res = await request(app).get("/api/support-tickets/1").set("Authorization", STUDENT_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.ticket.id).toBe(1);
  });
});

// ── Suite — POST /:id/messages 
describe("POST /api/support-tickets/:id/messages", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 403 if a non-admin tries to respond", async () => {
    const res = await request(app)
      .post("/api/support-tickets/1/messages")
      .set("Authorization", STUDENT_AUTH)
      .send({ message: "Thanks for reaching out" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Only support staff can respond to tickets");
  });

  test("should return 400 if the ticket is already resolved", async () => {
    getTicketById.mockResolvedValue({ id: 1, status: "resolved" });

    const res = await request(app)
      .post("/api/support-tickets/1/messages")
      .set("Authorization", ADMIN_AUTH)
      .send({ message: "Following up" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("This ticket has already been resolved");
  });

  test("should return 201 and mark the ticket resolved on success", async () => {
    getTicketById.mockResolvedValue({ id: 1, status: "open" });
    createMessage.mockResolvedValue({ id: 5, message: "Following up" });
    markTicketResolved.mockResolvedValue({});

    const res = await request(app)
      .post("/api/support-tickets/1/messages")
      .set("Authorization", ADMIN_AUTH)
      .send({ message: "Following up" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Response sent and ticket marked as resolved");
  });
});
