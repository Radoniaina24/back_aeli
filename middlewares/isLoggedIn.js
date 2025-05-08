const User = require("../models/userModel");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");

async function isLoggedIn(req, res, next) {
  //recuperation du token
  // const token = getTokenFromHeader(req);
  // console.log("token :", tokenCookies);
  try {
    const token = req.cookies.refreshToken; // Récupération du token via le cookie sécurisé
    if (!token) {
      return res.status(401).json({ message: "Accès refusé, token manquant" });
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password").populate({
      path: "student",
      select: "photo studyPeriod ",
    });
    // console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Accès non autorisé" });
  }
}
module.exports = isLoggedIn;
