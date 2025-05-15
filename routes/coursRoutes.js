const express = require("express");
const routerCours = express.Router();
const { getAllCours, createCours } = require("../controllers/coursController");
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
// router.put("/:id", upload.single("cv"), updateCours);

routerCours.get("/", getAllCours);
// router.get("/:id", getCoursById);
// router.delete("/:id", deleteCours);

module.exports = routerCours;
