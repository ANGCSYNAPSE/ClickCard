const cloudinary = require('cloudinary').v2;
const { Buffer } = require('buffer');

// Configure Cloudinary
// These values will be pulled from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CloudinaryService = {
  /**
   * Upload a buffer to Cloudinary
   * @param {Buffer} fileBuffer - The file buffer from multer
   * @param {string} folder - Folder name in Cloudinary (e.g., 'profile_pictures')
   * @param {string} publicId - Custom public ID (usually user ID)
   */
  uploadImage: async (fileBuffer, folder, publicId) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'limit' }, // Optimize for resume/profile
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });
  },

  /**
   * Delete an image from Cloudinary
   */
  deleteImage: async (publicId) => {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Cloudinary delete error:', err);
    }
  }
};

module.exports = CloudinaryService;
