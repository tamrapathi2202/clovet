import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import FavoritesView from './views/FavoritesView';
import WardrobeView from './views/WardrobeView';
import ProductView from './views/ProductView';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'favorites' | 'wardrobe' | 'product'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

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
    setCurrentView('home');
    setSelectedProductId(null);
  };

  if (currentView === 'product' && selectedProductId) {
    return <ProductView productId={selectedProductId} onBack={handleBackFromProduct} />;
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'home' && <HomeView onProductClick={handleProductClick} />}
      {currentView === 'search' && <SearchView onProductClick={handleProductClick} />}
      {currentView === 'favorites' && <FavoritesView onProductClick={handleProductClick} />}
      {currentView === 'wardrobe' && <WardrobeView />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
