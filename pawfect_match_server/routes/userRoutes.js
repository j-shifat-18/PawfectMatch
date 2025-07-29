const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
} = require("../controllers/userController");

// GET /users - Get users with optional filtering
router.get("/", getUsers);

// POST /users - Create new user
router.post("/", createUser);

// PATCH /users/:email - Update user by email
router.patch("/:email", updateUser);

module.exports = router; 