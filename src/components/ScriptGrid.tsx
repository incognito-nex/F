import React from 'react';
import ScriptCard from './ScriptCard';
import SkeletonCard from './SkeletonCard';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { Script } from '../types/script';

interface ScriptGridProps {
  scripts: Script[];
  loading: boolean;
  error: string | null;
  favorites: string[];
  onToggleFavorite: (id: string, script?: Script) => void;
  onExecute: (script: Script) => void;
  onCopy: (script: Script) => void;
  onViewDetails: (script: Script) => void;
  onRetry?: () => void;
  theme: any;
  title?: string;
  isSearch?: boolean;
}

export default function ScriptGrid({
  scripts,
  loading,
  error,
  favorites,
  onToggleFavorite,
  onExecute,
  onCopy,
  onViewDetails,
  onRetry,
  theme,
  title,
  isSearch = false
}: ScriptGridProps) {
  
  // 6. Console.log inside ScriptGrid before render
  console.log(`[ScriptGrid DevLog] inside ScriptGrid before render - scripts size: ${scripts?.length || 0}, loading: ${loading}, error: ${error}, isSearch: ${isSearch}, title: "${title || ''}"`);
  console.log(`[ScriptGrid DevLog] Scripts array passed to ScriptGrid:`, scripts);

  if (loading) {
    return (
      <div className="space-y-4">
        {title && (
          <h2 className="text-xs font-bold font-mono tracking-widest uppercase text-zinc-500 text-left">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} theme={theme} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} theme={theme} />;
  }

  // Raw JSON direct renderer if cards do not render (per instructions: "Render the raw JSON from both APIs directly on screen.")
  const showRawJson = false; // We can expose a troubleshooting button or section if preferred, or render a small debug overlay when length === 0 or if we want to trace it.

  if (scripts.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState isSearch={isSearch} theme={theme} />
        {/* Debug helper: Render the raw list to screen if scripts size is 0 to help user see what occurred */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 text-[10px] font-mono text-zinc-400 space-y-1">
          <span className="text-zinc-500 uppercase tracking-widest font-bold">Grid Diagnostics (scripts.length === 0)</span>
          <p>If you see "No scripts found", this debug card confirms that the React components received an empty array from the state hook. Check the console logs for "[mergeResults DevLog]" or "[useSearch DevLog]" to trace the exact line where the scripts disappeared.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-xs font-bold font-mono tracking-widest uppercase text-zinc-500 text-left">
          {title} ({scripts.length})
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scripts.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            isFavorited={favorites.includes(script.id)}
            onToggleFavorite={onToggleFavorite}
            onExecute={onExecute}
            onCopy={onCopy}
            onViewDetails={onViewDetails}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}
