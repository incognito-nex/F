import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  theme: any;
}

export default function ErrorState({ message, onRetry, theme }: ErrorStateProps) {
  return (
    <div className="text-center py-16 border border-dashed border-rose-500/30 bg-rose-500/5 rounded-2xl flex flex-col items-center justify-center space-y-4">
      <div className="p-3 rounded-full bg-rose-950/20 border border-rose-500/30 text-rose-400">
        <AlertCircle size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold font-mono tracking-tight uppercase text-rose-400">
          API Connection Failed
        </h3>
        <p className="text-[10px] font-mono text-zinc-500 max-w-sm leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ backgroundColor: `${theme.accent}15`, color: theme.accent, borderColor: `${theme.accent}30` }}
          className="px-4 py-2 border rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1.5 hover:opacity-80 active:scale-95 transition cursor-pointer"
        >
          <RefreshCw size={11} />
          <span>Retry Handshake</span>
        </button>
      )}
    </div>
  );
}
