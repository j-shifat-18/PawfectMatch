const { client } = require("../config/db");

const petsCollection = client.db("pawfect_match").collection("pets");
const adoptionPostsCollection = client.db("pawfect_match").collection("adoption-posts");

// Get adoption posts with filtering
const getAdoptionPosts = async (req, res) => {
  try {
    const { search = "", type = "", availability = "" } = req.query;

    // Build query filters for pets
    const petQuery = {};

    if (search) {
      petQuery.name = { $regex: search, $options: "i" };
    }

    if (type) {
      petQuery.type = type;
    }

    if (availability === "available") {
      petQuery.isAdopted = false;
    } else if (availability === "adopted") {
      petQuery.isAdopted = true;
    }

    // Find matching pets
    const matchingPets = await petsCollection.find(petQuery).toArray();
    const matchingPetIds = matchingPets.map((pet) => pet._id.toString());

    // Get adoption posts where petId is in matchingPetIds
    const adoptionPosts = await adoptionPostsCollection
      .find({ petId: { $in: matchingPetIds } })
      .sort({ createdAt: -1 })
      .toArray();

    // Join petInfo into each post
    const petMap = {};
    matchingPets.forEach((pet) => {
      petMap[pet._id.toString()] = pet;
    });

    const result = adoptionPosts.map((post) => ({
      ...post,
      petInfo: petMap[post.petId],
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to fetch adoption posts:", error);
    res.status(500).json({ error: "Failed to fetch adoption posts" });
  }
};

// Create adoption post
const createAdoptionPost = async (req, res) => {
  try {
    const adoptionPost = req.body;
    const result = await adoptionPostsCollection.insertOne(adoptionPost);
    res.send(result);
  } catch (error) {
    console.error("Error creating adoption post:", error);
    res.status(500).json({ error: "Failed to create adoption post" });
  }
};

module.exports = {
  getAdoptionPosts,
  createAdoptionPost,
}; 