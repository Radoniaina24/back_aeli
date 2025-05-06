const Register = require("../models/registerModel");
const cloudinary = require("cloudinary").v2;
// POST /api/register
const createApplication = async (req, res) => {
  if (!req.files) {
    return res
      .status(400)
      .json({ message: "Veuillez télécharger les fichiers requis." });
  }
  const uploadedFiles = {};
  const status = "unapproved";
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
      photo: uploadedFiles.photo,
      gradeTranscript: uploadedFiles.gradeTranscript,
      status,
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
// Get /api/register
const getAllApplication = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, sort } = req.query;
    // Construction dynamique des filtres
    const filters = {};

    if (search) {
      filters.$or = [
        { lastName: { $regex: search, $options: "i" } },
        {
          firstName: { $regex: search, $options: "i" },
        },
      ];
    }
    if (status && status !== "all") {
      filters.status = status;
    }
    const sortOption = sort === "asc" ? 1 : -1;

    const totalApplications = await Register.countDocuments(filters);
    const totalPages = Math.ceil(totalApplications / limit);

    const applications = await Register.find(filters).sort({
      createdAt: sortOption,
    }); // Tri par date de création décroissante
    // .skip((page - 1) * limit)
    // .limit(limit);

    res.status(200).json({
      totalApplications,
      totalPages,
      currentPage: parseInt(page),
      applications,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
// Get by id /api/regiter/id
const getApplicationById = async (req, res) => {
  try {
    const application = await Register.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }
    res.status(200).json(application);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
// Delete by id /api/regiter/id
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Register.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }

    // Suppression du fichier dans cloudinary
    const resourceType = application.cv.type === "pdf" ? "raw" : "image";
    //suppression du CV
    await cloudinary.uploader.destroy(application.cv.publicId, {
      resource_type: resourceType,
    });
    //suppression du CIN
    await cloudinary.uploader.destroy(application.cin.publicId, {
      resource_type: resourceType,
    });
    //suppression du diplôme
    await cloudinary.uploader.destroy(application.degree.publicId, {
      resource_type: resourceType,
    });
    //suppression du bulletin de naissance
    await cloudinary.uploader.destroy(application.birthCertificate.publicId, {
      resource_type: resourceType,
    });
    //suppression du certificat de résidence
    await cloudinary.uploader.destroy(
      application.certificateOfResidence.publicId,
      {
        resource_type: resourceType,
      }
    );
    //suppression du photo
    await cloudinary.uploader.destroy(application.photo.publicId, {
      resource_type: "image",
    });
    //suppression du relevé de notes
    await cloudinary.uploader.destroy(application.gradeTranscript.publicId, {
      resource_type: resourceType,
    });
    // Suppression du Candidature
    await Register.deleteOne({ _id: id });

    res.status(200).json({ message: "Candidature supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
// Update by id /api/regiter/id
const updateApplication = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const register = await Register.findById(id);
    if (!register) {
      return res.status(404).json({ message: "Candidat non trouvée" });
    }

    register.status = status || register.status;
    await register.save();
    res
      .status(200)
      .json({ message: "Status mise à jour avec succès", register });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  createApplication,
  getAllApplication,
  getApplicationById,
  deleteApplication,
  updateApplication,
};
