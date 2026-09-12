import multer from "multer";
import ApiError from "../utils/ApiError.js";

const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const imageFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new ApiError(400, `Unsupported image type: ${file.mimetype}`), false);
};

export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
  },
  fileFilter: imageFilter,
}).single("file");

export const uploadMultipleImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
    files: 4,
  },
  fileFilter: imageFilter,
}).array("files", 4);
