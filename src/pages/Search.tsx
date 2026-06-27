import React, { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import ScriptGrid from '../components/ScriptGrid';
import Pagination from '../components/Pagination';
import { Script } from '../types/script';
import { Search as SearchIcon, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

interface SearchProps {
  favorites: string[];
  onToggleFavorite: (id: string, script?: Script) => void;
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

  const {
    loading,
    rscriptsError,
    scriptbloxError,
    results,
    suggestions,
    retryRscripts,
    retryScriptBlox
  } = useSearch(query, filters, page);

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

      {/* Partial Errors Panel if results succeeded for one provider but failed for another */}
      {(rscriptsError || scriptbloxError) && results.length > 0 && (
        <div className="space-y-2">
          {rscriptsError && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-mono text-[10px]">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={12} />
                <span>Unable to connect to Rscripts. Showing ScriptBlox results only.</span>
              </div>
              <button 
                onClick={retryRscripts}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 active:scale-95 transition cursor-pointer"
              >
                <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                <span>Retry Rscripts</span>
              </button>
            </div>
          )}
          {scriptbloxError && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-mono text-[10px]">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={12} />
                <span>Unable to connect to ScriptBlox. Showing Rscripts results only.</span>
              </div>
              <button 
                onClick={retryScriptBlox}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 active:scale-95 transition cursor-pointer"
              >
                <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                <span>Retry ScriptBlox</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results grid panel */}
      <div className="space-y-4">
        {query && !loading && results.length > 0 && (
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b pb-2" style={{ borderColor: theme.borderColor }}>
            <span>Returned {results.length} normalized scripts for "{query}"</span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-zinc-500 animate-pulse" />
              Dual-API compilation active
            </span>
          </div>
        )}

        {/* If no results, but we have errors, show dedicated error UI blocks */}
        {results.length === 0 && !loading && (rscriptsError || scriptbloxError) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rscriptsError && (
              <div className="text-center py-10 border border-dashed border-rose-500/30 bg-rose-500/5 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <div className="p-2.5 rounded-full bg-rose-950/20 border border-rose-500/30 text-rose-400">
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold font-mono uppercase text-rose-400">
                    Rscripts API Offline
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 max-w-xs leading-relaxed">
                    Unable to connect to Rscripts.
                  </p>
                </div>
                <button
                  onClick={retryRscripts}
                  className="px-3 py-1.5 border border-rose-500/30 bg-rose-950/30 text-rose-400 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1.5 hover:bg-rose-900/20 transition cursor-pointer"
                >
                  <RefreshCw size={10} />
                  <span>Retry Rscripts</span>
                </button>
              </div>
            )}
            {scriptbloxError && (
              <div className="text-center py-10 border border-dashed border-rose-500/30 bg-rose-500/5 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <div className="p-2.5 rounded-full bg-rose-950/20 border border-rose-500/30 text-rose-400">
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold font-mono uppercase text-rose-400">
                    ScriptBlox API Offline
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 max-w-xs leading-relaxed">
                    Unable to connect to ScriptBlox.
                  </p>
                </div>
                <button
                  onClick={retryScriptBlox}
                  className="px-3 py-1.5 border border-rose-500/30 bg-rose-950/30 text-rose-400 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1.5 hover:bg-rose-900/20 transition cursor-pointer"
                >
                  <RefreshCw size={10} />
                  <span>Retry ScriptBlox</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          (() => {
            console.log('[Search DevLog] Passing results to ScriptGrid:', results);
            return (
              <ScriptGrid
                scripts={results}
                loading={loading}
                error={null} // Errs handled above via partials/dual-blocks
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                onExecute={onExecute}
                onCopy={onCopy}
                onViewDetails={onViewDetails}
                theme={theme}
                isSearch={true}
              />
            );
          })()
        )}

        {/* Paginate if results exist and no load state */}
        {!loading && results.length > 0 && (
          <Pagination
            currentPage={page}
            onPageChange={(p) => {
              setPage(p);
              const element = document.getElementById('script-hub-search');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            hasNextPage={results.length >= 6} // Simple batch size check
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}
