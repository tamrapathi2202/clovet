import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { supabase, StyleBundle } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type RecommendedItem = {
  id: string;
  name: string;
  price: number;
  currency: string;
  platform: string;
  image_url: string;
  url: string;
};

type HomeViewProps = {
  onProductClick: (productId: string) => void;
};

function Heart({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

export default function HomeView({ onProductClick }: HomeViewProps) {
  const [bundles, setBundles] = useState<StyleBundle[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPersonalizedContent();
    }
  }, [user]);

  const loadPersonalizedContent = async () => {
    try {
      const { data: bundlesData } = await supabase
        .from('style_bundles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setBundles(bundlesData || []);

      setRecommendations([
        {
          id: '1',
          name: 'Ralph Lauren Cable Knit',
          price: 36,
          currency: 'USD',
          platform: 'Depop',
          image_url: 'https://images.pexels.com/photos/794062/pexels-photo-794062.jpeg?auto=compress&cs=tinysrgb&w=800',
          url: '#',
        },
        {
          id: '2',
          name: 'Fred Perry Vintage Tennis Skirt',
          price: 23,
          currency: 'USD',
          platform: 'Poshmark',
          image_url: 'https://images.pexels.com/photos/7679454/pexels-photo-7679454.jpeg?auto=compress&cs=tinysrgb&w=800',
          url: '#',
        },
        {
          id: '3',
          name: 'Pink Button Up',
          price: 15,
          currency: 'USD',
          platform: 'Vestiaire',
          image_url: 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800',
          url: '#',
        },
        {
          id: '4',
          name: 'Chanel Inspired Cardigan',
          price: 43,
          currency: 'USD',
          platform: 'ThredUp',
          image_url: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
          url: '#',
        },
      ]);
    } catch (err) {
      console.error('Error loading personalized content:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'rgb(248, 242, 237)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" style={{ color: 'rgb(242, 109, 22)' }} />
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
              For You
            </h2>
          </div>
          <p style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.75rem' }}>
            Personalized picks based on your style and wardrobe
          </p>
        </div>

        <div className="mb-8 rounded-xl p-4" style={{ backgroundColor: 'rgb(248, 242, 237)', border: '1px solid rgb(45, 80, 22)' }}>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: 'rgb(242, 109, 22)' }} />
            <div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
                Proactive Discovery
              </h3>
              <p className="text-sm" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
                You've been saving pins with <strong>old money vibes</strong>. Here are some vintage finds that match your aesthetic.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {recommendations.map((item) => (
            <div
              key={item.id}
              onClick={() => onProductClick(item.id)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group cursor-pointer"
              style={{ border: '1px solid rgb(45, 80, 22)' }}
            >
              <div className="aspect-[3/4] relative">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition"
                  >
                    <Heart className="w-4 h-4" style={{ color: 'rgb(242, 109, 22)' }} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <span className="text-xs text-white font-medium px-2 py-1 rounded" style={{ backgroundColor: 'rgb(45, 80, 22)', fontFamily: 'var(--font-warbler)' }}>
                    {item.platform}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm mb-1 line-clamp-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
                  {item.name}
                </h3>
                <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(242, 109, 22)', fontSize: '1.75rem' }}>
                  ${item.price}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgb(45, 80, 22)', fontFamily: 'var(--font-warbler)' }}>
                  {item.currency}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
            Style Bundles
          </h3>
          <p className="mb-6" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.5rem' }}>
            Mix and match suggestions based on your wardrobe
          </p>

          {bundles.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed" style={{ borderColor: 'rgb(45, 80, 22)' }}>
              <p style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
                Add items to your wardrobe to see personalized style bundles
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  style={{ border: '1px solid rgb(45, 80, 22)' }}
                >
                  <h4 className="font-semibold mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
                    {bundle.name}
                  </h4>
                  {bundle.style_tags && bundle.style_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {bundle.style_tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: 'rgb(248, 242, 237)', color: 'rgb(45, 80, 22)', fontFamily: 'var(--font-warbler)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}