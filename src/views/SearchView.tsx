import { useState } from 'react';
import { Search, Sparkles, Filter, Heart, AlertCircle } from 'lucide-react';
import { searchCarousell, type CarousellSearchResult } from '../lib/carousellApi';

type SearchResult = CarousellSearchResult;

type SearchViewProps = {
  onProductClick: (productId: string) => void;
};

export default function SearchView({ onProductClick }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCheckCloset, setShowCheckCloset] = useState(false);
  const [similarItemsInCloset, setSimilarItemsInCloset] = useState(3);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowCheckCloset(false);
    setError(null);

    try {
      // Call the Carousell API
      const carousellResults = await searchCarousell(searchQuery.trim());
      
      // Check if user is searching for items they might already have
      if (searchQuery.toLowerCase().includes('black blazer') ||
          searchQuery.toLowerCase().includes('blazer')) {
        setShowCheckCloset(true);
        setSimilarItemsInCloset(3);
      }

      setResults(carousellResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      
      // Fallback to mock data if API fails
      setResults([
        {
          id: '1',
          name: 'Linen Pants',
          price: 20,
          currency: 'USD',
          platform: 'Depop',
          image_url: 'https://images.pexels.com/photos/5865474/pexels-photo-5865474.jpeg?auto=compress&cs=tinysrgb&w=800',
          url: '#',
        },
        {
          id: '2',
          name: 'Cream Beach Sweater',
          price: 43,
          currency: 'USD',
          platform: 'Poshmark',
          image_url: 'https://images.pexels.com/photos/5865527/pexels-photo-5865527.jpeg?auto=compress&cs=tinysrgb&w=800',
          url: '#',
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const platforms = ['All', 'Carousell', 'Depop', 'Poshmark', 'ThredUp', 'Vestiaire', 'eBay'];
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  // Filter results based on selected platform
  const filteredResults = selectedPlatform === 'All' 
    ? results 
    : results.filter(item => item.platform === selectedPlatform);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Style Semantics Search</h2>
        <p className="text-slate-600">
          Search with natural language or trendy references
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try "coastal granddaughter core" or "vintage leather jacket"'
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-slate-900 placeholder-slate-400"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedPlatform === platform
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Search Error</h3>
              <p className="text-sm text-slate-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showCheckCloset && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Check Your Closet</h3>
              <p className="text-sm text-slate-700">
                You have <strong>{similarItemsInCloset} similar items</strong> in your wardrobe. Are you sure you need another?
              </p>
              <button className="text-sm font-medium text-amber-700 hover:text-amber-800 mt-2 underline">
                View similar items
              </button>
            </div>
          </div>
        </div>
      )}

      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <Sparkles className="w-12 h-12 text-slate-400 animate-pulse" />
          </div>
          <p className="text-slate-600 mt-4">Searching across platforms...</p>
        </div>
      ) : filteredResults.length === 0 && results.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Start Your Search
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Use natural language to describe what you're looking for. Try "coastal granddaughter core" or "vintage leather jacket"
          </p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Results Found
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            No items found for "{selectedPlatform}". Try selecting "All" platforms or a different platform.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600">
              Top <strong>{filteredResults.length}</strong> results
              {selectedPlatform !== 'All' && ` from ${selectedPlatform}`}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Sparkles className="w-4 h-4" />
              <span>Sorted by relevance</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => onProductClick(item.id)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group cursor-pointer"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      // Fallback image if the original fails to load
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition"
                    >
                      <Heart className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <span className="text-xs text-white font-medium bg-slate-900 bg-opacity-50 px-2 py-1 rounded">
                      {item.platform}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-slate-900 text-sm mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold text-slate-900">
                    {item.currency === 'SGD' ? 'S$' : '$'}{item.price}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{item.currency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}







