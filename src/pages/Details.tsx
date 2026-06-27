import React, { useState } from 'react';
import { 
  Play, Copy, ArrowLeft, ShieldCheck, CheckCircle2, Key, Eye, Heart, Calendar, FileCode, Check 
} from 'lucide-react';
import { Script } from '../types/script';

interface DetailsProps {
  script: Script;
  onBack: () => void;
  onExecute: (script: Script) => void;
  onCopy: (script: Script) => void;
  theme: any;
}

export default function Details({
  script,
  onBack,
  onExecute,
  onCopy,
  theme
}: DetailsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (script.script) {
      navigator.clipboard.writeText(script.script);
      onCopy(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(script.updatedAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6 text-left font-mono">
      {/* Back Header Row */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: theme.borderColor }}>
        <button
          onClick={onBack}
          style={{ borderColor: theme.borderColor, color: theme.textMain }}
          className="p-1.5 px-3.5 rounded-xl border text-[10px] font-bold flex items-center space-x-1.5 hover:bg-white/5 active:scale-95 transition duration-150 cursor-pointer"
        >
          <ArrowLeft size={12} />
          <span>Back to Hub</span>
        </button>

        <span className={`text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
          script.source === 'ScriptBlox' 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        }`}>
          Indexed from {script.source}
        </span>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Metadata Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cover Art Wrapper */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-850 shadow-2xl">
            <img 
              src={script.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80'} 
              alt={script.title}
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Quick info card */}
          <div 
            style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            className="border p-5 rounded-2xl space-y-4"
          >
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">TARGET GAME</span>
              <h2 className="text-xs font-bold mt-0.5 text-zinc-200 uppercase tracking-wide">
                {script.gameName}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-white/5 bg-black/25 p-3 rounded-xl">
                <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">INDEX RUNS</span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <Eye size={12} className="text-zinc-400 shrink-0" />
                  <span className="text-xs font-bold text-zinc-200">{script.views.toLocaleString()}</span>
                </div>
              </div>

              <div className="border border-white/5 bg-black/25 p-3 rounded-xl">
                <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">LIKES FEED</span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <Heart size={12} className="text-rose-500 shrink-0" />
                  <span className="text-xs font-bold text-zinc-200">{(script.likes || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Badges checklist */}
            <div className="space-y-2 pt-2 border-t border-zinc-900/10 dark:border-white/5 text-[10px] text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Verification State:</span>
                {script.verified ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck size={12} />
                    VERIFIED SAFE
                  </span>
                ) : (
                  <span className="text-zinc-500 font-bold">COMMUNITY LISTING</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Universal compatibility:</span>
                {script.universal ? (
                  <span className="text-sky-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    YES
                  </span>
                ) : (
                  <span className="text-zinc-500 font-bold">GAME SPECIFIC</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Key verification bypass:</span>
                {script.key ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Key size={12} />
                    KEY MANDATORY
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">FREE / KEYLESS</span>
                )}
              </div>
            </div>

            {/* Metadata timings */}
            <div className="pt-2 text-[9px] text-zinc-500 border-t border-zinc-900/10 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span>DATABASE CREATION:</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Code & Action Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <h1 className="text-base font-black text-white leading-snug">
              {script.title}
            </h1>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              {script.description}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onExecute(script)}
              style={{ backgroundColor: theme.accent, color: theme.isLight ? '#fff' : '#000' }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 hover:brightness-110 active:scale-95 transition cursor-pointer shadow-lg"
            >
              <Play size={13} className="fill-current" />
              <span>Execute Package</span>
            </button>

            <button
              onClick={handleCopyCode}
              style={{ borderColor: theme.borderColor, color: theme.textMain }}
              className="px-4 py-2.5 border rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-white/5 transition active:scale-95 cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>

          {/* Code Viewer Container */}
          <div 
            style={{ backgroundColor: theme.isLight ? '#fafafa' : '#09090b', borderColor: theme.borderColor }}
            className="border rounded-2xl overflow-hidden shadow-2xl relative"
          >
            {/* Header top-rail */}
            <div className="bg-black/30 p-3 px-4 flex items-center justify-between border-b border-zinc-900/20 dark:border-white/5">
              <div className="flex items-center space-x-2">
                <FileCode size={13} style={{ color: theme.accent }} />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Luau Source Executable</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-[10px] text-zinc-400 hover:text-white transition cursor-pointer font-bold uppercase tracking-wider"
              >
                {copied ? 'Success' : 'Copy'}
              </button>
            </div>

            {/* Render formatted textarea code box */}
            <textarea
              id="details-code-viewer"
              readOnly
              value={script.script || `-- Empty source file for: ${script.title}`}
              className="w-full h-80 p-4 font-mono text-[11px] leading-relaxed bg-transparent text-zinc-300 resize-none outline-none focus:ring-0 border-0 scrollbar-thin overflow-y-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
