const {
  getProfileByUserId,
  upsertProfile,
  getAllProfiles,
  approveProfile,
  rejectProfile,
  deleteProfile,
} = require("../models/tutorProfileModel");
const { uploadCvImage } = require("../services/cloudinaryService");

const getMyProfile = async (req, res) => {
  try {
    const profile = await getProfileByUserId(req.user.user_id);
    res.status(200).json({ profile: profile || null });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tutor profile",
      error: error.message,
    });
  }
};

const saveMyProfile = async (req, res) => {
  try {
    const { degree, institution, passingYear, yearsExperience, description, skills } = req.body;
    const existingProfile = await getProfileByUserId(req.user.user_id);

    if (
      (!req.file && !existingProfile?.cv_url) ||
      !degree ||
      !institution ||
      !passingYear ||
      !yearsExperience ||
      !description ||
      !skills
    ) {
      return res.status(400).json({
        message:
          "CV, degree, institution, passing year, years of experience, description, and skills are all required",
      });
    }

    let cvUrl = null;
    if (req.file) {
      const uploadResult = await uploadCvImage(req.file.buffer);
      cvUrl = uploadResult.secure_url;
    }

    const profile = await upsertProfile(req.user.user_id, {
      cvUrl,
      degree,
      institution,
      passingYear,
      yearsExperience,
      description,
      skills,
    });

    res.status(200).json({
      message: req.file
        ? "Request sent for approval"
        : "Profile updated successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save tutor profile",
      error: error.message,
    });
  }
};

const getAllProfilesAdmin = async (req, res) => {
  try {
    const profiles = await getAllProfiles();
    res.status(200).json({ profiles });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tutor profiles",
      error: error.message,
    });
  }
};

const approveTutorProfile = async (req, res) => {
  try {
    const profile = await approveProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }
    res.status(200).json({
      message: "Tutor profile approved",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve tutor profile",
      error: error.message,
    });
  }
};

const rejectTutorProfile = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "A rejection reason is required" });
    }

    const profile = await rejectProfile(req.params.id, reason);
    if (!profile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }
    res.status(200).json({
      message: "Tutor profile rejected",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject tutor profile",
      error: error.message,
    });
  }
};

const deleteTutorProfile = async (req, res) => {
  try {
    const profile = await deleteProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }
    res.status(200).json({ message: "Tutor profile deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete tutor profile",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  saveMyProfile,
  getAllProfilesAdmin,
  approveTutorProfile,
  rejectTutorProfile,
  deleteTutorProfile,
};
