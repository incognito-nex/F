import React from 'react';
import { ShieldCheck, CheckCircle, Flame, Filter, Key, Coins, AlertOctagon, Heart, Eye, ArrowUpDown, Trash2 } from 'lucide-react';

interface FiltersState {
  verified?: boolean;
  universal?: boolean;
  key?: boolean;
  patched?: boolean;
  sortBy?: 'relevance' | 'views' | 'likes' | 'newest';
}

interface FiltersProps {
  filters: FiltersState;
  onFilterChange: (newFilters: FiltersState) => void;
  onClearFilters: () => void;
  theme: any;
}

export default function Filters({ filters, onFilterChange, onClearFilters, theme }: FiltersProps) {
  const toggleFilter = (key: keyof FiltersState, val: boolean) => {
    onFilterChange({
      ...filters,
      [key]: filters[key] === val ? undefined : val
    });
  };

  const setSortBy = (sortVal: FiltersState['sortBy']) => {
    onFilterChange({
      ...filters,
      sortBy: sortVal
    });
  };

  const itemStyle = (active: boolean) => {
    if (active) {
      return {
        backgroundColor: `${theme.accent}14`,
        borderColor: theme.accent,
        color: theme.accent
      };
    }
    return {
      borderColor: theme.borderColor,
      color: theme.textMuted
    };
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== 'relevance');

  return (
    <div className="space-y-4 font-mono select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: theme.borderColor }}>
        <div className="flex items-center space-x-2">
          <Filter size={13} style={{ color: theme.accent }} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Search Filter Core</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center space-x-1 font-bold cursor-pointer transition duration-150"
          >
            <Trash2 size={11} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Toggle Badges Row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Verified Toggle */}
          <button
            onClick={() => toggleFilter('verified', true)}
            style={itemStyle(filters.verified === true)}
            className="p-1.5 px-3 rounded-lg border text-[10px] font-bold flex items-center space-x-1.5 transition duration-150 cursor-pointer hover:brightness-110 active:scale-95"
          >
            <ShieldCheck size={11} />
            <span>Verified</span>
          </button>

          {/* Universal Toggle */}
          <button
            onClick={() => toggleFilter('universal', true)}
            style={itemStyle(filters.universal === true)}
            className="p-1.5 px-3 rounded-lg border text-[10px] font-bold flex items-center space-x-1.5 transition duration-150 cursor-pointer hover:brightness-110 active:scale-95"
          >
            <CheckCircle size={11} />
            <span>Universal</span>
          </button>

          {/* Key Required Toggle */}
          <button
            onClick={() => toggleFilter('key', true)}
            style={itemStyle(filters.key === true)}
            className="p-1.5 px-3 rounded-lg border text-[10px] font-bold flex items-center space-x-1.5 transition duration-150 cursor-pointer hover:brightness-110 active:scale-95"
          >
            <Key size={11} />
            <span>No Key</span>
          </button>

          {/* Patched Toggle */}
          <button
            onClick={() => toggleFilter('patched', false)}
            style={itemStyle(filters.patched === false)}
            className="p-1.5 px-3 rounded-lg border text-[10px] font-bold flex items-center space-x-1.5 transition duration-150 cursor-pointer hover:brightness-110 active:scale-95"
          >
            <AlertOctagon size={11} />
            <span>Working (Not Patched)</span>
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <ArrowUpDown size={11} className="text-zinc-500" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold shrink-0">SORT BY:</span>
          <div className="flex border rounded-lg bg-black/40 overflow-hidden" style={{ borderColor: theme.borderColor }}>
            {(['relevance', 'views', 'likes', 'newest'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`p-1.5 px-3 text-[9.5px] uppercase font-bold transition duration-150 cursor-pointer border-r last:border-0 ${
                  filters.sortBy === opt 
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
                style={{ borderColor: theme.borderColor }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
