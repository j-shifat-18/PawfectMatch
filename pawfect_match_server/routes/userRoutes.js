const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
} = require("../controllers/userController");
const { verifyFBToken } = require("../middlewares/authMiddleware");
const { verifyAdmin } = require("../middlewares/verifyAdmin");

// GET /users - Get users with optional filtering
router.get("/",verifyFBToken ,verifyAdmin , getUsers);

// POST /users - Create new user
router.post("/", createUser);

// PATCH /users/:email - Update user by email
router.patch("/:email",verifyFBToken, updateUser);

module.exports = router; 