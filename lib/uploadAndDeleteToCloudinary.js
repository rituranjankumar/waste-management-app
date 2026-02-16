import cloudinary from "./cloudinary";

export const uploadToCloudinary = async (file, folder = "waste-management-app") => {
  if (!file) throw new Error("No file provided");

  // allow only images
  if (!file.type?.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  if (file.size > 4 * 1024 * 1024) {
  throw new Error("Image must be less than 4MB");
}

  // File -> Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload using upload_stream (best way)
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(buffer);
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
  };
};


 

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error("Failed to delete old image");
  }
};

