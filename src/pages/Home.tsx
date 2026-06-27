import React, { useState } from 'react';
import { useScriptsCategory } from '../hooks/useScripts';
import ScriptGrid from '../components/ScriptGrid';
import { Script } from '../types/script';
import { Flame, Clock, Sparkles, ShieldCheck, Globe, Trophy, ChevronRight } from 'lucide-react';

interface HomeProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onExecute: (script: Script) => void;
  onCopy: (script: Script) => void;
  onViewDetails: (script: Script) => void;
  theme: any;
}

type TabType = 'trending' | 'recent' | 'popular' | 'verified' | 'universal' | 'recommended';

export default function Home({
  favorites,
  onToggleFavorite,
  onExecute,
  onCopy,
  onViewDetails,
  theme
}: HomeProps) {
  const [activeTab, setActiveTab] = useState<TabType>('trending');

  // Fetch independent categories using independent hooks as requested!
  const trending = useScriptsCategory('trending');
  const recent = useScriptsCategory('recent');
  const popular = useScriptsCategory('popular');
  const verified = useScriptsCategory('verified');
  const universal = useScriptsCategory('universal');
  const recommended = useScriptsCategory('recommended');

  const tabs = [
    { id: 'trending', label: 'Trending', icon: Flame, state: trending },
    { id: 'recent', label: 'Recently Added', icon: Clock, state: recent },
    { id: 'popular', label: 'Most Popular', icon: Trophy, state: popular },
    { id: 'verified', label: 'Verified Safe', icon: ShieldCheck, state: verified },
    { id: 'universal', label: 'Universal', icon: Globe, state: universal },
    { id: 'recommended', label: 'Recommended', icon: Sparkles, state: recommended }
  ] as const;

  const activeCategory = tabs.find(t => t.id === activeTab)!;

  // Let's find some featured scripts to showcase in a sleek glass header banner
  const featuredScript = trending.data[0] || recent.data[0];

  return (
    <div className="space-y-6 text-left">
      {/* Featured Banner Hero Component */}
      {featuredScript && (
        <div 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
          className="relative border rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl group"
        >
          {/* Accent glow corner */}
          <div 
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ backgroundColor: theme.accent }}
          />

          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded uppercase font-mono animate-pulse">
                Featured Exploit
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {featuredScript.source} DB • {featuredScript.views.toLocaleString()} runs
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold font-mono tracking-tight text-white leading-tight">
              {featuredScript.title}
            </h2>
            <p className="text-[11px] font-mono text-zinc-400 max-w-xl leading-relaxed">
              {featuredScript.description}
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => onExecute(featuredScript)}
                style={{ backgroundColor: theme.accent, color: theme.isLight ? '#fff' : '#000' }}
                className="px-4 py-2 rounded-xl text-[10px] font-mono font-bold flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                <Flame size={12} className="fill-current animate-bounce" />
                <span>Execute Featured</span>
              </button>
              
              <button
                onClick={() => onViewDetails(featuredScript)}
                style={{ borderColor: theme.borderColor, color: theme.textMain }}
                className="px-4 py-2 rounded-xl text-[10px] font-mono font-bold border hover:bg-white/5 transition flex items-center space-x-1 cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="relative aspect-video w-full md:w-52 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-850 shadow-2xl">
            <img 
              src={featuredScript.image} 
              alt="" 
              className="w-full h-full object-cover opacity-75 group-hover:scale-103 transition duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Grid selector core tab row */}
      <div className="flex flex-col space-y-4">
        {/* Navigation Category Tabs */}
        <div className="flex items-center space-x-1 bg-black/40 border p-1 rounded-xl overflow-x-auto" style={{ borderColor: theme.borderColor }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 px-4 rounded-lg text-[10.5px] font-mono font-bold transition duration-150 cursor-pointer flex items-center space-x-2 shrink-0 ${
                  isSelected 
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-black' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Icon size={12} className={isSelected ? 'animate-pulse' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Categorized Grid rendering */}
        <div className="pt-2">
          <ScriptGrid
            title={`${activeCategory.label} scripts`}
            scripts={activeCategory.state.data}
            loading={activeCategory.state.loading}
            error={activeCategory.state.error}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onExecute={onExecute}
            onCopy={onCopy}
            onViewDetails={onViewDetails}
            onRetry={() => {}}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
