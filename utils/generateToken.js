const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const secretKey = crypto.randomBytes(64).toString("base64");
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "3d" });
}
function generateRefreshToken(id) {
  return jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "7d" });
}
module.exports = { generateToken, generateRefreshToken };
