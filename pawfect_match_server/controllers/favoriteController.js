const { client } = require("../config/db");

const favoritesCollection = client.db("pawfect_match").collection("favourites");

// Get favorites by user ID
const getFavoritesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const favorites = await favoritesCollection.find({ userId }).toArray();

    // Return only postIds or full post data if you prefer
    res.status(200).json(favorites.map((fav) => fav.postId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add to favorites
const addToFavorites = async (req, res) => {
  try {
    const { userId, postId } = req.body;

    // Validate input
    if (!userId || !postId) {
      return res
        .status(400)
        .json({ error: "userId and postId are required" });
    }

    // Check if already favorited
    const existing = await favoritesCollection.findOne({ userId, postId });
    if (existing) {
      return res.status(400).json({ error: "Already in favorites" });
    }

    await favoritesCollection.insertOne({
      userId,
      postId,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Added to favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
      return res
        .status(400)
        .json({ error: "userId and postId are required" });
    }

    const result = await favoritesCollection.deleteOne({ userId, postId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.status(200).json({ message: "Removed from favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getFavoritesByUser,
  addToFavorites,
  removeFromFavorites,
}; 