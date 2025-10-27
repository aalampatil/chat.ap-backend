import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//put try/catch where you think it can fail

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    try {
      await fs.promises.unlink(localFilePath);
    } catch (err) {
      console.error("Failed to delete local file:", err);
    }

    return uploadResponse;
  } catch (error) {
    try {
      await fs.promises.unlink(localFilePath);
    } catch (err) {
      console.error("Failed to delete local file after error:", err);
    }

    console.log("catch-uploadOncloudinary error", error);

    return null;
  }
};

const deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) {
      throw new Error("Missing public_id for Cloudinary deletion");
    }

    const result = await cloudinary.uploader.destroy(`${public_id}`, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }

    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error.message);
    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
