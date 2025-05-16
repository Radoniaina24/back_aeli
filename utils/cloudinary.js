const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration de Multer avec stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Extraire le nom original du fichier sans l'extension
    const originalName = file.originalname
      .split(".")
      .slice(0, -1)
      .join("_")
      .replace(/\s+/g, "_");

    // Récupérer la date du jour (format YYYYMMDD)
    const currentDate = new Date();
    const formattedDate = currentDate
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    const isImage = file.mimetype.startsWith("image/");
    const isPdf = file.mimetype === "application/pdf";

    let options = {
      folder: "Candidature",
      public_id: `${originalName}_${formattedDate}`,
    };

    if (isImage) {
      options.format = "jpg"; // Convertit toutes les images en JPG
    } else if (isPdf) {
      options.resource_type = "raw"; // Définit les PDFs comme fichiers bruts
      options.format = "pdf";
    }
    return options;
  },
});
const storageCours = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = file.originalname
      .split(".")
      .slice(0, -1)
      .join("_")
      .replace(/\s+/g, "_");

    const extension = file.originalname.split(".").pop().toLowerCase(); // mp4, avi, etc.
    const currentDate = new Date();
    const formattedDate = currentDate
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    const mimetype = file.mimetype;
    const isPdf = mimetype === "application/pdf";
    const isVideo = mimetype.startsWith("video/");

    if (!isPdf && !isVideo) {
      const error = new Error(
        "Seuls les fichiers PDF ou vidéo sont autorisés."
      );
      error.status = 400;
      throw error;
    }

    const publicId = `${originalName}_${formattedDate}.${extension}`;

    const options = {
      folder: "Cours AELI",
      public_id: publicId,
      resource_type: isPdf ? "raw" : "video",
      // Ne pas forcer `format` pour les vidéos si tu veux garder leur extension originale
      format: isPdf ? "pdf" : undefined,
    };

    return options;
  },
});

// Initialisation de l'upload avec multer
const upload = multer({ storage: storage });

const uploadCours = multer({ storage: storageCours });

const uploadStudentPhoto = upload.single("photo");

const uploadFile = upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "cin", maxCount: 1 },
  { name: "degree", maxCount: 1 },
  { name: "birthCertificate", maxCount: 1 },
  { name: "certificateOfResidence", maxCount: 1 },
  { name: "photo", maxCount: 1 },
  { name: "gradeTranscript", maxCount: 1 },
]);

const uploadFileCours = uploadCours.fields([{ name: "file", maxCount: 1 }]);

module.exports = {
  uploadStudentPhoto,
  uploadFile,
  uploadFileCours,
};
