import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [logIndex, setLogIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const logs = [
    'Initializing workspace environment...',
    'Loading Lua compiler and language server...',
    'Establishing secure sandbox sandbox...',
    'Syncing local file nodes...',
    'Applying layout themes and custom presets...',
    'Development environment ready.'
  ];

  useEffect(() => {
    const duration = 1800; // Fast loading 1.8 seconds

    const timer = setTimeout(() => {
      setIsFinished(true);
      setTimeout(onComplete, 300);
    }, duration);

    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev < logs.length - 1 ? prev + 1 : prev));
    }, 280);

    return () => {
      clearTimeout(timer);
      clearInterval(logInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#fafafa] z-50 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial-[circle_800px_at_50%_50%,rgba(0,0,0,0.01),transparent]" />

      <div className="w-full max-w-xs flex flex-col items-center justify-center space-y-6">
        
        {/* Modern Minimal Spinning Ring Indicator */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-200" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900"
          />
        </div>

        {/* Quiet Brand/Identity */}
        <div className="text-center space-y-1">
          <div className="text-[10px] tracking-widest text-zinc-900 font-mono font-bold uppercase">
            STUDIO PLAYGROUND
          </div>
          <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">
            Workspace Sandbox
          </p>
        </div>

        {/* Simplified Logs block */}
        <div className="w-full bg-white border border-zinc-200 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center space-x-2 text-[9px] text-zinc-900 border-b border-zinc-100 pb-2 font-mono">
            <Cpu size={12} className="shrink-0 animate-pulse text-zinc-900" />
            <span className="font-extrabold tracking-wider uppercase">Diagnostic Pipeline</span>
          </div>

          <div className="h-6 overflow-hidden flex flex-col justify-center">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={logIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-[9px] font-mono text-zinc-500 flex items-center space-x-1.5"
              >
                <Terminal size={10} className="w-3 shrink-0 text-zinc-400" />
                <span className="truncate">{logs[logIndex]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: isFinished ? '100%' : '100%' }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="bg-zinc-900 h-full"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
