const express = require("express");
const router = express.Router();
const {
  getFavoritesByUser,
  addToFavorites,
  removeFromFavorites,
} = require("../controllers/favoriteController");
const { verifyFBToken } = require("../middlewares/authMiddleware");

// GET /favorites/:userId - Get favorites by user ID
router.get("/:userId",verifyFBToken, getFavoritesByUser);

// POST /favorites - Add to favorites
router.post("/",verifyFBToken, addToFavorites);

// DELETE /favorites - Remove from favorites
router.delete("/",verifyFBToken, removeFromFavorites);

module.exports = router; 