import React, { useState } from 'react';
import { Search, Sparkles, X, Globe } from 'lucide-react';
import { Script } from '../types/script';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  suggestions: Script[];
  onSelectSuggestion: (script: Script) => void;
  theme: any;
}

export default function SearchBar({ value, onChange, suggestions, onSelectSuggestion, theme }: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputBg = theme.isLight 
    ? 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-zinc-400 focus:bg-white' 
    : 'bg-zinc-900/60 text-zinc-100 border-zinc-850 focus:border-zinc-700 focus:bg-black/40';

  return (
    <div className="relative w-full z-30 font-mono">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          id="script-hub-search"
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search dual APIs (ScriptBlox + Rscripts) for Infinite Yield, Blox Fruits..."
          className={`w-full py-3.5 pl-11 pr-10 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-zinc-800 transition duration-150 shadow-sm ${inputBg}`}
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setShowSuggestions(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown dropdown list */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute left-0 right-0 mt-2 border rounded-xl shadow-2xl p-2 z-50 overflow-hidden divide-y divide-zinc-900/10 dark:divide-white/5 animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-md"
          style={{ backgroundColor: `${theme.cardBg}fa`, borderColor: theme.borderColor }}
        >
          <div className="p-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
            <span>Dynamic Suggestions</span>
            <Sparkles size={10} className="text-zinc-500 animate-pulse" />
          </div>
          <div className="pt-1.5 space-y-1">
            {suggestions.map((item) => (
              <button
                key={item.id}
                onMouseDown={() => onSelectSuggestion(item)}
                className="w-full text-left p-2.5 rounded-lg flex items-center justify-between hover:bg-black/20 dark:hover:bg-white/5 transition duration-100 group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded bg-zinc-950 overflow-hidden flex-shrink-0 border border-zinc-900/60">
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <span 
                      style={{ color: theme.textMain }}
                      className="text-xs font-bold truncate block group-hover:text-white"
                    >
                      {item.title}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider block mt-0.5">
                      {item.gameName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${
                    item.source === 'ScriptBlox' 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {item.source}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
