const mongoose = require("mongoose");
// Définition du schéma pour un élément de register
const registerSchema = new mongoose.Schema(
  {
    // Informations personnelles
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    // Parcours académique
    lastDegree: {
      type: String,
      required: true,
      trim: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    graduationYear: {
      type: String,
      required: true,
      trim: true,
    },
    overallGPA: {
      type: String,
      required: true,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
      trim: true,
    },
    // Choix du programme
    program: {
      type: String,
      required: true,
      trim: true,
    },
    studyPeriod: {
      type: String,
      required: true,
      trim: true,
    },
    funding: {
      type: String,
      required: true,
      trim: true,
    },
    // Lettre de motivation
    coverLetter: {
      type: String,
      required: true,
      trim: true,
    },
    // Documents
    cv: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
    cin: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
    degree: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
    birthCertificate: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
    certificateOfResidence: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
    photo: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
    gradeTranscript: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
    // Confirmation
    acceptConditions: { type: Boolean, default: false },
  },
  { timestamps: true } // Ajoute createdAt et updatedAt automatiquement
);
const Register = mongoose.model("Register", registerSchema);
module.exports = Register;
