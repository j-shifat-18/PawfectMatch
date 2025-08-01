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

module.exports = {
  autoDetectPetInfo
}; 