const cloudinary = require("../config/cloudinary");

const uploadImage = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

const uploadProfilePhoto = (fileBuffer) => uploadImage(fileBuffer, "tutor-bridge/profile-photos");
const uploadCvImage = (fileBuffer) => uploadImage(fileBuffer, "tutor-bridge/tutor-cvs");

module.exports = { uploadProfilePhoto, uploadCvImage };
