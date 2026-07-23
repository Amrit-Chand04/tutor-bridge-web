const { getProfileByUserId, upsertProfile } = require("../models/tutorProfileModel");
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
      message: "Tutor profile saved successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save tutor profile",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  saveMyProfile,
};
