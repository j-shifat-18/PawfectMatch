const express = require("express");
const router = express.Router();
const {
  getFavoritesByUser,
  addToFavorites,
  removeFromFavorites,
} = require("../controllers/favoriteController");

// GET /favorites/:userId - Get favorites by user ID
router.get("/:userId", getFavoritesByUser);

// POST /favorites - Add to favorites
router.post("/", addToFavorites);

// DELETE /favorites - Remove from favorites
router.delete("/", removeFromFavorites);

module.exports = router; 