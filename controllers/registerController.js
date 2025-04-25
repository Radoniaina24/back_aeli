const Register = require("../models/registerModel");

// POST /api/register
const createApplication = async (req, res) => {
  if (!req.files) {
    return res
      .status(400)
      .json({ message: "Veuillez télécharger les fichiers requis." });
  }
  const uploadedFiles = {};
  Object.keys(req.files).forEach((key) => {
    uploadedFiles[key] = {
      url: req.files[key][0].path,
      publicId: req.files[key][0].filename,
      type: req.files[key][0].mimetype.startsWith("image/") ? "image" : "pdf",
    };
  });
  try {
    // Récupération des données depuis le body
    const {
      lastName,
      firstName,
      emailAddress,
      confirmEmailAddress,
      phoneNumber,
      dateOfBirth,
      nationality,
      address,
      city,
      postalCode,
      country,
      lastDegree,
      institution,
      graduationYear,
      overallGPA,
      fieldOfStudy,
      program,
      studyPeriod,
      funding,
      coverLetter,
      acceptConditions,
    } = req.body;

    if (emailAddress !== confirmEmailAddress) {
      return res
        .status(400)
        .json({ message: "Les adresses e-mail ne correspondent pas." });
    }

    // Création de l'application
    const newApplication = new Register({
      lastName,
      firstName,
      emailAddress,
      phoneNumber,
      dateOfBirth,
      nationality,
      address,
      city,
      postalCode,
      country,
      lastDegree,
      institution,
      graduationYear,
      overallGPA,
      fieldOfStudy,
      program,
      studyPeriod,
      funding,
      coverLetter,
      acceptConditions: true,
      cv: uploadedFiles.cv,
      cin: uploadedFiles.cin,
      degree: uploadedFiles.degree,
      birthCertificate: uploadedFiles.birthCertificate,
      certificateOfResidence: uploadedFiles.certificateOfResidence,
    });

    await newApplication.save();

    return res.status(201).json({
      message: "Candidature soumise avec succès.",
      applicationId: newApplication._id,
    });
  } catch (error) {
    console.error("Erreur lors de la soumission de candidature :", error);
    return res
      .status(500)
      .json({ message: "Une erreur interne s'est produite." });
  }
};

module.exports = {
  createApplication,
};
