const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts room information from a blueprint image using Google Gemini Vision
 * @param {string} imageUrl - Public URL of the blueprint image
 * @returns {Promise<Object>} Extracted blueprint data in structured JSON format
 */
async function extractRooms(imageUrl) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const prompt = `You are an expert architect analyzing a floor plan blueprint image. 

Extract ALL visible rooms, their directions, and architectural features from this blueprint.

CRITICAL REQUIREMENTS:
1. You MUST return ONLY valid JSON - no additional text, markdown, or explanations
2. If you cannot determine a direction or room, use "unknown"
3. Do NOT hallucinate - only report what you can clearly see in the image
4. Directions should be: North, South, East, West, Northeast, Northwest, Southeast, Southwest, or "unknown"
5. Look for labels, text annotations, compass indicators, or standard architectural conventions

Return JSON in this EXACT format:
{
  "entrance_direction": "North or East or South or West or Northeast or unknown",
  "rooms": [
    {"name": "Kitchen", "direction": "Southeast or unknown"},
    {"name": "Master Bedroom", "direction": "Southwest or unknown"},
    {"name": "Living Room", "direction": "North or East or unknown"}
  ],
  "toilets": [
    {"direction": "Northeast or unknown"}
  ],
  "special_notes": [
    "Any important observations about the layout, staircase position, pooja room, etc."
  ]
}

IMPORTANT:
- Only include rooms you can clearly identify
- Use lowercase for room names (kitchen, bedroom, living room, etc.)
- If no toilets are visible, return empty array: []
- If entrance direction is unclear, use "unknown"
- Be conservative - better to mark as "unknown" than guess incorrectly

Now analyze the blueprint and return ONLY the JSON object:`;

    console.log('🤖 Calling Google Gemini Vision API...');

    // Fetch the image from URL
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    
    // Determine MIME type from URL or default to jpeg
    let mimeType = 'image/jpeg';
    if (imageUrl.toLowerCase().includes('.png')) mimeType = 'image/png';
    else if (imageUrl.toLowerCase().includes('.pdf')) mimeType = 'application/pdf';
    else if (imageUrl.toLowerCase().includes('.webp')) mimeType = 'image/webp';

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
      }
    });

    // For PDF, we'll need to handle differently, but for images:
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const content = response.text().trim();

    // Try to extract JSON from the response
    let jsonData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        jsonData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response:', content);
      // Return a safe default structure
      jsonData = {
        entrance_direction: 'unknown',
        rooms: [],
        toilets: [],
        special_notes: ['Could not extract blueprint information - please ensure image is clear and contains a floor plan']
      };
    }

    // Validate and ensure required fields exist
    const result = {
      entrance_direction: jsonData.entrance_direction || 'unknown',
      rooms: Array.isArray(jsonData.rooms) ? jsonData.rooms : [],
      toilets: Array.isArray(jsonData.toilets) ? jsonData.toilets : [],
      special_notes: Array.isArray(jsonData.special_notes) ? jsonData.special_notes : []
    };

    // Ensure each room has required fields
    result.rooms = result.rooms.map(room => ({
      name: room.name || 'Unknown Room',
      direction: room.direction || 'unknown'
    }));

    // Ensure each toilet has required fields
    result.toilets = result.toilets.map(toilet => ({
      direction: toilet.direction || 'unknown'
    }));

    return result;

  } catch (error) {
    console.error('Error extracting rooms:', error);
    
    // Return a safe default structure on error
    return {
      entrance_direction: 'unknown',
      rooms: [],
      toilets: [],
      special_notes: [`Error analyzing blueprint: ${error.message}`]
    };
  }
}

module.exports = extractRooms;

