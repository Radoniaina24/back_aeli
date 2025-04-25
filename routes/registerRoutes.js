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

module.exports = applicationRouter;
