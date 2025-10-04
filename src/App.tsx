import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import Auth from './components/Auth';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import FavoritesView from './views/FavoritesView';
import WardrobeView from './views/WardrobeView';
import ProductView from './views/ProductView';
import VirtualTryOnView from './views/VirtualTryOnView';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'favorites' | 'wardrobe' | 'product' | 'virtual-try-on'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading Clovet...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product');
  };

  const handleBackFromProduct = () => {
    setCurrentView('search'); // Go back to search instead of home
    setSelectedProductId(null);
  };

  const handleVirtualTryOnClick = (favorites: any[]) => {
    setFavoriteItems(favorites);
    setCurrentView('virtual-try-on');
  };

  const handleBackFromVirtualTryOn = () => {
    setCurrentView('favorites');
  };

  if (currentView === 'product' && selectedProductId) {
    return <ProductView productId={selectedProductId} onBack={handleBackFromProduct} />;
  }

  if (currentView === 'virtual-try-on') {
    return <VirtualTryOnView onBack={handleBackFromVirtualTryOn} favorites={favoriteItems} />;
  }

  return (
    <Layout currentView={currentView === 'product' ? 'favorites' : currentView as 'home' | 'search' | 'favorites' | 'wardrobe'} onNavigate={setCurrentView}>
      {currentView === 'home' && <HomeView onProductClick={handleProductClick} />}
      {currentView === 'search' && <SearchView onProductClick={handleProductClick} />}
      {currentView === 'favorites' && <FavoritesView onProductClick={handleProductClick} onVirtualTryOnClick={handleVirtualTryOnClick} />}
      {currentView === 'wardrobe' && <WardrobeView />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <AppContent />
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
