const cloudinary = require("../config/cloudinary");

const uploadProfilePhoto = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tutor-bridge/profile-photos" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(fileBuffer);
  });
};

module.exports = { uploadProfilePhoto };
