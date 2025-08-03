const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google GenAI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const autoDetectPetInfo = async (req, res) => {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Google API key not configured"
      });
    }

    const { imageData, mimeType } = req.body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ 
        success: false, 
        message: "Image data and mime type are required" 
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this pet image and extract the following information in JSON format:
    {
      "type": "animal type (dog, cat, etc.)",
      "breed": "specific breed if identifiable",
      "color": "primary color(s)",
      "gender": "male or female if identifiable",
      "age": "estimated age in years",
      "weight": "estimated weight if possible",
      "grooming_needs": "low, moderate, or high based on breed characteristics",
      "exercise_needs": "low, moderate, or high based on breed and age",
      "noise_level": "low, moderate, or high based on breed characteristics"
    }
    
    For grooming_needs, exercise_needs, and noise_level, choose one of: "low", "moderate", "high".
    Only return the JSON object, no additional text.`;

    // Generate content from image
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageData,
        },
      },
      { text: prompt }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean the response - remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    // Parse the JSON response
    const petInfo = JSON.parse(cleanText);

    res.json({
      success: true,
      data: petInfo
    });

  } catch (error) {
    console.error("AI detection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to detect pet information",
      error: error.message
    });
  }
};

const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const usersCollection = client.db("pawfect_match").collection("users");
const petsCollection = client.db("pawfect_match").collection("pets");
const adoptionPostsCollection = client.db("pawfect_match").collection("adoption-posts");

const getAIMatches = async (req, res) => {
  try {
    console.log("getAIMatches called with query:", req.query);
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    console.log("Using userId:", userId);

    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Google API key not configured"
      });
    }

    // Get user preferences - try both email and uid
    let user = await usersCollection.findOne({ email: userId });
    if (!user) {
      user = await usersCollection.findOne({ uid: userId });
    }
    if (!user || !user.preferences) {
      return res.status(404).json({ 
        error: "User preferences not found. Please set your preferences first." 
      });
    }

    // Get random 20 pets with their adoption posts
    const allPets = await petsCollection.find({}).toArray();
    const randomPets = allPets.sort(() => Math.random() - 0.5).slice(0, 20);
    
    // Get adoption posts for these pets
    const petIds = randomPets.map(pet => pet._id.toString());
    const adoptionPosts = await adoptionPostsCollection
      .find({ petId: { $in: petIds } })
      .toArray();

    // Create pet map
    const petMap = {};
    randomPets.forEach(pet => {
      petMap[pet._id.toString()] = pet;
    });

    // Combine pet info with adoption posts
    const petsWithPosts = adoptionPosts.map(post => ({
      ...post,
      petInfo: petMap[post.petId] || {}
    }));

    // Prepare data for AI
    const petsData = petsWithPosts.map(pet => ({
      name: pet.petInfo.name || "Unknown",
      type: pet.petInfo.type || "Unknown",
      breed: pet.petInfo.breed || "Unknown",
      age: pet.petInfo.age || "Unknown",
      gender: pet.petInfo.gender || "Unknown",
      color: pet.petInfo.color || "Unknown",
      weight: pet.petInfo.weight || "Unknown",
      description: pet.description || "No description",
      vaccinated: pet.petInfo.vaccinated || false,
      isListedForAdoption: pet.petInfo.isListedForAdoption || false
    }));

    const userPrefs = user.preferences;
    
    // Create prompt for AI
    const prompt = `You are a pet matching expert. Based on the user's preferences, select the top 3 most suitable pets from the given list.

User Preferences:
- Species: ${userPrefs.species?.join(', ') || 'Any'}
- Size: ${userPrefs.size || 'Any'}
- Noise tolerance: ${userPrefs.noise_tolerance || 'Any'}
- Grooming tolerance: ${userPrefs.grooming_tolerance || 'Any'}
- Indoor only: ${userPrefs.indoor_only ? 'Yes' : 'No'}
- Activity level: ${user.activity_level || 'Any'}
- Pet experience: ${user.pet_experience || 'Any'}
- Living situation: ${user.living_situation || 'Any'}
- Has kids: ${user.has_kids ? 'Yes' : 'No'}
- Budget: ${user.budget || 'Any'}

Available Pets:
${petsData.map((pet, index) => `
${index + 1}. ${pet.name} (${pet.breed})
   - Type: ${pet.type}
   - Age: ${pet.age} years
   - Gender: ${pet.gender}
   - Color: ${pet.color}
   - Weight: ${pet.weight}
   - Vaccinated: ${pet.vaccinated ? 'Yes' : 'No'}
   - Description: ${pet.description}
`).join('')}

Please select the top 3 pets that best match the user's preferences. Consider factors like:
- Species compatibility with user's preferred species
- Size appropriateness for their living situation
- Activity level compatibility
- Experience level requirements
- Budget considerations
- Family situation (kids, other pets)

Return only the numbers of the top 3 pets (e.g., "1, 3, 7") and a brief explanation for each choice.`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract pet numbers
    const lines = text.split('\n');
    const petNumbers = [];
    const explanations = [];

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        const number = parseInt(line.match(/^(\d+)/)[1]);
        if (number >= 1 && number <= petsData.length) {
          petNumbers.push(number - 1); // Convert to 0-based index
        }
      }
    }

    // Get the top 3 matched pets
    const matchedPets = petNumbers.slice(0, 3).map(index => petsWithPosts[index]).filter(Boolean);

    res.json({
      success: true,
      matchedPets,
      explanation: text,
      totalPetsConsidered: petsData.length
    });

  } catch (error) {
    console.error("AI matching error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI matches",
      error: error.message
    });
  }
};

module.exports = {
  autoDetectPetInfo,
  getAIMatches
}; 