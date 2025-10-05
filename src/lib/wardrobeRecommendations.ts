// Wardrobe-based recommendation service
import { supabase, WardrobeItem } from './supabase';
import { searchCarousell, CarousellSearchResult } from './carousellApi';

export type WardrobeFeatureAnalysis = {
  topColors: string[];
  topCategories: string[];
  topBrands: string[];
  commonStyles: string[];
};

export type RecommendationCache = {
  data: CarousellSearchResult[];
  timestamp: number;
  features: WardrobeFeatureAnalysis;
};

// Cache for recommendations (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let recommendationCache: RecommendationCache | null = null;

/**
 * Analyze user's wardrobe to find top features
 * @param userId - User ID
 * @returns Analysis of wardrobe features
 */
export async function analyzeWardrobeFeatures(userId: string): Promise<WardrobeFeatureAnalysis> {
  try {
    const { data: wardrobeItems } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId);

    if (!wardrobeItems || wardrobeItems.length === 0) {
      // Default recommendations for empty wardrobe
      return {
        topColors: ['Black', 'White', 'Blue'],
        topCategories: ['Tops', 'Bottoms', 'Dresses'],
        topBrands: [],
        commonStyles: ['Casual', 'Classic', 'Modern']
      };
    }

    // Count occurrences of each feature
    const colorCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};

    wardrobeItems.forEach((item: WardrobeItem) => {
      // Count colors
      if (item.color) {
        colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
      }
      
      // Count categories
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
      
      // Count brands
      if (item.brand) {
        brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
      }
    });

    // Get top 3 of each feature
    const topColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color);

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const topBrands = Object.entries(brandCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([brand]) => brand);

    return {
      topColors: topColors.length > 0 ? topColors : ['Black', 'White', 'Blue'],
      topCategories: topCategories.length > 0 ? topCategories : ['Tops', 'Bottoms', 'Dresses'],
      topBrands,
      commonStyles: ['Casual', 'Classic', 'Modern'] // TODO: Enhance with actual style analysis
    };
  } catch (error) {
    console.error('Error analyzing wardrobe features:', error);
    return {
      topColors: ['Black', 'White', 'Blue'],
      topCategories: ['Tops', 'Bottoms', 'Dresses'],
      topBrands: [],
      commonStyles: ['Casual', 'Classic', 'Modern']
    };
  }
}

/**
 * Generate personalized recommendations based on wardrobe analysis
 * @param userId - User ID
 * @param forceRefresh - Force refresh cache
 * @returns Array of recommended items
 */
export async function generatePersonalizedRecommendations(
  userId: string, 
  forceRefresh: boolean = false
): Promise<CarousellSearchResult[]> {
  // Check cache first
  if (!forceRefresh && recommendationCache && 
      Date.now() - recommendationCache.timestamp < CACHE_DURATION) {
    console.log('Returning cached recommendations');
    return recommendationCache.data;
  }

  try {
    console.log('Generating new personalized recommendations for user:', userId);
    
    // Analyze wardrobe features
    const features = await analyzeWardrobeFeatures(userId);
    console.log('Wardrobe analysis:', features);

    const allRecommendations: CarousellSearchResult[] = [];

    // Search based on top colors and categories
    const searchQueries = generateSearchQueries(features);
    console.log('Generated search queries:', searchQueries);

    // Execute searches for each query (limit to avoid API overload)
    for (const query of searchQueries.slice(0, 3)) {
      try {
        const results = await searchCarousell(query);
        // Take first 3-4 results from each search
        allRecommendations.push(...results.slice(0, 4));
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
      }
    }

    // Remove duplicates and limit results
    const uniqueRecommendations = removeDuplicates(allRecommendations).slice(0, 12);

    // Cache the results
    recommendationCache = {
      data: uniqueRecommendations,
      timestamp: Date.now(),
      features
    };

    console.log(`Generated ${uniqueRecommendations.length} personalized recommendations`);
    return uniqueRecommendations;

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

/**
 * Generate search queries based on wardrobe features
 */
function generateSearchQueries(features: WardrobeFeatureAnalysis): string[] {
  const queries: string[] = [];

  // Combine colors with categories
  features.topColors.forEach(color => {
    features.topCategories.forEach(category => {
      queries.push(`${color.toLowerCase()} ${category.toLowerCase()}`);
    });
  });

  // Add brand-specific searches
  features.topBrands.forEach(brand => {
    queries.push(brand.toLowerCase());
  });

  // Add style-based searches
  features.commonStyles.forEach(style => {
    queries.push(`${style.toLowerCase()} clothing`);
  });

  // Add complementary color searches
  const complementaryColors = getComplementaryColors(features.topColors);
  complementaryColors.forEach(color => {
    queries.push(`${color.toLowerCase()} accessories`);
  });

  return queries;
}

/**
 * Get complementary colors for recommendations
 */
function getComplementaryColors(topColors: string[]): string[] {
  const colorComplements: Record<string, string> = {
    'Black': 'White',
    'White': 'Black',
    'Blue': 'Orange',
    'Red': 'Green',
    'Green': 'Red',
    'Yellow': 'Purple',
    'Purple': 'Yellow',
    'Pink': 'Green',
    'Brown': 'Blue',
    'Gray': 'Yellow',
    'Navy': 'Gold',
    'Beige': 'Navy'
  };

  return topColors
    .map(color => colorComplements[color])
    .filter(Boolean)
    .slice(0, 2);
}

/**
 * Remove duplicate items from recommendations
 */
function removeDuplicates(items: CarousellSearchResult[]): CarousellSearchResult[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = `${item.name}-${item.price}-${item.platform}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Get cached wardrobe features without regenerating recommendations
 */
export function getCachedWardrobeFeatures(): WardrobeFeatureAnalysis | null {
  return recommendationCache?.features || null;
}

/**
 * Clear recommendation cache
 */
export function clearRecommendationCache(): void {
  recommendationCache = null;
}