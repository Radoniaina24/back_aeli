const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Générer une clé sécurisée en base64
const secretKey = crypto.randomBytes(64).toString("base64");

// Définir le chemin du fichier .env
const envPath = path.join(__dirname, ".env");

// Vérifier si le fichier .env existe déjà
if (fs.existsSync(envPath)) {
  // Ajouter ou mettre à jour la clé JWT_SECRET
  let envContent = fs.readFileSync(envPath, "utf8");

  if (envContent.includes("JWT_SECRET=")) {
    envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${secretKey}`);
  } else {
    envContent += `\nJWT_SECRET=${secretKey}`;
  }

  fs.writeFileSync(envPath, envContent);
} else {
  // Créer un nouveau fichier .env avec la clé
  fs.writeFileSync(envPath, `JWT_SECRET=${secretKey}\n`);
}

console.log("✅ Clé JWT générée et ajoutée au fichier .env avec succès !");
