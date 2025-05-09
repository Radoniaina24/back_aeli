const Register = require("../models/registerModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const createUser = async (req, res) => {
  try {
    const { lastName, firstName, email, password, role, student } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Un utilisateur avec cet email existe déjà" });
    }
    const user = new User({
      lastName,
      firstName,
      email,
      password,
      role,
      student,
    });
    await user.save();
    res.status(201).json({ message: "Utilisateur créé avec succès", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const searchQuery = search
      ? {
          $or: [
            { lastName: { $regex: search, $options: "i" } },
            { firstName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);
    const users = await User.find(searchQuery)
      .populate({
        path: "student",
        select: "photo studyPeriod ",
      })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      status: "success",
      totalUsers,
      totalPages,
      users,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getAllUsersCandidate = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const filters = {};
    if (search) {
      filters.$or = [
        { lastName: { $regex: search, $options: "i" } },
        {
          firstName: { $regex: search, $options: "i" },
        },
      ];
    }
    const role = "student";
    if (role) {
      filters.role = role;
    }
    if (status && status !== "all") {
      filters.status = status;
    }
    const totalUsers = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / limit);
    const users = await User.find(filters)
      .populate({
        path: "student",
        select: "photo studyPeriod funding phoneNumber",
      })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      status: "success",
      totalUsers,
      totalPages,
      users,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { lastName, firstName, email, password } = req.body;
    // Création d'un objet updateData contenant uniquement les champs valides
    const updateData = { lastName, firstName, email };

    // Si un mot de passe est fourni, on le hash avant la mise à jour
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res
      .status(200)
      .json({ message: "Utilisateur mis à jour avec succès", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Update by id /api/user/candidate/id
const updateUserCandidate = async (req, res) => {
  try {
    const { status, schoolFees } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvée" });
    }

    user.status = status || user.status;
    user.schoolFees = schoolFees || user.schoolFees;
    await user.save();
    res.status(200).json({ message: "Status mise à jour avec succès", user });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const deleteUserCandidate = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvée" });
    }
    const register_id = user.student._id;
    const register = await Register.findById(register_id);
    if (!register) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }
    // Suppression du fichier dans cloudinary
    const resourceType = register.cv.type === "pdf" ? "raw" : "image";
    //suppression du CV
    await cloudinary.uploader.destroy(register.cv.publicId, {
      resource_type: resourceType,
    });
    //suppression du CIN
    await cloudinary.uploader.destroy(register.cin.publicId, {
      resource_type: resourceType,
    });
    //suppression du diplôme
    await cloudinary.uploader.destroy(register.degree.publicId, {
      resource_type: resourceType,
    });
    //suppression du bulletin de naissance
    await cloudinary.uploader.destroy(register.birthCertificate.publicId, {
      resource_type: resourceType,
    });
    //suppression du certificat de résidence
    await cloudinary.uploader.destroy(
      register.certificateOfResidence.publicId,
      {
        resource_type: resourceType,
      }
    );
    //suppression du photo
    await cloudinary.uploader.destroy(register.photo.publicId, {
      resource_type: "image",
    });
    //suppression du relevé de notes
    await cloudinary.uploader.destroy(register.gradeTranscript.publicId, {
      resource_type: resourceType,
    });
    // Suppression du Candidature
    await Register.deleteOne({ _id: id });
    // Suppression du Candidature
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsersCandidate,
  updateUserCandidate,
  deleteUserCandidate,
};
