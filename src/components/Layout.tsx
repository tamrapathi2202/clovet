import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';

type LayoutProps = {
  children: React.ReactNode;
  currentView: 'home' | 'explore' | 'favorites' | 'wardrobe' | 'product' | 'virtual-try-on' | 'profile';
  onNavigate: (view: 'home' | 'explore' | 'favorites' | 'wardrobe' | 'product' | 'virtual-try-on' | 'profile') => void;
  onShowOnboarding?: () => void;
};

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Show onboarding guide"
          >
          </button>

          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
            Clovet
          </h1>

          <button
            onClick={() => onNavigate('profile')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Profile"
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
            onClick={() => onNavigate('explore')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
              currentView === 'explore' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Explore</span>
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
            data-tour-step="nav-wardrobe"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs font-medium">Wardrobe</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
