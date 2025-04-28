const asyncHandler = require("express-async-handler");
const express = require("express");
const authRoutes = express.Router();
const auhtContollers = require("../controllers/authController");
const isLoggedIn = require("../middlewares/isLoggedIn");

authRoutes.post("/login", asyncHandler(auhtContollers.login));
authRoutes.get("/me", isLoggedIn, asyncHandler(auhtContollers.getMe));
authRoutes.post("/logout", asyncHandler(auhtContollers.logout));
authRoutes.get(
  "/refresh-token",
  asyncHandler(auhtContollers.refreshAccessToken)
);

// Mot de passe oublié
authRoutes.post("/forgot-password", auhtContollers.forgotPassword);
authRoutes.post("/reset-password/:resetToken", auhtContollers.resetPassword);
module.exports = authRoutes;
