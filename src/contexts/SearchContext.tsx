import { createContext, useContext, useState, ReactNode } from 'react';
import { CarousellSearchResult } from '../lib/carousellApi';

type SearchContextType = {
  searchResults: CarousellSearchResult[];
  setSearchResults: (results: CarousellSearchResult[]) => void;
  currentSearchQuery: string;
  setCurrentSearchQuery: (query: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  clearSearchData: () => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchResults, setSearchResults] = useState<CarousellSearchResult[]>([]);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  const clearSearchData = () => {
    setSearchResults([]);
    setCurrentSearchQuery('');
    setSelectedPlatform('All');
  };

  return (
    <SearchContext.Provider value={{
      searchResults,
      setSearchResults,
      currentSearchQuery,
      setCurrentSearchQuery,
      selectedPlatform,
      setSelectedPlatform,
      clearSearchData
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}