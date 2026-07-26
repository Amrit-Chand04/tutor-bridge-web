// ── tests/tutorProfile.test.js 
// Tests for  GET  /api/tutor-profile/me      (tutor)
//        PUT     /api/tutor-profile/         (tutor)
//        DELETE  /api/tutor-profile/me       (tutor)
//        GET     /api/tutor-profile/         (admin)
//        PUT     /api/tutor-profile/:id/approve  (admin)
//        PUT     /api/tutor-profile/:id/reject   (admin)

// ── Step 1: Mocks BEFORE imports 
jest.mock("../models/tutorProfileModel", () => ({
  getProfileByUserId: jest.fn(),
  upsertProfile: jest.fn(),
  getAllProfiles: jest.fn(),
  approveProfile: jest.fn(),
  rejectProfile: jest.fn(),
  deleteProfile: jest.fn(),
  deleteProfileByUserId: jest.fn(),
}));

// jwt.verify decodes based on the fake token used in each request
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token) =>
    token === "admin_token"
      ? { user_id: 99, email: "admin@example.com", role: "admin" }
      : { user_id: 1, email: "tutor@example.com", role: "tutor" },
  ),
}));

// Multer upload middleware — skip real file handling.
// server.js also loads userRoutes.js which needs uploadProfilePhoto from the
// same module, so both functions must be mocked here even though this file
// only exercises uploadCv.
jest.mock("../middleware/upload", () => ({
  uploadCv: (req, res, next) => {
    req.file = null;
    next();
  },
  uploadProfilePhoto: (req, res, next) => {
    req.file = null;
    next();
  },
}));

jest.mock("../config/db", () => ({ query: jest.fn() }));

// ── Step 2: Imports 
const request = require("supertest");
const app = require("../server");
const {
  getProfileByUserId,
  upsertProfile,
  getAllProfiles,
  approveProfile,
  rejectProfile,
  deleteProfileByUserId,
} = require("../models/tutorProfileModel");

const TUTOR_AUTH = "Bearer tutor_token";
const ADMIN_AUTH = "Bearer admin_token";

// ── Step 3: Suite — tutor's own profile 
describe("GET /api/tutor-profile/me", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 200 and null when the tutor has no profile yet", async () => {
    getProfileByUserId.mockResolvedValue(null);

    const res = await request(app).get("/api/tutor-profile/me").set("Authorization", TUTOR_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.profile).toBeNull();
  });
});

describe("PUT /api/tutor-profile/", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if required fields are missing and no CV exists yet", async () => {
    getProfileByUserId.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/tutor-profile/")
      .set("Authorization", TUTOR_AUTH)
      .send({ degree: "BSc" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 200 and update the profile when a CV already exists", async () => {
    getProfileByUserId.mockResolvedValue({ cv_url: "https://cloud/existing-cv.pdf" });
    upsertProfile.mockResolvedValue({ degree: "BSc", institution: "XYZ University" });

    const res = await request(app)
      .put("/api/tutor-profile/")
      .set("Authorization", TUTOR_AUTH)
      .send({
        degree: "BSc",
        institution: "XYZ University",
        passingYear: "2022",
        yearsExperience: "3",
        description: "Experienced math tutor",
        skills: "Algebra, Calculus",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");
  });
});

describe("DELETE /api/tutor-profile/me", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 404 when the tutor has no profile to delete", async () => {
    deleteProfileByUserId.mockResolvedValue(null);

    const res = await request(app).delete("/api/tutor-profile/me").set("Authorization", TUTOR_AUTH);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("You don't have a tutor profile to delete");
  });
});

// ── Suite — admin management 
describe("GET /api/tutor-profile/ (admin)", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 200 and the full list of tutor profiles", async () => {
    getAllProfiles.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const res = await request(app).get("/api/tutor-profile/").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.profiles).toHaveLength(2);
  });
});

describe("PUT /api/tutor-profile/:id/approve", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 404 if the profile does not exist", async () => {
    approveProfile.mockResolvedValue(null);

    const res = await request(app).put("/api/tutor-profile/999/approve").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(404);
  });

  test("should return 200 and approve the profile", async () => {
    approveProfile.mockResolvedValue({ id: 1, status: "approved" });

    const res = await request(app).put("/api/tutor-profile/1/approve").set("Authorization", ADMIN_AUTH);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Tutor profile approved");
  });
});

describe("PUT /api/tutor-profile/:id/reject", () => {
  afterEach(() => jest.clearAllMocks());

  test("should return 400 if no rejection reason is provided", async () => {
    const res = await request(app)
      .put("/api/tutor-profile/1/reject")
      .set("Authorization", ADMIN_AUTH)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("A rejection reason is required");
  });
});
