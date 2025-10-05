import { useState, useEffect } from 'react';
import { Plus, Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { supabase, WardrobeItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function WardrobeView() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWardrobeItems();
    }
  }, [user]);

  const loadWardrobeItems = async () => {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error loading wardrobe items:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'].map(category => (
    <span key={category} style={{ color: 'rgba(255, 251, 247, 1)', fontFamily: 'var(--font-warbler)' }}>{category}</span>
  ));
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>My Wardrobe</h2>
        <p className="text-slate-600" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.75rem' }}>
          {items.length} {items.length === 1 ? 'item' : 'items'} in your collection
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {categories.map((category) => (
          <button
  key={category}
  onClick={() => setSelectedCategory(category)}
  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition"
  style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)' }}
>
  {category}
</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20">
  <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgb(242, 109, 22)' }} />
  <h3 className="text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)', fontSize: '1.5rem' }}>
    {selectedCategory === 'All' ? 'Your wardrobe is empty' : `No ${selectedCategory.toLowerCase()} yet`}
  </h3>
          <p className="text-slate-600 mb-6" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.5rem' }}>
            Start adding items to see your collection
          </p>
          <button
  onClick={() => setShowAddModal(true)}
  className="px-6 py-3 rounded-lg font-medium transition"
  style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)' }}
>
  Add Your First Item
</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group"
            >
              <div className="aspect-square relative">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition" />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-slate-900 text-sm truncate" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>{item.name}</h3>
                {item.brand && (
                  <p className="text-xs text-slate-500 truncate" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(242, 109, 22)' }}>{item.brand}</p>
                )}
                <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>Worn {item.wear_count} times</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
  onClick={() => setShowAddModal(true)}
  className="fixed bottom-24 right-6 p-4 rounded-full shadow-lg transition"
  style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)' }}
>
  <Plus className="w-6 h-6" />
</button>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onItemAdded={() => {
            setShowAddModal(false);
            loadWardrobeItems();
          }}
        />
      )}
    </div>
  );
}

function AddItemModal({ onClose, onItemAdded }: { onClose: () => void; onItemAdded: () => void }) {
  const [addMethod, setAddMethod] = useState<'photo' | 'link' | null>(null);
  const [itemData, setItemData] = useState({
    name: '',
    category: '',
    color: '',
    brand: '',
    source_url: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('wardrobe_items').insert({
        user_id: user.id,
        ...itemData,
        season: [],
        occasion: [],
        wear_count: 0,
        ai_tags: {},
      });

      if (error) throw error;
      onItemAdded();
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Add to Wardrobe</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {!addMethod ? (
            <div className="space-y-4">
              <button
                onClick={() => setAddMethod('photo')}
                className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-slate-900 transition"
              >
                <Upload className="w-6 h-6 text-slate-700" />
                <div className="text-left">
                  <p className="font-semibold text-slate-900">Upload Photo</p>
                  <p className="text-sm text-slate-600">Take or upload a picture</p>
                </div>
              </button>

              <button
                onClick={() => setAddMethod('link')}
                className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-slate-900 transition"
              >
                <LinkIcon className="w-6 h-6 text-slate-700" />
                <div className="text-left">
                  <p className="font-semibold text-slate-900">Add from Link</p>
                  <p className="text-sm text-slate-600">Paste a listing URL</p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={itemData.name}
                  onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="e.g., Black Leather Jacket"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={itemData.category}
                  onChange={(e) => setItemData({ ...itemData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Select category</option>
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="dresses">Dresses</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={itemData.color}
                  onChange={(e) => setItemData({ ...itemData, color: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="e.g., Black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={itemData.brand}
                  onChange={(e) => setItemData({ ...itemData, brand: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="e.g., Levi's"
                />
              </div>

              {addMethod === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Source URL
                  </label>
                  <input
                    type="url"
                    value={itemData.source_url}
                    onChange={(e) => setItemData({ ...itemData, source_url: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={itemData.image_url}
                  onChange={(e) => setItemData({ ...itemData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAddMethod(null)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ShoppingBag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="rgb(242,109,22)">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
