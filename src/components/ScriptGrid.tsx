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
  onToggleFavorite: (id: string) => void;
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

  if (scripts.length === 0) {
    return <EmptyState isSearch={isSearch} theme={theme} />;
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
