const User = require("../models/userModel");
const verifyToken = require("../utils/verifyToken");
const bcrypt = require("bcrypt");
const { generateRefreshToken } = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Vérifier si les champs sont bien remplis
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // Trouver l'utilisateur et inclure explicitement le champ `password`
    const userFound = await User.findOne({ email }).select("+password");

    if (!userFound) {
      return res
        .status(404)
        .json({ message: "Mot de passe ou adresse e-mail incorrecte" });
    }
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Mot de passe ou adresse e-mail incorrecte" });
    }
    const refreshToken = generateRefreshToken(userFound._id);
    userFound.refreshToken = refreshToken;
    await userFound.save(); // ⚠️ Toujours attendre la sauvegarde

    // Ajouter le token dans un cookie HttpOnly
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Empêche l'accès au cookie via JavaScript
      secure: isProduction, // Seulement en HTTPS en production
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 jour
      path: "/", // Définit l'accès global au cookie
    });
    res.json({
      status: "success",
      message: "User logged in successfully",
      refreshToken,
      role: userFound.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const user = req.user; // Injecté par le middleware `isLoggedIn`
  // console.log("user", user);
  res.status(200).json({
    user,
    token: user.refreshToken,
  });
}

async function logout(req, res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Utiliser HTTPS en production
    sameSite: "Strict", // Pour éviter le CSRF
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Utiliser HTTPS en production
    sameSite: "Strict", // Pour éviter le CSRF
  });
  res.json({ message: "User logged out successfully" });
}
async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(403).json({ message: "Non autorisé" });

    const decoded = verifyToken(refreshToken);
    const newAccessToken = generateRefreshToken(decoded.id);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // Durée du Refresh Token (7 jours)
    });
    res
      .status(200)
      .json({ message: "Token successfully refreshed", newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Veuillez fournir un email." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Aucun utilisateur trouvé avec cet email." });
    }
    // Créer un token de réinitialisation (ici simple pour l'exemple)
    const resetToken = generateRefreshToken(user._id);
    // Vous pouvez stocker ce token dans la BDD si besoin
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
    <div style="background-color: #f9fafb; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Réinitialiser votre mot de passe</h1>
          <p style="color: #6b7280; font-size: 16px; margin: 0;">Suivez simplement le lien ci-dessous pour continuer</p>
        </div>
  
        <div style="text-align: center; margin: 40px 0;">
          <a 
            href="${resetUrl}" 
            style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 24px; font-size: 16px; border-radius: 6px; display: inline-block;"
            clicktracking="off"
          >
            Réinitialiser mon mot de passe
          </a>
        </div>
  
        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Ce lien expirera dans 30 minutes. <br/>Si vous n'avez pas demandé la réinitialisation de votre mot de passe, ignorez simplement cet e-mail.
        </p>
  
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Votre Société. Tous droits réservés.
        </p>
  
      </div>
    </div>
  `;

    await sendEmail({
      to: user.email,
      subject: "Réinitialisation du mot de passe",
      html: message,
    });
    res.status(200).json({ message: "Email de réinitialisation envoyé." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur." });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res
        .status(400)
        .json({ message: "Le nouveau mot de passe est requis." });
    }
    // Vérifier et décoder le token
    const decoded = verifyToken(resetToken);
    const user = await User.findById(decoded.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    user.password = newPassword;
    // Optionnel : réinitialiser aussi le refreshToken pour forcer reconnexion
    // user.refreshToken = "";
    await user.save();

    res
      .status(200)
      .json({ message: "Mot de passe réinitialisé avec succès.", user: user });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Le lien de réinitialisation a expiré." });
    }
    res.status(400).json({ message: "Lien invalide ou expiré." });
  }
};
module.exports = {
  getMe,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
};
