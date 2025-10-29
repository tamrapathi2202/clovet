// ===============================================================
// 🌟 AI Model API Service - Clothing Feature Detection
// ===============================================================

const AI_MODEL_API_URL = import.meta.env.VITE_ML_MODEL_API_URL || "http://127.0.0.1:5000/predict";

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
 * @param file - Image file to analyze
 */
export async function detectClothingFeatures(file: File): Promise<FeatureDetectionResult> {
  try {
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Please upload a valid image file." };
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(AI_MODEL_API_URL, {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    const features: ClothingFeatures = {
      color: result.color || "Unknown",
      style: result.style || "Casual",
      type: result.type || "Other",
    };

    return { success: true, features };
  } catch (error: any) {
    console.error("⚠️ AI Model Fetch Error:", error);

    if (error.message.includes("fetch")) {
      return {
        success: false,
        error: `Failed to connect to AI model at ${AI_MODEL_API_URL}. 
Make sure your Flask server is running and CORS is enabled.`,
      };
    }

    return { success: false, error: error.message || "Unknown error occurred" };
  }
}

/** Map AI clothing type to wardrobe category */
export function mapAITypeToCategory(aiType: string): string {
  const mapping: Record<string, string> = {
    Shirts: "Tops",
    "T-Shirts": "Tops",
    Blouses: "Tops",
    "Tank Tops": "Tops",
    Sweaters: "Tops",
    Hoodies: "Tops",
    Top: "Tops",
    Jeans: "Bottoms",
    Pants: "Bottoms",
    Trousers: "Bottoms",
    Shorts: "Bottoms",
    Skirts: "Bottoms",
    Leggings: "Bottoms",
    Dresses: "Dresses",
    Gowns: "Dresses",
    Sundresses: "Dresses",
    Jackets: "Outerwear",
    Coats: "Outerwear",
    Blazers: "Outerwear",
    Cardigans: "Outerwear",
    Vests: "Outerwear",
    Sneakers: "Shoes",
    Boots: "Shoes",
    Heels: "Shoes",
    Flats: "Shoes",
    Sandals: "Shoes",
    Loafers: "Shoes",
  };

  return mapping[aiType] || "Accessories";
}

/** Normalize color names */
export function normalizeColor(aiColor: string): string {
  const mapping: Record<string, string> = {
    white: "White",
    black: "Black",
    gray: "Gray",
    grey: "Gray",
    navy: "Navy",
    blue: "Blue",
    red: "Red",
    pink: "Pink",
    green: "Green",
    yellow: "Yellow",
    brown: "Brown",
    beige: "Beige",
    cream: "Beige",
    tan: "Brown",
    orange: "Red",
    purple: "Pink",
    violet: "Pink",
  };

  const key = aiColor.toLowerCase().trim();
  return mapping[key] || aiColor;
}
