const multer = require("multer");
const CloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const { ApiError } = require("./errorHandler");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

function makeStorage(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `writemate/${folder}`,
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new ApiError(400, "Only JPG, PNG, WEBP images or PDF files are allowed"),
    );
  }
  cb(null, true);
}

const uploadAvatar = multer({
  storage: makeStorage("avatars"),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

const uploadUpiQr = multer({
  storage: makeStorage("upi-qr"),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

const uploadRequestFiles = multer({
  storage: makeStorage("request-files"),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 5 },
});

const uploadCompletionProof = multer({
  storage: makeStorage("completion-proof"),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 5 },
});

const uploadComplaintAttachments = multer({
  storage: makeStorage("complaints"),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 5 },
});

module.exports = {
  uploadAvatar,
  uploadUpiQr,
  uploadRequestFiles,
  uploadCompletionProof,
  uploadComplaintAttachments,
};
