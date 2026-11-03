// Optional integration: store external Cloudinary URLs only; no binary files are stored in MongoDB.
module.exports={enabled:Boolean(process.env.CLOUDINARY_CLOUD_NAME)};
