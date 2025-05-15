const mongoose = require("mongoose");
// Définition du schéma pour un élément de register
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    level: { type: String, enum: ["Licence", "Master"], required: true },
    year: {
      type: String,
      enum: ["L1", "L2", "L3", "M1", "M2"],
      required: true,
    },
    semester: {
      type: String,
      enum: ["S1", "S2", "S3", "S4", "S5", "S6"],
      required: true,
    },
    track: { type: String, enum: ["BEL", "BEN"], required: true },
    // Documents
    file: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
  },
  { timestamps: true } // Ajoute createdAt et updatedAt automatiquement
);
const Cours = mongoose.model("Cours", courseSchema);
module.exports = Cours;
