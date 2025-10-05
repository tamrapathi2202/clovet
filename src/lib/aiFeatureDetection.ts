// AI Model API service for clothing feature detection
const AI_MODEL_API_URL = import.meta.env.VITE_ML_MODEL_API_URL 

export type ClothingFeatures = {
  color: string;
  style: string;
  type: string;
};

export type FeatureDetectionResult = {
  success: boolean;
  features?: ClothingFeatures;
  error?: string;
};

/**
 * Analyze uploaded clothing image using AI model to detect features
 * @param file - The image file to analyze
 * @returns Promise with detected features or error
 */
export async function detectClothingFeatures(file: File): Promise<FeatureDetectionResult> {
  try {
    // Check if API URL is configured
    if (!AI_MODEL_API_URL || AI_MODEL_API_URL === 'YOUR_ML_MODEL_API_URL') {
      return {
        success: false,
        error: 'AI model API URL not configured. Please add VITE_ML_MODEL_API_URL to your .env file (e.g., http://localhost:5000/predict)'
      };
    }
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please provide a valid image file'
      };
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);

    // Call AI model API
    const response = await fetch(AI_MODEL_API_URL, {
      method: 'POST',
      body: formData,
      // Add mode to handle CORS if needed
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    // Validate response structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format from AI model');
    }

    // Extract features with fallbacks
    const features: ClothingFeatures = {
      color: result.color || 'Unknown',
      style: result.style || 'Casual',
      type: result.type || 'Other'
    };

    return {
      success: true,
      features
    };

  } catch (error) {
    console.error('Error detecting clothing features:', error);
    
    // Return specific error messages for common issues
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: `Unable to connect to AI model at ${AI_MODEL_API_URL}. Please check: 1) Model server is running, 2) CORS is enabled on the server, 3) URL is correct in your .env file`
      };
    }

    // Handle CORS errors specifically
    if (error instanceof TypeError && (error.message.includes('CORS') || error.message.includes('cross-origin'))) {
      return {
        success: false,
        error: `CORS error: AI model server at ${AI_MODEL_API_URL} needs to allow requests from your app. Please enable CORS headers`
      };
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      return {
        success: false,
        error: `Network error: Cannot reach AI model server at ${AI_MODEL_API_URL}. Please check if the server is running and accessible`
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image features'
    };
  }
}

/**
 * Map AI model clothing types to wardrobe categories
 * @param aiType - Type detected by AI model
 * @returns Wardrobe category
 */
export function mapAITypeToCategory(aiType: string): string {
  const typeMapping: Record<string, string> = {
    'Shirts': 'Tops',
    'T-Shirts': 'Tops',
    'Blouses': 'Tops',
    'Tank Tops': 'Tops',
    'Sweaters': 'Tops',
    'Hoodies': 'Tops',
    'Top': 'Tops',
    'Jeans': 'Bottoms',
    'Pants': 'Bottoms',
    'Trousers': 'Bottoms',
    'Shorts': 'Bottoms',
    'Skirts': 'Bottoms',
    'Leggings': 'Bottoms',
    'Dresses': 'Dresses',
    'Gowns': 'Dresses',
    'Sundresses': 'Dresses',
    'Jackets': 'Outerwear',
    'Coats': 'Outerwear',
    'Blazers': 'Outerwear',
    'Cardigans': 'Outerwear',
    'Vests': 'Outerwear',
    'Sneakers': 'Shoes',
    'Boots': 'Shoes',
    'Heels': 'Shoes',
    'Flats': 'Shoes',
    'Sandals': 'Shoes',
    'Loafers': 'Shoes',
  };

  return typeMapping[aiType] || 'Accessories';
}

/**
 * Normalize color names for consistency
 * @param aiColor - Color detected by AI model
 * @returns Standardized color name
 */
export function normalizeColor(aiColor: string): string {
  const colorMapping: Record<string, string> = {
    'white': 'White',
    'black': 'Black',
    'gray': 'Gray',
    'grey': 'Gray',
    'navy': 'Navy',
    'blue': 'Blue',
    'red': 'Red',
    'pink': 'Pink',
    'green': 'Green',
    'yellow': 'Yellow',
    'brown': 'Brown',
    'beige': 'Beige',
    'cream': 'Beige',
    'tan': 'Brown',
    'orange': 'Red', // Map orange to red as fallback
    'purple': 'Pink', // Map purple to pink as fallback
    'violet': 'Pink'
  };

  const lowerColor = aiColor.toLowerCase().trim();
  return colorMapping[lowerColor] || aiColor;
}