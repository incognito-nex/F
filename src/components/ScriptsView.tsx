import React, { useState } from 'react';
import { 
  FileCode, Search, Star, Play, Trash2, Plus, Calendar, Scale, 
  Globe, CheckCircle2, Eye, RefreshCw, FolderClosed
} from 'lucide-react';
import { FileNode, AppTheme, UserSettings } from '../types';
import { useScriptSearch, ScriptBloxScript } from '../lib/scriptblox';

// ----------------- SCRIPT SEARCH COMPONENT -----------------
export interface ScriptSearchProps {
  theme: AppTheme;
  onCreateNewFile: (name: string, type: 'file' | 'folder', content?: string) => void;
  onRunScript: (fileId: string) => void;
  setActiveSection: (sec: string) => void;
  onOpenFileInEditor: (fileId: string) => void;
  files: FileNode[];
}

export function ScriptSearch({
  theme,
  onCreateNewFile,
  onRunScript,
  setActiveSection,
  onOpenFileInEditor,
  files
}: ScriptSearchProps) {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState<'scriptblox' | 'rscripts'>('scriptblox');
  
  const { loading, error, data: scripts } = useScriptSearch(query, provider);

  const handleLoadScript = (script: ScriptBloxScript) => {
    // Generate unique name
    const sanitizedTitle = script.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 20);
    const finalName = `hub_${sanitizedTitle || 'script'}.lua`;
    
    // Create new file and open in editor
    onCreateNewFile(finalName, 'file', `-- Loaded from Script Hub (${provider.toUpperCase()})\n-- Title: ${script.title}\n-- Views: ${script.views}\n\n${script.script}`);
    setActiveSection('editor');
  };

  const handleRunScriptDirect = (script: ScriptBloxScript) => {
    // Temporary load, then run
    const sanitizedTitle = script.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 20);
    const finalName = `hub_${sanitizedTitle || 'script'}.lua`;
    
    onCreateNewFile(finalName, 'file', script.script);
    // Find the newly created file ID to run it
    setTimeout(() => {
      // Find the last created file
      const sorted = [...files].filter(f => f.type === 'file');
      if (sorted.length > 0) {
        onRunScript(sorted[sorted.length - 1].id);
      }
    }, 100);

    setActiveSection('editor');
  };

  const inputBg = theme.isLight 
    ? 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-zinc-400 focus:bg-white' 
    : 'bg-zinc-900/80 text-zinc-100 border-zinc-800 focus:border-zinc-700';

  return (
    <div className="space-y-6">
      {/* Search and Provider Selection Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl border bg-black/10" style={{ borderColor: theme.borderColor }}>
        {/* Search input */}
        <div className="relative w-full md:flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={`Search Roblox scripts on ${provider === 'scriptblox' ? 'ScriptBlox' : 'RScripts.net'}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono placeholder-zinc-500 focus:outline-none transition ${inputBg}`}
          />
        </div>

        {/* Provider Toggle Switch */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-extrabold">PROVIDER:</span>
          <div className="flex items-center space-x-1 border p-1 rounded-xl bg-black/40" style={{ borderColor: theme.borderColor }}>
            <button
              onClick={() => setProvider('scriptblox')}
              className={`p-1.5 px-3.5 text-[10px] font-mono rounded-lg font-bold transition uppercase ${
                provider === 'scriptblox' 
                  ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ScriptBlox
            </button>
            <button
              onClick={() => setProvider('rscripts')}
              className={`p-1.5 px-3.5 text-[10px] font-mono rounded-lg font-bold transition uppercase ${
                provider === 'rscripts' 
                  ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              RScripts.net
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-20 border border-dashed rounded-xl" style={{ borderColor: theme.borderColor }}>
          <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-zinc-500" style={{ color: theme.accent }} />
          <p className="text-xs font-mono text-zinc-400">Loading dynamic Roblox scripts from {provider === 'scriptblox' ? 'ScriptBlox' : 'RScripts'}...</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-10 border border-dashed border-rose-500/30 bg-rose-500/5 rounded-xl">
          <p className="text-xs font-mono text-rose-400">Error fetching scripts: {error}</p>
          <button 
            onClick={() => setQuery(q => q)}
            className="mt-3 px-3 py-1.5 border border-rose-500/30 text-[10px] font-mono rounded-lg hover:bg-rose-500/10 text-rose-400 transition"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && (
        <>
          {scripts.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-xl" style={{ borderColor: theme.borderColor }}>
              <FileCode size={36} className="mx-auto mb-3 text-zinc-600" />
              <p className="text-xs font-mono text-zinc-500">No scripts found matching "{query}" on {provider === 'scriptblox' ? 'ScriptBlox' : 'RScripts'}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scripts.map((script) => (
                <div
                  key={script.id}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                  className="group relative border rounded-xl p-4.5 transition duration-200 flex flex-col justify-between hover:shadow-lg"
                >
                  {/* Glowing header border on hover */}
                  <div 
                    style={{ backgroundColor: theme.accent }}
                    className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition duration-200 rounded-t-xl"
                  />

                  <div className="space-y-3.5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h3 
                            style={{ color: theme.textMain }}
                            className="text-xs font-bold font-mono truncate transition" 
                            title={script.title}
                          >
                            {script.title}
                          </h3>
                          {script.verified && (
                            <span title="Verified Safe Script">
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 fill-emerald-400/10" />
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                          {provider.toUpperCase()} REMOTE
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-zinc-800/40 text-zinc-400">
                        <Globe size={13} />
                      </div>
                    </div>

                    {/* Image / Thumbnail placeholder */}
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-900">
                      <img 
                        src={script.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=260&q=80'} 
                        alt={script.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // fallback
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=260&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      
                      {/* Views & Date overlays */}
                      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-[9px] font-mono text-zinc-300 bg-black/60 px-1.5 py-0.5 rounded border border-white/5">
                          <Eye size={10} className="text-zinc-400" />
                          <span>{script.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[9px] font-mono text-zinc-300 bg-black/60 px-1.5 py-0.5 rounded border border-white/5">
                          <Calendar size={10} className="text-zinc-400" />
                          <span>{new Date(script.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 pt-3.5 border-t border-zinc-800/40 flex items-center justify-between">
                    <button
                      onClick={() => handleRunScriptDirect(script)}
                      style={{ backgroundColor: `${theme.accent}14`, color: theme.accent, borderColor: `${theme.accent}30` }}
                      className="px-2.5 py-1.5 text-[9.5px] font-mono rounded-lg border font-bold hover:opacity-95 transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Play size={10} className="fill-current" />
                      <span>Run Script</span>
                    </button>

                    <button
                      onClick={() => handleLoadScript(script)}
                      style={{ 
                        borderColor: theme.borderColor, 
                        color: theme.textMain, 
                        backgroundColor: theme.isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' 
                      }}
                      className="px-3 py-1.5 text-[9.5px] font-mono rounded-lg border hover:opacity-80 transition cursor-pointer font-bold"
                    >
                      Load into Editor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ----------------- MAIN SCRIPTS VIEW COMPONENT -----------------
interface ScriptsProps {
  files: FileNode[];
  onOpenFileInEditor: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onCreateNewFile: (name: string, type: 'file' | 'folder', content?: string) => void;
  onRunScript: (fileId: string) => void;
  theme: AppTheme;
  settings: UserSettings;
  setActiveSection: (sec: string) => void;
}

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
}: ScriptsProps) {
  const [activeTab, setActiveTab] = useState<'hub' | 'local'>('hub');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filter Luau files only
  const scriptFiles = files.filter(f => f.type === 'file');

  const handleCreateScript = () => {
    let baseName = 'script';
    let extension = '.lua';
    let finalName = `${baseName}${extension}`;
    let index = 1;
    while (files.some(f => f.name.toLowerCase() === finalName.toLowerCase())) {
      finalName = `${baseName}${index}${extension}`;
      index++;
    }
    onCreateNewFile(finalName, 'file', '-- Welcome to workspace\nprint("Hello, World!")');
    setActiveSection('editor');
  };

  // Filter & Sort
  const filteredScripts = scriptFiles
    .filter((file) => {
      const matchesSearch = 
        file.name.toLowerCase().includes(search.toLowerCase()) || 
        (file.content && file.content.toLowerCase().includes(search.toLowerCase()));
      const matchesFavorite = showFavoritesOnly ? file.isFavorite : true;
      return matchesSearch && matchesFavorite;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'size') {
        return (b.size || 0) - (a.size || 0);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const inputBg = theme.isLight 
    ? 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-zinc-400 focus:bg-white' 
    : 'bg-zinc-900 text-zinc-100 border-zinc-850 focus:border-zinc-700';

  const controlBarBg = theme.isLight ? 'bg-zinc-50' : 'bg-black/30';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 font-sans text-left">
      
      {/* Title bar row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 border-b" style={{ borderColor: theme.borderColor }}>
        <div>
          <h1 className="text-xl font-extrabold font-mono tracking-tight uppercase" style={{ color: theme.textMain }}>
            Scripts Engine Suite
          </h1>
          <p className="text-xs font-mono mt-1 text-zinc-400">
            Search Script Hub resources or manage your local workspace file collections.
          </p>
        </div>

        {activeTab === 'local' && (
          <button
            onClick={handleCreateScript}
            style={{ backgroundColor: theme.accent, color: theme.isLight ? '#ffffff' : '#000000' }}
            className="flex items-center space-x-1.5 text-xs font-mono px-3.5 py-2.5 rounded-xl font-bold shadow-xs hover:opacity-90 active:scale-98 transition cursor-pointer shrink-0"
          >
            <Plus size={14} />
            <span>New file</span>
          </button>
        )}
      </div>

      {/* Two Big High-Tech Mode/Tab Buttons at top */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('hub')}
          style={{
            borderColor: activeTab === 'hub' ? theme.accent : theme.borderColor,
            backgroundColor: activeTab === 'hub' ? `${theme.accent}14` : theme.cardBg,
            boxShadow: activeTab === 'hub' ? `0 0 15px ${theme.accent}0a` : 'none'
          }}
          className="p-4.5 rounded-2xl border text-center transition-all cursor-pointer font-bold focus:outline-none flex flex-col items-center justify-center space-y-1.5"
        >
          <Globe size={18} style={{ color: activeTab === 'hub' ? theme.accent : theme.textMuted }} />
          <span className="text-xs font-mono uppercase tracking-wider block" style={{ color: activeTab === 'hub' ? theme.textMain : theme.textMuted }}>
            Script Hub
          </span>
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">
            Online community script libraries
          </span>
        </button>

        <button
          onClick={() => setActiveTab('local')}
          style={{
            borderColor: activeTab === 'local' ? theme.accent : theme.borderColor,
            backgroundColor: activeTab === 'local' ? `${theme.accent}14` : theme.cardBg,
            boxShadow: activeTab === 'local' ? `0 0 15px ${theme.accent}0a` : 'none'
          }}
          className="p-4.5 rounded-2xl border text-center transition-all cursor-pointer font-bold focus:outline-none flex flex-col items-center justify-center space-y-1.5"
        >
          <FolderClosed size={18} style={{ color: activeTab === 'local' ? theme.accent : theme.textMuted }} />
          <span className="text-xs font-mono uppercase tracking-wider block" style={{ color: activeTab === 'local' ? theme.textMain : theme.textMuted }}>
            Local Files
          </span>
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">
            Integrated Workspace File Manager
          </span>
        </button>
      </div>

      {/* Active Tab Content rendering */}
      {activeTab === 'hub' ? (
        <ScriptSearch
          theme={theme}
          onCreateNewFile={onCreateNewFile}
          onRunScript={onRunScript}
          setActiveSection={setActiveSection}
          onOpenFileInEditor={onOpenFileInEditor}
          files={files}
        />
      ) : (
        <>
          {/* Control bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: controlBarBg, borderColor: theme.borderColor }}>
            <div className="relative w-full md:w-72 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
              <input
                type="text"
                placeholder="Search local file content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full border rounded-xl py-2 px-9 text-xs font-mono placeholder-zinc-500 focus:outline-none transition ${inputBg}`}
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              {/* Sorting */}
              <div className="flex items-center space-x-1 border p-1 rounded-xl shrink-0" style={{ borderColor: theme.borderColor, backgroundColor: theme.isLight ? '#ffffff' : '#0a0a0c' }}>
                <button
                  onClick={() => setSortBy('name')}
                  className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition uppercase ${
                    sortBy === 'name' 
                      ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy('date')}
                  className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition uppercase ${
                    sortBy === 'date' 
                      ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Date
                </button>
                <button
                  onClick={() => setSortBy('size')}
                  className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition uppercase ${
                    sortBy === 'size' 
                      ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Size
                </button>
              </div>

              {/* Toggle Favorites */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                style={{
                  borderColor: showFavoritesOnly ? theme.accent : theme.borderColor,
                  color: showFavoritesOnly ? theme.accent : theme.textMuted,
                  backgroundColor: showFavoritesOnly ? `${theme.accent}0d` : (theme.isLight ? '#ffffff' : '#0a0a0c')
                }}
                className={`p-1.5 px-3.5 rounded-xl border text-[10px] uppercase font-mono font-bold flex items-center space-x-1.5 hover:opacity-90 transition cursor-pointer`}
              >
                <Star size={11} className={showFavoritesOnly ? "fill-current" : ""} />
                <span>Favs</span>
              </button>
            </div>
          </div>

          {/* Grid cards */}
          {filteredScripts.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-xl" style={{ borderColor: theme.borderColor, backgroundColor: theme.isLight ? '#fcfcfc' : 'rgba(0,0,0,0.1)' }}>
              <FileCode size={36} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
              <p className="text-xs font-mono text-zinc-500">No matching Lua scripts found in local workspace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScripts.map((file) => (
                <div
                  key={file.id}
                  className="group relative border rounded-xl p-5 transition duration-200 flex flex-col justify-between"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  {/* Accent glow on top */}
                  <div 
                    style={{ backgroundColor: file.isFavorite ? '#f59e0b' : theme.accent }}
                    className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition duration-200 rounded-t-xl"
                  />

                  {/* Top Metas */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-zinc-500/10" style={{ color: theme.accent }}>
                          <FileCode size={18} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xs font-bold font-mono truncate max-w-[170px]" style={{ color: theme.textMain }}>
                            {file.name}
                          </h3>
                          <span className="text-[9px] font-mono uppercase tracking-wider block mt-0.5" style={{ color: theme.textMuted }}>
                            LOCAL LUAU FILE
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleFavorite(file.id)}
                        className="p-1 rounded-lg transition cursor-pointer"
                        style={{ color: file.isFavorite ? '#f59e0b' : theme.textMuted }}
                        title={file.isFavorite ? "Unfavorite" : "Favorite"}
                      >
                        <Star size={14} className={file.isFavorite ? "fill-current" : ""} />
                      </button>
                    </div>

                    {/* Character stats count */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono p-2.5 rounded-lg border" style={{ backgroundColor: theme.isLight ? '#fbfbfb' : '#07080a', borderColor: theme.borderColor, color: theme.textMuted }}>
                      <div className="flex items-center space-x-1 shrink-0">
                        <Scale size={11} className="opacity-60" />
                        <span>{file.size} bytes</span>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <Calendar size={11} className="opacity-60" />
                        <span className="truncate">{new Date(file.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="mt-5 pt-3.5 border-t flex items-center justify-between" style={{ borderColor: theme.borderColor }}>
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                      title="Delete file permanently"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onOpenFileInEditor(file.id)}
                        className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border font-bold transition cursor-pointer"
                        style={{ backgroundColor: theme.isLight ? '#ffffff' : 'transparent', borderColor: theme.borderColor, color: theme.textMain }}
                      >
                        Edit Code
                      </button>

                      <button
                        onClick={() => {
                          onRunScript(file.id);
                          onOpenFileInEditor(file.id);
                          setActiveSection('editor');
                        }}
                        style={{ backgroundColor: `${theme.accent}1c`, color: theme.accent, borderColor: `${theme.accent}40` }}
                        className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border font-bold hover:opacity-90 transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Play size={10} className="fill-current" />
                        <span>Run</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
