const express = require("express");
const routerCours = express.Router();
const {
  getAllCours,
  createCours,
  deleteCours,
  updateCours,
} = require("../controllers/coursController");
const checkRole = require("../middlewares/checkRole");
const { uploadFileCours } = require("../utils/cloudinary");
const isLoggedIn = require("../middlewares/isLoggedIn");
// Les fichiers sont gérés par multer pour les routes qui impliquent un upload
routerCours.post(
  "/",
  isLoggedIn,
  checkRole(["super_admin"]),
  uploadFileCours,
  createCours
);
routerCours.get("/", getAllCours);
routerCours.put(
  "/:id",
  isLoggedIn,
  uploadFileCours,
  checkRole(["super_admin"]),
  updateCours
);
// router.get("/:id", getCoursById);
routerCours.delete("/:id", isLoggedIn, checkRole(["super_admin"]), deleteCours);

module.exports = routerCours;
