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
const { verifyFBToken } = require("../middlewares/authMiddleware");

// GET /pets - Get pets by owner email
router.get("/",verifyFBToken, getPetsByOwner);

// GET /pets/:id - Get pet by ID
router.get("/:id",verifyFBToken, getPetById);

// POST /pets - Create new pet
router.post("/",verifyFBToken, createPet);

// PATCH /pets/:id - Update pet info
router.patch("/:id",verifyFBToken, updatePet);

// PATCH /pets/:id/adoption - Update pet adoption status
router.patch("/:id/adoption",verifyFBToken, updatePetAdoptionStatus);

// PATCH /pets/:id/transfer - Transfer pet ownership
router.patch("/:id/transfer",verifyFBToken, transferPetOwnership);

module.exports = router; 