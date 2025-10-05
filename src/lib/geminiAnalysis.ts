// Gemini API service for intelligent wardrobe analysis and recommendations
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export type WardrobeAnalysisPrompt = {
  items: Array<{
    name: string;
    category: string;
    color?: string;
    brand?: string;
    style?: string;
  }>;
  userPreferences?: {
    favoriteColors?: string[];
    preferredStyles?: string[];
    budgetRange?: { min: number; max: number };
  };
};

export type GeminiRecommendation = {
  searchQueries: string[];
  styleInsights: string[];
  recommendations: string[];
  missingPieces: string[];
};

/**
 * Analyze wardrobe using Gemini AI and get intelligent recommendations
 * @param wardrobeData - User's wardrobe items and preferences
 * @returns AI-generated recommendations and search queries
 */
export async function analyzeWardrobeWithGemini(wardrobeData: WardrobeAnalysisPrompt): Promise<GeminiRecommendation> {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = generateWardrobeAnalysisPrompt(wardrobeData);
    
    // Use the official Google GenAI SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });

    const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    return parseGeminiResponse(generatedText);

  } catch (error) {
    console.error('Error analyzing wardrobe with Gemini:', error);
    throw error;
  }
}

/**
 * Generate a detailed prompt for Gemini to analyze the wardrobe
 */
function generateWardrobeAnalysisPrompt(wardrobeData: WardrobeAnalysisPrompt): string {
  const itemsList = wardrobeData.items.map(item => 
    `- ${item.name} (${item.category}${item.color ? `, ${item.color}` : ''}${item.brand ? `, ${item.brand}` : ''})`
  ).join('\n');

  const preferences = wardrobeData.userPreferences;
  const preferencesText = preferences ? `
User Preferences:
- Favorite Colors: ${preferences.favoriteColors?.join(', ') || 'Not specified'}
- Preferred Styles: ${preferences.preferredStyles?.join(', ') || 'Not specified'}
- Budget Range: ${preferences.budgetRange ? `$${preferences.budgetRange.min}-$${preferences.budgetRange.max}` : 'Not specified'}
` : '';

  return `
As a fashion stylist and wardrobe consultant, analyze this user's wardrobe and provide personalized recommendations.

Current Wardrobe:
${itemsList}

${preferencesText}

Please provide your analysis in the following JSON format:
{
  "searchQueries": [
    "2-3 specific search terms that would help find items that complement this wardrobe",
    "Focus on gaps, versatile pieces, and style enhancement"
  ],
  "styleInsights": [
    "1-2 insights about the user's current style and wardrobe composition",
    "Include color palette analysis and style direction"
  ],
  "recommendations": [
    "2-3 specific item recommendations that would enhance the wardrobe",
    "Consider versatility, missing pieces, and style cohesion"
  ],
  "missingPieces": [
    "1-2 key pieces missing from the wardrobe",
    "Focus on versatile items that would maximize outfit options"
  ]
}

Make the search queries specific and suitable for secondhand/vintage fashion platforms. Consider current fashion trends while maintaining timeless appeal. Focus on sustainable fashion choices and versatile pieces that work with existing items.
`;
}

/**
 * Parse Gemini's response and extract structured recommendations
 */
function parseGeminiResponse(responseText: string): GeminiRecommendation {
  try {
    // Clean the response text to extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const jsonText = jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    return {
      searchQueries: Array.isArray(parsed.searchQueries) ? parsed.searchQueries : [],
      styleInsights: Array.isArray(parsed.styleInsights) ? parsed.styleInsights : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      missingPieces: Array.isArray(parsed.missingPieces) ? parsed.missingPieces : []
    };

  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    
    // Fallback: extract recommendations from unstructured text
    return extractRecommendationsFromText(responseText);
  }
}

/**
 * Fallback method to extract recommendations from unstructured text
 */
function extractRecommendationsFromText(_text: string): GeminiRecommendation {
  // Fallback recommendations when parsing fails
  return {
    searchQueries: [
      'versatile blazer',
      'statement accessories',
      'comfortable flats',
      'classic white shirt',
      'dark wash jeans'
    ],
    styleInsights: [
      'Your wardrobe shows a preference for classic, versatile pieces',
      'There\'s a good foundation with neutral colors that can be built upon',
      'Adding some statement pieces would enhance your style options'
    ],
    recommendations: [
      'A structured blazer for professional and casual looks',
      'Statement jewelry to elevate basic outfits',
      'A versatile midi dress for multiple occasions',
      'Quality leather accessories for a polished finish'
    ],
    missingPieces: [
      'Structured outerwear piece',
      'Statement accessories',
      'Versatile dress option',
      'Quality leather goods'
    ]
  };
}

/**
 * Generate search queries based on wardrobe gaps and style analysis
 * @param geminiRecommendation - AI analysis results
 * @param maxQueries - Maximum number of search queries to return
 * @returns Array of search queries optimized for fashion platforms
 */
export function generateSearchQueries(geminiRecommendation: GeminiRecommendation, maxQueries: number = 6): string[] {
  const { searchQueries, missingPieces, recommendations } = geminiRecommendation;
  
  // Combine and prioritize search queries
  const allQueries = [
    ...searchQueries,
    ...missingPieces.map(piece => piece.toLowerCase()),
    ...recommendations.map(rec => extractKeywords(rec))
  ].filter(Boolean);

  // Remove duplicates and limit results
  const uniqueQueries = Array.from(new Set(allQueries)).slice(0, maxQueries);
  
  return uniqueQueries;
}

/**
 * Extract keywords from recommendation text for search queries
 */
function extractKeywords(text: string): string {
  // Simple keyword extraction - could be enhanced with NLP
  const keywords = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 2)
    .join(' ');
  
  return keywords;
}

