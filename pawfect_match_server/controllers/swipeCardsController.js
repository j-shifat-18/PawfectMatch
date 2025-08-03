const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const adoptionPostsCollection = client.db("pawfect_match").collection("adoption-posts");
const favoritesCollection = client.db("pawfect_match").collection("favourites");
const petsCollection = client.db("pawfect_match").collection("pets");

// In-memory storage for user card stacks
const userCardStacks = new Map();

// Get cards for swiping
const getSwipeCards = async (req, res) => {
  try {
    console.log("getSwipeCards called with query:", req.query);
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    console.log("Using userId:", userId);

    // Check if user has an existing stack
    let userStack = userCardStacks.get(userId);
    
    // If no stack exists or stack has 3-4 cards left, create new stack
    if (!userStack || userStack.length <= 4) {
      // Get all available adoption posts with pet info
      const allPosts = await adoptionPostsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      // Get user's existing favorites to avoid showing already favorited cards
      const userFavorites = await favoritesCollection
        .find({ userId })
        .toArray();
      
      const favoritedPostIds = userFavorites.map(fav => fav.postId);

      // Filter out already favorited posts
      const availablePosts = allPosts
        .filter(post => !favoritedPostIds.includes(post._id.toString()));

      // If no posts available, return empty array
      if (availablePosts.length === 0) {
        userCardStacks.set(userId, []);
        return res.status(200).json({
          cards: [],
          remainingCards: 0,
          shouldRestack: false
        });
      }

      // Take first 10 posts and get their pet info
      const postsToShow = availablePosts.slice(0, 10);
      const petIds = postsToShow.map(post => post.petId);
      
      // Get pet information for these posts
      const pets = await petsCollection
        .find({ _id: { $in: petIds.map(id => new ObjectId(id)) } })
        .toArray();
      
      const petMap = {};
      pets.forEach(pet => {
        petMap[pet._id.toString()] = pet;
      });

      // Create new stack with pet info
      userStack = postsToShow.map(post => ({
        ...post,
        _id: post._id.toString(),
        petInfo: petMap[post.petId] || {}
      }));
      
      console.log("Sample post structure:", userStack[0]);
      console.log("Sample petInfo structure:", userStack[0]?.petInfo);
      
      userCardStacks.set(userId, userStack);
    }

    // Return current stack (up to 10 cards)
    const cardsToReturn = userStack.slice(0, 10);
    
    res.status(200).json({
      cards: cardsToReturn,
      remainingCards: userStack.length,
      shouldRestack: userStack.length <= 4
    });

  } catch (error) {
    console.error("Error getting swipe cards:", error);
    res.status(500).json({ error: "Failed to get swipe cards", details: error.message });
  }
};

// Handle card swipe
const handleSwipe = async (req, res) => {
  try {
    const { userId, cardId, direction } = req.body;
    
    if (!userId || !cardId || !direction) {
      return res.status(400).json({ 
        error: "userId, cardId, and direction are required" 
      });
    }

    if (!['left', 'right'].includes(direction)) {
      return res.status(400).json({ 
        error: "direction must be 'left' or 'right'" 
      });
    }

    // Get user's current stack
    let userStack = userCardStacks.get(userId);
    
    if (!userStack) {
      return res.status(404).json({ error: "No active card stack found" });
    }

    // Find the card in the stack
    const cardIndex = userStack.findIndex(card => card._id === cardId);
    
    if (cardIndex === -1) {
      return res.status(404).json({ error: "Card not found in stack" });
    }

    // Remove the card from stack
    userStack.splice(cardIndex, 1);
    userCardStacks.set(userId, userStack);

    // If swiped right, add to favorites
    if (direction === 'right') {
      try {
        console.log("Adding to favorites - userId:", userId, "postId:", cardId);
        // Check if already in favorites
        const existing = await favoritesCollection.findOne({ 
          userId, 
          postId: cardId 
        });
        
        if (!existing) {
          const result = await favoritesCollection.insertOne({
            userId,
            postId: cardId,
            createdAt: new Date(),
          });
          console.log("Added to favorites successfully:", result);
        } else {
          console.log("Already in favorites");
        }
      } catch (favoriteError) {
        console.error("Error adding to favorites:", favoriteError);
        // Don't fail the swipe if favorites fails
      }
    }

    // Check if we need to restack (3-4 cards left)
    const shouldRestack = userStack.length <= 4;
    
    res.status(200).json({
      message: `Card swiped ${direction}`,
      remainingCards: userStack.length,
      shouldRestack,
      addedToFavorites: direction === 'right'
    });

  } catch (error) {
    console.error("Error handling swipe:", error);
    res.status(500).json({ error: "Failed to handle swipe" });
  }
};

module.exports = {
  getSwipeCards,
  handleSwipe,
}; 