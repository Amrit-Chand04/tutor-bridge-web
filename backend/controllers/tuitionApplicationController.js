const {
  createApplication,
  getApplicationByRequestAndTutor,
  getApplicationsForRequest,
  getApplicationsForTutor,
  getApplicationById,
  acceptApplication,
  rejectApplication,
  rejectOtherPendingApplications,
} = require("../models/tuitionApplicationModel");
const { getRequestById, closeRequest } = require("../models/tuitionRequestModel");
const { getProfileByUserId } = require("../models/tutorProfileModel");

const applyToRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await getRequestById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Tuition request not found" });
    }
    if (request.status !== "open") {
      return res.status(400).json({ message: "This request is no longer open" });
    }

    const tutorProfile = await getProfileByUserId(req.user.user_id);
    if (!tutorProfile || tutorProfile.verification_status !== "verified") {
      return res.status(403).json({ message: "Verify your tutor profile before applying" });
    }

    const existing = await getApplicationByRequestAndTutor(requestId, req.user.user_id);
    if (existing) {
      return res.status(400).json({ message: "You have already applied to this request" });
    }

    const application = await createApplication(requestId, req.user.user_id);
    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

const listMyApplications = async (req, res) => {
  try {
    const applications = await getApplicationsForTutor(req.user.user_id);
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your applications",
      error: error.message,
    });
  }
};

const listApplicationsForRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await getRequestById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Tuition request not found" });
    }
    if (request.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only view applications for your own requests" });
    }

    const applications = await getApplicationsForRequest(requestId);
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

const acceptTutorApplication = async (req, res) => {
  try {
    const applicationId = req.params.appId;
    const application = await getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const request = await getRequestById(application.request_id);
    if (!request || request.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only manage applications for your own requests" });
    }

    const updated = await acceptApplication(applicationId);
    await rejectOtherPendingApplications(application.request_id, applicationId);
    await closeRequest(application.request_id);

    res.status(200).json({
      message: "Tutor booked for this tuition request",
      application: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to book tutor",
      error: error.message,
    });
  }
};

const rejectTutorApplication = async (req, res) => {
  try {
    const applicationId = req.params.appId;
    const application = await getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const request = await getRequestById(application.request_id);
    if (!request || request.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only manage applications for your own requests" });
    }

    const updated = await rejectApplication(applicationId);
    res.status(200).json({
      message: "Application rejected",
      application: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject application",
      error: error.message,
    });
  }
};

module.exports = {
  applyToRequest,
  listMyApplications,
  listApplicationsForRequest,
  acceptTutorApplication,
  rejectTutorApplication,
};
