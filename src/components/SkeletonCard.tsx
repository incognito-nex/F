import React from 'react';

interface SkeletonCardProps {
  theme: any;
}

export default function SkeletonCard({ theme }: SkeletonCardProps) {
  return (
    <div 
      style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
      className="border rounded-xl p-4.5 space-y-4 animate-pulse relative"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-zinc-800 rounded w-1/3" />
        </div>
        <div className="w-12 h-5 bg-zinc-800 rounded-md" />
      </div>

      <div className="aspect-video w-full rounded-lg bg-zinc-900 border border-zinc-850" />

      <div className="flex items-center justify-between pt-2">
        <div className="h-6 bg-zinc-800 rounded w-1/4" />
        <div className="flex space-x-1.5">
          <div className="w-10 h-6 bg-zinc-800 rounded" />
          <div className="w-16 h-6 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}
