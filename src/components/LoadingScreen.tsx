import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const duration = 1800; // Fast and smooth loading of 1.8 seconds

    const timer = setTimeout(() => {
      setIsFinished(true);
      setTimeout(onComplete, 400); // short delay to allow fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#000000] z-50 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
      {/* Subtle clean ambient dark glow */}
      <div className="absolute inset-0 bg-radial-[circle_800px_at_50%_50%,rgba(255,255,255,0.015),transparent]" />

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: isFinished ? 0 : 1, y: isFinished ? -12 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xs flex flex-col items-center justify-center space-y-6 -mt-8"
      >
        {/* Incognito Hat Logo - made bigger (w-32 h-32) and centered */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <img 
            src="https://raw.githubusercontent.com/incognito-updates/tracker/refs/heads/main/500x500%5BLOGO%5D.png" 
            alt="Incognito Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Minimalist horizontal thin loading bar */}
        <div className="w-36 h-[2px] bg-zinc-800 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          />
        </div>
      </motion.div>
    </div>
  );
}
