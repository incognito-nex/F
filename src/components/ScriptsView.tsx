import React, { useState, useEffect } from 'react';
import { 
  Globe, Home as HomeIcon, Search as SearchIcon, Star, History, Info, ChevronRight, Play, Copy, ArrowLeft
} from 'lucide-react';
import { FileNode, AppTheme, UserSettings } from '../types';
import { Script } from '../types/script';

// Pages
import Home from '../pages/Home';
import Search from '../pages/Search';
import Details from '../pages/Details';
import Favorites from '../pages/Favorites';

export interface ScriptsProps {
  files: FileNode[];
  onOpenFileInEditor: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onCreateNewFile: (name: string, type: 'file' | 'folder', content?: string) => void;
  onRunScript: (fileId: string) => void;
  theme: AppTheme;
  settings: UserSettings;
  setActiveSection: (sec: string) => void;
  triggerToast?: (message: string, type?: 'clear' | 'inject' | 'execute' | 'success' | 'info') => void;
}

type ActiveTab = 'home' | 'search' | 'favorites' | 'history';

export default function ScriptsView({
  files,
  onOpenFileInEditor,
  onToggleFavorite,
  onDeleteFile,
  onCreateNewFile,
  onRunScript,
  theme,
  settings,
  setActiveSection,
  triggerToast
}: ScriptsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  // Favorites state synced to localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('script_hub_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recently Viewed state synced to localStorage
  const [history, setHistory] = useState<Script[]>(() => {
    try {
      const saved = localStorage.getItem('script_hub_recent_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('script_hub_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('script_hub_recent_viewed', JSON.stringify(history));
  }, [history]);

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const exists = prev.includes(id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item !== id);
        if (triggerToast) triggerToast('Removed from favorites', 'info');
      } else {
        updated = [...prev, id];
        if (triggerToast) triggerToast('Added to favorites', 'success');
      }
      return updated;
    });
  };

  const handleExecute = (script: Script) => {
    const sanitizedTitle = script.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 18);
    
    const providerSlug = script.source === 'ScriptBlox' ? 'sb' : 'rs';
    const finalName = `${providerSlug}_${sanitizedTitle || 'script'}.lua`;
    
    // Check if the file is already there or create it
    let targetFile = files.find(f => f.name.toLowerCase() === finalName.toLowerCase());
    if (!targetFile) {
      onCreateNewFile(finalName, 'file', script.script);
    }

    // Small delay to let file state register, then trigger the execution!
    setTimeout(() => {
      const latestFiles = files.length > 0 ? files : [];
      if (triggerToast) {
        triggerToast(`Executing dynamic script: ${script.title}`, 'execute');
      }

      const matched = latestFiles.find(f => f.name.toLowerCase() === finalName.toLowerCase());
      if (matched) {
        onRunScript(matched.id);
      } else {
        // fallback
        const sorted = [...latestFiles].filter(f => f.type === 'file');
        if (sorted.length > 0) {
          onRunScript(sorted[sorted.length - 1].id);
        }
      }
    }, 120);
  };

  const handleCopy = (script: Script) => {
    if (triggerToast) {
      triggerToast(`Copied "${script.title}" source to clipboard`, 'success');
    }
  };

  const handleViewDetails = (script: Script) => {
    setSelectedScript(script);

    // Save to history (FIFO, max 12 items, unique)
    setHistory(prev => {
      const filtered = prev.filter(item => item.id !== script.id);
      const updated = [script, ...filtered].slice(0, 12);
      return updated;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 font-sans text-left flex flex-col justify-between min-h-full">
      <div className="space-y-6">
        {/* Title bar row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 border-b" style={{ borderColor: theme.borderColor }}>
          <div>
            <h1 className="text-lg font-black font-mono tracking-wider uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
              <Globe size={18} style={{ color: theme.accent }} className="animate-pulse" />
              <span>Universal Script Hub</span>
            </h1>
            <p className="text-[10px] font-mono mt-1 text-zinc-500">
              Execute, bookmark, and study optimized Roblox lua scripts synchronized live with both Rscripts.net & ScriptBlox.com databases.
            </p>
          </div>

          {/* Core Hub Navigation Tabs */}
          {!selectedScript && (
            <div className="flex items-center space-x-1 border p-1 rounded-xl bg-black/40" style={{ borderColor: theme.borderColor }}>
              <button
                onClick={() => setActiveTab('home')}
                className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'home' 
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <HomeIcon size={11} />
                <span>Home</span>
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'search' 
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <SearchIcon size={11} />
                <span>Search</span>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'favorites' 
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Star size={11} />
                <span>Bookmarks</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'history' 
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <History size={11} />
                <span>History</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic page view renderer */}
        <div className="flex-1">
          {selectedScript ? (
            <Details
              script={selectedScript}
              onBack={() => setSelectedScript(null)}
              onExecute={handleExecute}
              onCopy={handleCopy}
              theme={theme}
            />
          ) : activeTab === 'home' ? (
            <Home
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onExecute={handleExecute}
              onCopy={handleCopy}
              onViewDetails={handleViewDetails}
              theme={theme}
            />
          ) : activeTab === 'search' ? (
            <Search
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onExecute={handleExecute}
              onCopy={handleCopy}
              onViewDetails={handleViewDetails}
              theme={theme}
            />
          ) : activeTab === 'favorites' ? (
            <Favorites
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onExecute={handleExecute}
              onCopy={handleCopy}
              onViewDetails={handleViewDetails}
              theme={theme}
            />
          ) : (
            /* History view */
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-sm font-black font-mono tracking-wider uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
                  <History size={13} style={{ color: theme.accent }} />
                  <span>Recently Opened Packages</span>
                </h2>
                <p className="text-[10px] font-mono text-zinc-500">
                  A transient trace of scripts you inspected, executed, or customized during the active debugging session.
                </p>
              </div>

              {history.length === 0 ? (
                <div 
                  style={{ borderColor: theme.borderColor }}
                  className="text-center py-20 border border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4"
                >
                  <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                    <History size={24} />
                  </div>
                  <div className="space-y-1 font-mono">
                    <h3 className="text-xs font-bold tracking-tight uppercase" style={{ color: theme.textMain }}>
                      No History Trace
                    </h3>
                    <p className="text-[10px] text-zinc-500 max-w-sm leading-relaxed">
                      You haven't opened any script details yet. Click "View Details" on any package inside the Hub to track your activity.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map(script => (
                    <div
                      key={script.id}
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                      className="border rounded-xl p-4 flex flex-col justify-between text-left space-y-4 relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 font-mono">
                          <h4 className="text-xs font-bold text-zinc-100 truncate group-hover:text-white" title={script.title}>
                            {script.title}
                          </h4>
                          <span className="text-[8.5px] text-zinc-500 font-bold block mt-0.5 uppercase tracking-wide">
                            {script.gameName}
                          </span>
                        </div>
                        <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded border ${
                          script.source === 'ScriptBlox' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {script.source}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-900/10 dark:border-white/5 pt-3">
                        <button
                          onClick={() => handleExecute(script)}
                          style={{ color: theme.accent }}
                          className="text-[9.5px] font-mono font-bold hover:brightness-110 flex items-center space-x-1 cursor-pointer"
                        >
                          <Play size={10} className="fill-current" />
                          <span>Quick Execute</span>
                        </button>
                        <button
                          onClick={() => handleViewDetails(script)}
                          className="text-[9.5px] font-mono font-bold text-zinc-400 hover:text-white flex items-center space-x-0.5 cursor-pointer"
                        >
                          <span>Open details</span>
                          <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Legal & Attribution Footer strictly as requested */}
      <div 
        className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-500 select-none"
        style={{ borderColor: theme.borderColor }}
      >
        <div className="flex items-center space-x-1">
          <span>IncoHub Core Engine v3.0</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex items-center space-x-4">
          <a 
            href="https://rscripts.net" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-indigo-400 transition cursor-pointer"
          >
            Powered by Rscripts.net
          </a>
          <span className="text-zinc-800">|</span>
          <a 
            href="https://scriptblox.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-rose-400 transition cursor-pointer"
          >
            Powered by ScriptBlox.com
          </a>
        </div>
      </div>
    </div>
  );
}
