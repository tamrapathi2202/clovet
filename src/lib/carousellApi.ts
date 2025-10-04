// Carousell API service
const RAPIDAPI_KEY = '878253460dmshe94c23d41a36d08p10d77bjsn453c137f0568';
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
};

export async function searchCarousell(keyword: string, country: string = 'sg'): Promise<CarousellSearchResult[]> {
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
    return transformCarousellData(data);
  } catch (error) {
    console.error('Error fetching from Carousell API:', error);
    throw error;
  }
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
    
    return {
      id: item.id || item.listingID?.toString() || Math.random().toString(36),
      name: item.title || 'Unknown Item',
      price: price,
      currency: currency,
      platform: 'Carousell',
      image_url: imageUrl,
      url: `https://carousell.com/p/${item.listingID}`,
      seller: item.seller,
      description: description
    };
  }).filter(item => item.name !== 'Unknown Item'); // Filter out items without proper data
}