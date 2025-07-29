const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const petsCollection = client.db("pawfect_match").collection("pets");

// Get pets by owner email
const getPetsByOwner = async (req, res) => {
  try {
    const { ownerEmail } = req.query;
    const pets = await petsCollection.find({ ownerEmail }).toArray();
    res.json(pets);
  } catch (err) {
    console.error("Error fetching pets:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get pet by ID
const getPetById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid pet ID" });
    }

    const pet = await petsCollection.findOne({ _id: new ObjectId(id) });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    res.send(pet);
  } catch (error) {
    console.error("Failed to fetch pet by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new pet
const createPet = async (req, res) => {
  try {
    const pet = req.body;
    pet.createdAt = new Date();
    const result = await petsCollection.insertOne(pet);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error creating pet:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update pet info
const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await petsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    res.json(result);
  } catch (err) {
    console.error("Error updating pet:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update pet adoption status
const updatePetAdoptionStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { isListedForAdoption } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid pet ID" });
    }

    const result = await petsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isListedForAdoption: isListedForAdoption,
        },
      }
    );

    res.send(result);
  } catch (error) {
    console.error("Error updating pet adoption status:", error);
    res.status(500).json({ error: "Failed to update pet adoption status" });
  }
};

// Transfer pet ownership
const transferPetOwnership = async (req, res) => {
  const { id } = req.params;
  const { newOwnerEmail } = req.body;

  try {
    const result = await petsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ownerEmail: newOwnerEmail,
          listed: false,
        },
      }
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to transfer pet ownership" });
  }
};

module.exports = {
  getPetsByOwner,
  getPetById,
  createPet,
  updatePet,
  updatePetAdoptionStatus,
  transferPetOwnership,
}; 