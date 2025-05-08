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
    res.status(200).json({ status: "success", totalUsers, totalPages, users });
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
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
