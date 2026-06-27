import React from 'react';
import { SearchX, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  isSearch?: boolean;
  theme: any;
}

export default function EmptyState({ title, description, isSearch = false, theme }: EmptyStateProps) {
  return (
    <div 
      style={{ borderColor: theme.borderColor }}
      className="text-center py-20 border border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4"
    >
      <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
        {isSearch ? (
          <SearchX size={28} className="text-zinc-500 animate-bounce" />
        ) : (
          <Inbox size={28} className="text-zinc-500" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold font-mono tracking-tight uppercase" style={{ color: theme.textMain }}>
          {title || (isSearch ? 'No Scripts Found' : 'Workspace Empty')}
        </h3>
        <p className="text-[10px] font-mono text-zinc-500 max-w-sm leading-relaxed">
          {description || (isSearch 
            ? 'We couldn\'t find any Roblox packages aligning with your tags. Try expanding your search queries or disabling active filters.' 
            : 'You haven\'t added any local assets yet.')}
        </p>
      </div>
    </div>
  );
}
