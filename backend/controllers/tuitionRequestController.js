const { createTuitionRequest } = require("../models/tuitionRequestModel");

const ALLOWED_GENDERS = ["male", "female", "any"];

const createRequest = async (req, res) => {
  try {
    const {
      subject,
      location,
      classLevel,
      preferredGender,
      budget,
      contactNumber,
      preferredTime,
      description,
    } = req.body;

    if (!subject || !location || !classLevel || !budget || !contactNumber) {
      return res.status(400).json({
        message: "Subject, location, class level, budget, and contact number are required",
      });
    }

    if (preferredGender && !ALLOWED_GENDERS.includes(preferredGender)) {
      return res.status(400).json({
        message: "Preferred gender must be male, female, or any",
      });
    }

    if (isNaN(budget) || Number(budget) < 0) {
      return res.status(400).json({
        message: "Budget must be a valid positive number",
      });
    }

    const request = await createTuitionRequest(req.user.user_id, {
      subject,
      location,
      classLevel,
      preferredGender,
      budget,
      contactNumber,
      preferredTime,
      description,
    });

    res.status(201).json({
      message: "Tuition request created successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create tuition request",
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
};
