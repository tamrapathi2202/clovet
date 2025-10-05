// Carousell API service with caching
const RAPIDAPI_KEY = '486dba2e3cmsh62cf3a0e02ec594p1c21f2jsn6d89d32d6b12';
const RAPIDAPI_HOST = 'carousell.p.rapidapi.com';

export type CarousellSearchResult = {
  id: string;
  name: string;
  price: number;
  currency: string;
  platform: string;
  image_url: string;
  url: string;
  seller?: any;
  description?: string;
  condition?: string;
  size?: string;
  brand?: string;
  posted_date?: string;
  category?: string;
  color?: string;
  material?: string;
  measurements?: {
    bust?: string;
    waist?: string;
    hips?: string;
    length?: string;
  };
};

// Cache for search results
const searchCache = new Map<string, { data: CarousellSearchResult[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function searchCarousell(keyword: string, country: string = 'sg'): Promise<CarousellSearchResult[]> {
  const cacheKey = `${keyword}-${country}`;
  
  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached results for:', keyword);
    return cached.data;
  }

  try {
    const url = `https://carousell.p.rapidapi.com/searchByKeyword?keyword=${encodeURIComponent(keyword)}&country=${country}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const transformedData = transformCarousellData(data);
    
    // Cache the results
    searchCache.set(cacheKey, {
      data: transformedData,
      timestamp: Date.now()
    });
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching from Carousell API:', error);
    throw error;
  }
}

// Get a specific product by ID from cache or API
export function getCarousellProduct(productId: string): CarousellSearchResult | null {
  // Search through all cached results for the product
  for (const [, cacheEntry] of searchCache) {
    const product = cacheEntry.data.find(item => item.id === productId);
    if (product) {
      return product;
    }
  }
  return null;
}

// Clear cache
export function clearSearchCache() {
  searchCache.clear();
}

// Transform Carousell API response to match your SearchResult type
function transformCarousellData(carousellItems: any[]): CarousellSearchResult[] {
  if (!Array.isArray(carousellItems)) {
    console.warn('Expected array but got:', typeof carousellItems);
    return [];
  }

  return carousellItems.map((item: any) => {
    // Extract price from the string (e.g., "S$300" -> 300)
    const priceMatch = item.price?.match(/\d+/);
    const price = priceMatch ? parseInt(priceMatch[0]) : 0;
    
    // Extract currency from the string (e.g., "S$300" -> "SGD")
    const currency = item.price?.startsWith('S$') ? 'SGD' : 'USD';
    
    // Get image URL from media array
    const imageUrl = item.media?.[0]?.photoItem?.url || item.thumbnailURL || '';
    
    // Get description from belowFold array
    const description = item.belowFold?.find((fold: any) => fold.component === 'paragraph')?.stringContent || '';
    
    // Extract additional details
    const sizeInfo = item.belowFold?.find((fold: any) => 
      fold.stringContent?.toLowerCase().includes('size:') || 
      fold.stringContent?.toLowerCase().includes('eu ') ||
      fold.stringContent?.toLowerCase().includes('uk ') ||
      fold.stringContent?.toLowerCase().includes('us ')
    )?.stringContent;
    
    // Extract condition info
    const conditionInfo = item.belowFold?.find((fold: any) => 
      fold.stringContent?.toLowerCase().includes('condition') ||
      fold.stringContent?.toLowerCase().includes('new') ||
      fold.stringContent?.toLowerCase().includes('used') ||
      fold.stringContent?.toLowerCase().includes('like new')
    )?.stringContent;

    return {
      id: item.id || item.listingID?.toString() || Math.random().toString(36),
      name: item.title || 'Unknown Item',
      price: price,
      currency: currency,
      platform: 'Carousell',
      image_url: imageUrl,
      url: `https://carousell.com/p/${item.listingID}`,
      seller: item.seller?.username || item.seller?.firstName || 'Unknown Seller',
      description: description,
      condition: conditionInfo || 'Good',
      size: sizeInfo || 'One Size',
      brand: extractBrand(item.title || ''),
      posted_date: item.aboveFold?.[0]?.timestampContent ? 
        new Date(item.aboveFold[0].timestampContent.seconds.low * 1000).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
      category: categorizeItem(item.title || ''),
      color: extractColor(item.title || ''),
      material: extractMaterial(description)
    };
  }).filter(item => item.name !== 'Unknown Item'); // Filter out items without proper data
}

// Helper functions for extracting additional details
function extractBrand(title: string): string {
  const brands = ['Armani', 'Exchange', 'COS', 'HAV', 'Mazie', 'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo'];
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return 'Unknown Brand';
}

function categorizeItem(title: string): string {
  const categories = {
    'jacket': 'Outerwear',
    'blazer': 'Outerwear', 
    'coat': 'Outerwear',
    'sweater': 'Knitwear',
    'jumper': 'Knitwear',
    'shirt': 'Tops',
    'blouse': 'Tops',
    'tee': 'Tops',
    'dress': 'Dresses',
    'pants': 'Bottoms',
    'jeans': 'Bottoms',
    'trousers': 'Bottoms'
  };
  
  for (const [keyword, category] of Object.entries(categories)) {
    if (title.toLowerCase().includes(keyword)) {
      return category;
    }
  }
  return 'Clothing';
}

function extractColor(title: string): string {
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'brown', 'gray', 'grey', 'navy', 'cream'];
  for (const color of colors) {
    if (title.toLowerCase().includes(color)) {
      return color.charAt(0).toUpperCase() + color.slice(1);
    }
  }
  return 'Unknown';
}

function extractMaterial(description: string): string {
  const materials = ['leather', 'cotton', 'wool', 'silk', 'polyester', 'denim', 'linen', 'cashmere'];
  for (const material of materials) {
    if (description.toLowerCase().includes(material)) {
      return material.charAt(0).toUpperCase() + material.slice(1);
    }
  }
  return 'Mixed Materials';
}