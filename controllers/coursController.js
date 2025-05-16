const Cours = require("../models/coursModel");
const cloudinary = require("cloudinary").v2;
// @desc    Obtenir tous les cours
// @route   GET /api/cours
// @access  Public
const getAllCours = async (req, res) => {
  try {
    // Paramètres de filtrage et pagination
    const { level, year, semester, track, page = 1, limit = 10 } = req.query;
    const filter = {};
    // Appliquer les filtres s'ils sont fournis
    if (level) filter.level = level;
    if (year) filter.year = year;
    if (semester) filter.semester = semester;
    if (track) filter.track = track;
    // Exécuter la requête avec pagination
    const cours = await Cours.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Obtenir le nombre total de documents pour la pagination
    const count = await Cours.countDocuments(filter);
    res.status(200).json({
      cours,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Erreur lors des cours :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
// @desc    Créer un nouveau cours
// @route   POST /api/cours
// @access  Private
const createCours = async (req, res) => {
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
      type: req.files[key][0].mimetype.startsWith("video/") ? "video" : "pdf",
    };
  });
  try {
    const { title, description, level, year, semester, track } = req.body;
    // Créer le cours
    const cours = await Cours.create({
      title,
      description,
      level,
      year,
      semester,
      track,
      file: uploadedFiles.file,
    });

    res.status(201).json({ message: "Cours créer avec success" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Une erreur interne s'est produite." });
  }
};

// Supprimer un fichier de cloudinary
const deleteFile = async (publicId, type) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
    });
    // return { message: "Fichier supprimé avec succès" };
  } catch (error) {
    console.error("Erreur lors de la suppression sur Cloudinary:", error);
    // return res
    //   .status(500)
    //   .json({ message: "Une erreur interne s'est produite." });
  }
};

// @desc    Supprimer un cours
// @route   DELETE /api/cours/:id
// @access  Private
const deleteCours = async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);
    // console.log(cours);
    if (!cours) {
      res.status(404);
      throw new Error("Cours non trouvé");
    }
    // Supprimer le fichier de Cloudinary
    const resourceType = cours.file.type === "pdf" ? "raw" : "video";
    await deleteFile(cours.file.publicId, resourceType);
    // Supprimer le document
    await Cours.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Cours supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors des cours :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// @desc    Mettre à jour un cours
// @route   PUT /api/cours/:id
// @access  Private
const updateCours = async (req, res) => {
  try {
    const { title, description, level, year, semester, track } = req.body;

    // Vérifier si le cours existe
    const cours = await Cours.findById(req.params.id);
    if (!cours) {
      res.status(404);
      throw new Error("Cours non trouvé");
    }

    // Gérer la mise à jour du fichier si un nouveau est fourni
    if (req.files) {
      const uploadedFiles = {};
      Object.keys(req.files).forEach((key) => {
        uploadedFiles[key] = {
          url: req.files[key][0].path,
          publicId: req.files[key][0].filename,
          type: req.files[key][0].mimetype.startsWith("video/")
            ? "video"
            : "pdf",
        };
      });
      // Supprimer l'ancien fichier
      const resourceType = cours.file.type === "pdf" ? "raw" : "video";
      await deleteFile(cours.file.publicId, resourceType);
      cours.file = uploadedFiles.file || cours.file;
    } else {
      cours.file = cours.file;
    }
    // Mettre à jour les champs
    (cours.title = title || cours.title),
      (cours.description = description || cours.description),
      (cours.level = level || cours.level),
      (cours.year = year || cours.year),
      (cours.semester = semester || cours.semester),
      (cours.track = track || cours.track);
    // Mettre à jour le document
    await cours.save();

    res.status(200).json(cours);
  } catch (error) {
    console.error("Erreur lors des cours :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  createCours,
  getAllCours,
  deleteCours,
  updateCours,
};
