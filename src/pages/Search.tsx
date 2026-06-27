import React, { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import ScriptGrid from '../components/ScriptGrid';
import Pagination from '../components/Pagination';
import { Script } from '../types/script';
import { Search as SearchIcon, Sparkles } from 'lucide-react';

interface SearchProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onExecute: (script: Script) => void;
  onCopy: (script: Script) => void;
  onViewDetails: (script: Script) => void;
  theme: any;
}

interface FiltersState {
  verified?: boolean;
  universal?: boolean;
  key?: boolean;
  patched?: boolean;
  sortBy?: 'relevance' | 'views' | 'likes' | 'newest';
}

export default function Search({
  favorites,
  onToggleFavorite,
  onExecute,
  onCopy,
  onViewDetails,
  theme
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    sortBy: 'relevance'
  });

  const { loading, error, results, suggestions } = useSearch(query, filters, page);

  const handleClearFilters = () => {
    setFilters({ sortBy: 'relevance' });
    setPage(1);
  };

  const handleSelectSuggestion = (script: Script) => {
    setQuery(script.title);
    onViewDetails(script);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title bar info */}
      <div className="space-y-1">
        <h1 className="text-sm font-black font-mono tracking-wider uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
          <SearchIcon size={14} style={{ color: theme.accent }} />
          <span>Cross-Platform Search Engine</span>
        </h1>
        <p className="text-[10px] font-mono text-zinc-500">
          Querying both ScriptBlox and Rscripts indexing databases. Matches are sorted by keyword relevance and popularity.
        </p>
      </div>

      {/* Main Search Panel Card */}
      <div 
        style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        className="border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl"
      >
        <SearchBar
          value={query}
          onChange={(val) => {
            setQuery(val);
            setPage(1); // reset page on new input
          }}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
          theme={theme}
        />

        <Filters
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setPage(1); // reset page on filter click
          }}
          onClearFilters={handleClearFilters}
          theme={theme}
        />
      </div>

      {/* Results grid panel */}
      <div className="space-y-4">
        {query && !loading && (
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b pb-2" style={{ borderColor: theme.borderColor }}>
            <span>Returned {results.length} normalized scripts for "{query}"</span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-zinc-500 animate-pulse" />
              Dual-API compilation active
            </span>
          </div>
        )}

        <ScriptGrid
          scripts={results}
          loading={loading}
          error={error}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onExecute={onExecute}
          onCopy={onCopy}
          onViewDetails={onViewDetails}
          theme={theme}
          isSearch={true}
        />

        {/* Paginate if results exist and no load state */}
        {!loading && results.length > 0 && (
          <Pagination
            currentPage={page}
            onPageChange={(p) => {
              setPage(p);
              // scroll to top of search results seamlessly
              const element = document.getElementById('script-hub-search');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            hasNextPage={results.length >= 6} // Simple hasNext page check based on pagination batch size
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}
