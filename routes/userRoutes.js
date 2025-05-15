const asyncHandler = require("express-async-handler");
const express = require("express");
const checkRole = require("../middlewares/checkRole");
const userRoutes = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");

const userContollers = require("../controllers/userControllers");
userRoutes.get(
  "/",
  isLoggedIn,
  checkRole(["admin", "super_admin"]),
  asyncHandler(userContollers.getAllUsers)
);
userRoutes.get(
  "/candidate",
  isLoggedIn,
  checkRole(["admin", "super_admin"]),
  asyncHandler(userContollers.getAllUsersCandidate)
);
userRoutes.get("/:id", userContollers.getUserById);
userRoutes.post(
  "/register",
  isLoggedIn,
  checkRole(["super_admin"]),
  asyncHandler(userContollers.createUser)
);
userRoutes.put(
  "/update/:id",
  isLoggedIn,
  checkRole(["super_admin"]),
  asyncHandler(userContollers.updateUser)
);
userRoutes.put(
  "/update/candidate/:id",
  isLoggedIn,
  checkRole(["admin", "super_admin"]),
  asyncHandler(userContollers.updateUserCandidate)
);
userRoutes.delete(
  "/delete/:id",
  isLoggedIn,
  checkRole(["super_admin"]),
  userContollers.deleteUser
);
userRoutes.delete(
  "/candidate/:id",
  isLoggedIn,
  checkRole(["super_admin"]),
  asyncHandler(userContollers.deleteUserCandidate)
);
module.exports = userRoutes;
