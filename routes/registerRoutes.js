const express = require("express");
const applicationRouter = express.Router();
const applicationController = require("../controllers/registerController");
const { uploadFile } = require("../utils/cloudinary");

// Créer un application
applicationRouter.post(
  "/",
  uploadFile,
  applicationController.createApplication
);
// Obternir tous les candidatures
applicationRouter.get("/", applicationController.getAllApplication);
// Obternir un  candidature par son Id
applicationRouter.get("/:id", applicationController.getApplicationById);
// Supprimer un  candidature par son Id
applicationRouter.delete("/:id", applicationController.deleteApplication);
// modifier un  candidature par son Id
applicationRouter.put("/:id", applicationController.updateApplication);

module.exports = applicationRouter;
