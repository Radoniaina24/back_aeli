const Cours = require("../models/coursModel");

// @desc    Obtenir tous les cours
// @route   GET /api/cours
// @access  Public
const getAllCours = async (req, res, next) => {
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
    next(error);
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
      type: req.files[key][0].mimetype.startsWith("image/") ? "image" : "pdf",
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

module.exports = {
  createCours,
  getAllCours,
};
