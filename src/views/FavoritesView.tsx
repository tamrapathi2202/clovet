import { useState, useEffect } from 'react';
import { Heart, Loader2, ShoppingCart, Wand2 } from 'lucide-react';
import { supabase, FavoriteItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type FavoritesViewProps = {
  onProductClick: (productId: string) => void;
  onVirtualTryOnClick: (favorites: FavoriteItem[]) => void;
};

export default function FavoritesView({ onProductClick, onVirtualTryOnClick }: FavoritesViewProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFavorites(favorites.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const platforms = ['All', 'Depop', 'Poshmark', 'ThredUp', 'Vestiaire', 'eBay'].map(platform => (
    <span key={platform} style={{ color: 'rgba(255, 251, 247, 1)',   }}>{platform}</span>
  ));
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  const filteredFavorites = selectedPlatform === 'All'
    ? favorites
    : favorites.filter(item => item.platform === selectedPlatform);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 whitecolor"  >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>Favorites</h2>
        <p className="text-slate-600" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.75rem' }}>
          {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6" style={{backgroundColor: 'rgba(255, 251, 247, 1)'}}>
        {platforms.map((platform) => (
        <button
  key={platform}
  onClick={() => setSelectedPlatform(platform)}
  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition"
  style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)' }}
>
  {platform}
</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-20" >
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2" style={{    color: 'rgb(45, 80, 22)' }}>
            {selectedPlatform === 'All' ? 'No favorites yet' : `No favorites from ${selectedPlatform}`}
          </h3>
          <p className="text-slate-600 mb-6" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.5rem' }}>
            Start saving items you love while browsing
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 border rounded-xl p-4" style={{ backgroundColor: 'rgb(248, 242, 237)', borderColor: 'rgb(45, 80, 22)' }}>
  <div className="flex items-start gap-3">
    <Wand2 className="w-5 h-5 mt-0.5 orangecolor"   />
    <div>
      <h3 className="font-semibold text-slate-900 mb-1" style={{    color: 'rgb(45, 80, 22)' }}>AI Mix & Match</h3>
      <p className="text-sm text-slate-700 mb-3" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', background: 'rgb(248, 242, 237)', borderColor: 'rgb(45, 80, 22)', fontSize: '1.40rem' }}>
        Create outfits with your favorites and see how they look on you
      </p>
      <button 
        onClick={() => onVirtualTryOnClick(favorites)}
        className="text-sm font-medium px-4 py-2 rounded-lg transition"
        style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)' }}
      >
        Try Virtual Try-On
      </button>
    </div>
  </div>
</div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                onClick={() => onProductClick(item.external_id)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group cursor-pointer"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(item.id);
                      }}
                      className="bg-red-500 bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition"
                    >
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <span className="text-xs text-white font-medium bg-slate-900 bg-opacity-50 px-2 py-1 rounded">
                      {item.platform}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-slate-900 text-sm mb-1 line-clamp-2" style={{    color: 'rgb(45 80 22)' }}>
                    {item.item_name}
                  </h3>
                  <p className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(242, 109, 22)', fontSize: '1.75rem' }}>
                    ${item.price}
                  </p>
                  <p className="text-xs text-slate-500 mt-1" style={{    color: 'rgb(45, 80, 22)', fontSize: '1rem' }}>{item.currency}</p>
                  {item.seller && (
                    <p className="text-xs text-slate-400 mt-1" style={{    color: 'rgb(45, 80, 22)', fontSize: '1rem' }}>by {item.seller}</p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.url, '_blank');
                    }}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium transition"
                    style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)' }}
                  >

  <ShoppingCart className="w-4 h-4" style={{ color: 'rgb(248, 242, 237)' }} />
  View Listing
</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
