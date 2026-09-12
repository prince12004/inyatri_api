import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import ApiError from "../../utils/ApiError.js";

export const uploadBufferToCloudinary = (buffer, folder = "inyatri/cars") =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

export const uploadSingleImage = async (file, folder = "inyatri/cars") => {
  if (!file?.buffer) {
    throw new ApiError(400, "Image file is required");
  }

  const result = await uploadBufferToCloudinary(file.buffer, folder);

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};

export const uploadMultipleImages = async (files, folder = "inyatri/cars") => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new ApiError(400, "At least one image file is required");
  }

  const uploads = await Promise.all(
    files.map((file) => uploadSingleImage(file, folder))
  );

  return uploads;
};
