import { Home, Search, Heart, ShoppingBag, Menu, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type LayoutProps = {
  children: React.ReactNode;
  currentView: 'home' | 'search' | 'favorites' | 'wardrobe';
  onNavigate: (view: 'home' | 'search' | 'favorites' | 'wardrobe') => void;
};

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition">
            <Menu className="w-6 h-6 text-slate-700" />
          </button>

          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
            Clovet
          </h1>

          <button
            onClick={() => signOut()}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <User className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around py-3">
          <button
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              currentView === 'home' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">For You</span>
          </button>

          <button
            onClick={() => onNavigate('search')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              currentView === 'search' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Search</span>
          </button>

          <button
            onClick={() => onNavigate('favorites')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              currentView === 'favorites' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs font-medium">Favorites</span>
          </button>

          <button
            onClick={() => onNavigate('wardrobe')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              currentView === 'wardrobe' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs font-medium">Wardrobe</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
