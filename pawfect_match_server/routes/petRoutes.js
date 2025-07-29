const express = require("express");
const router = express.Router();
const {
  getPetsByOwner,
  getPetById,
  createPet,
  updatePet,
  updatePetAdoptionStatus,
  transferPetOwnership,
} = require("../controllers/petController");

// GET /pets - Get pets by owner email
router.get("/", getPetsByOwner);

// GET /pets/:id - Get pet by ID
router.get("/:id", getPetById);

// POST /pets - Create new pet
router.post("/", createPet);

// PATCH /pets/:id - Update pet info
router.patch("/:id", updatePet);

// PATCH /pets/:id/adoption - Update pet adoption status
router.patch("/:id/adoption", updatePetAdoptionStatus);

// PATCH /pets/:id/transfer - Transfer pet ownership
router.patch("/:id/transfer", transferPetOwnership);

module.exports = router; 