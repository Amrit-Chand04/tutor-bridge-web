const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const uploadProfilePhoto = (req, res, next) => {
  upload.single("profile_photo")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    next();
  });
};

module.exports = { uploadProfilePhoto };
