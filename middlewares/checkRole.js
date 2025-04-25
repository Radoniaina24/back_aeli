// const logger = require("../utils/logger"); // Optionnel, pour le logging
/**
 * Middleware pour vérifier le rôle de l'utilisateur
 * @param {Array} allowedRoles - Liste des rôles autorisés (ex: ["admin", "moderator"])
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Accès non autorisé, utilisateur non authentifié" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        // logger?.warn(`Accès refusé pour l'utilisateur ${req.user.email} (rôle: ${req.user.role})`);
        return res
          .status(403)
          .json({ message: "Accès interdit, rôle insuffisant" });
      }

      next(); // L'utilisateur a le bon rôle, on continue la requête
    } catch (error) {
      //   logger?.error("Erreur dans le middleware checkRole :", error);
      res.status(500).json({ message: "Server internal error" });
    }
  };
};
module.exports = checkRole;
