import React from 'react';
import ScriptGrid from '../components/ScriptGrid';
import { Script } from '../types/script';
import { Star } from 'lucide-react';

interface FavoritesProps {
  favoriteScripts: Script[];
  favorites: string[];
  onToggleFavorite: (id: string, script?: Script) => void;
  onExecute: (script: Script) => void;
  onCopy: (script: Script) => void;
  onViewDetails: (script: Script) => void;
  theme: any;
}

export default function Favorites({
  favoriteScripts = [],
  favorites,
  onToggleFavorite,
  onExecute,
  onCopy,
  onViewDetails,
  theme
}: FavoritesProps) {
  return (
    <div className="space-y-6 text-left font-mono">
      {/* Title bar */}
      <div className="space-y-1">
        <h1 className="text-sm font-black tracking-wider uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
          <Star size={14} className="text-yellow-500 fill-current animate-pulse" />
          <span>Local Favorite Vault</span>
        </h1>
      </div>

      {/* Grid container */}
      <div className="pt-2">
        {favoriteScripts.length === 0 ? (
          <div 
            style={{ borderColor: theme.borderColor }}
            className="text-center py-20 border border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4"
          >
            <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-yellow-500">
              <Star size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold tracking-tight uppercase" style={{ color: theme.textMain }}>
                Vault is Empty
              </h3>
              <p className="text-[10px] text-zinc-500 max-w-sm leading-relaxed">
                You haven't bookmarked any Roblox executor scripts yet. Click the star icon on any card inside the Script Hub to bookmark them here.
              </p>
            </div>
          </div>
        ) : (
          <ScriptGrid
            title="Saved Bookmarks"
            scripts={favoriteScripts}
            loading={false}
            error={null}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onExecute={onExecute}
            onCopy={onCopy}
            onViewDetails={onViewDetails}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}
