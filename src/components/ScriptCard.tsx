import React from 'react';
import { 
  Play, Copy, Star, Info, ShieldCheck, CheckCircle2, Key, Eye, Heart, Calendar, ArrowRight, Zap 
} from 'lucide-react';
import { Script } from '../types/script';

interface ScriptCardProps {
  script: Script;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  onExecute: (script: Script) => void;
  onCopy: (script: Script) => void;
  onViewDetails: (script: Script) => void;
  theme: any;
}

export default function ScriptCard({
  script,
  isFavorited,
  onToggleFavorite,
  onExecute,
  onCopy,
  onViewDetails,
  theme
}: ScriptCardProps) {
  
  const formattedDate = new Date(script.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
      className="group relative border rounded-xl p-4 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:translate-y-[-2px] overflow-hidden text-left"
    >
      {/* Decorative hover gradient glow */}
      <div 
        style={{ backgroundColor: theme.accent }}
        className="absolute top-0 inset-x-0 h-[2.5px] opacity-0 group-hover:opacity-100 transition duration-300 rounded-t-xl"
      />

      <div className="space-y-4">
        {/* Header line with details and source */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 
                style={{ color: theme.textMain }}
                className="text-xs font-black font-mono truncate leading-normal transition group-hover:text-white"
                title={script.title}
              >
                {script.title}
              </h3>
              
              {/* Badges row */}
              <div className="flex items-center gap-1 shrink-0">
                {script.verified && (
                  <span title="Verified Safe">
                    <ShieldCheck size={12} className="text-emerald-400 shrink-0 fill-emerald-500/5 animate-pulse" />
                  </span>
                )}
                {script.universal && (
                  <span title="Universal Module">
                    <CheckCircle2 size={12} className="text-sky-400 shrink-0" />
                  </span>
                )}
                {script.key && (
                  <span title="Requires License/Key">
                    <Key size={12} className="text-amber-400 shrink-0" />
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1.5 mt-1">
              <span className="text-[9px] font-mono text-zinc-500 truncate font-extrabold uppercase tracking-wide">
                {script.gameName}
              </span>
            </div>
          </div>

          {/* Source branding badge */}
          <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
            script.source === 'ScriptBlox' 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            {script.source}
          </span>
        </div>

        {/* Dynamic Image Wrapper */}
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 border border-zinc-900/60 shadow-inner group/img">
          <img 
            src={script.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'} 
            alt={script.title}
            className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition duration-500 select-none pointer-events-none"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* Hover Overlay Button to View Details */}
          <button
            onClick={() => onViewDetails(script)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center space-x-1 cursor-pointer"
          >
            <div className="bg-zinc-900/90 border border-white/10 p-2.5 rounded-xl flex items-center space-x-1.5 text-[10px] font-bold font-mono text-white shadow-xl translate-y-2 group-hover/img:translate-y-0 transition duration-300">
              <Info size={11} style={{ color: theme.accent }} />
              <span>Full Details</span>
            </div>
          </button>

          {/* Floating overlays: Views & Favorites */}
          <div className="absolute top-2 right-2 flex space-x-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(script.id);
              }}
              style={{ backgroundColor: isFavorited ? 'rgba(234,179,8,0.15)' : 'rgba(0,0,0,0.65)' }}
              className={`p-1.5 rounded-lg border transition duration-150 cursor-pointer ${
                isFavorited 
                  ? 'border-yellow-500/40 text-yellow-500 hover:brightness-110' 
                  : 'border-white/5 text-zinc-400 hover:text-white hover:bg-black/80'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={11} className={isFavorited ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Stats bar on overlay bottom */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-[9px] font-mono text-zinc-300 bg-black/80 border border-white/5 px-1.5 py-0.5 rounded">
                <Eye size={10} className="text-zinc-500" />
                <span>{script.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1 text-[9px] font-mono text-zinc-300 bg-black/80 border border-white/5 px-1.5 py-0.5 rounded">
                <Heart size={10} className="text-rose-500 shrink-0" />
                <span>{(script.likes || 0).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-[9px] font-mono text-zinc-400 bg-black/85 px-1.5 py-0.5 rounded border border-white/5">
              <Calendar size={10} className="text-zinc-500" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Button Actions Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-900/10 dark:border-white/5 flex flex-wrap gap-2 items-center justify-between">
        <button
          id={`card-exec-${script.id}`}
          onClick={() => onExecute(script)}
          style={{ backgroundColor: `${theme.accent}14`, color: theme.accent, borderColor: `${theme.accent}30` }}
          className="px-3.5 py-1.5 text-[9.5px] font-mono rounded-lg border font-bold hover:brightness-115 active:scale-95 transition duration-150 flex items-center space-x-1 cursor-pointer"
        >
          <Play size={10} className="fill-current" />
          <span>Execute</span>
        </button>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onCopy(script)}
            style={{ 
              borderColor: theme.borderColor, 
              color: theme.textMain, 
              backgroundColor: theme.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)' 
            }}
            className="p-1.5 rounded-lg border text-[9.5px] font-mono font-bold hover:text-white transition duration-100 cursor-pointer flex items-center space-x-1"
            title="Copy Code to Clipboard"
          >
            <Copy size={11} />
            <span>Copy</span>
          </button>

          <button
            onClick={() => onViewDetails(script)}
            style={{ 
              borderColor: theme.borderColor, 
              color: theme.textMain, 
              backgroundColor: theme.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' 
            }}
            className="px-3 py-1.5 text-[9.5px] font-mono rounded-lg border font-bold hover:brightness-125 transition duration-100 cursor-pointer"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
