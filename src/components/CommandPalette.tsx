import React, { useState, useEffect, useRef } from 'react';
import { Search, Hash, Terminal, Settings, Eye, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTheme } from '../types';

interface PaletteItem {
  id: string;
  category: 'Actions' | 'Files' | 'Themes' | 'Layout';
  name: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: PaletteItem[];
  theme: AppTheme;
}

export default function CommandPalette({ isOpen, onClose, items, theme }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, search, items]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 overflow-hidden">
        {/* Backdrop glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.16 }}
          ref={modalRef}
          className="relative w-full max-w-xl bg-[#14161d] border border-zinc-800 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden font-sans"
        >
          {/* Header Search Input */}
          <div className="flex items-center space-x-3 px-4 py-3.5 border-b border-zinc-800 bg-[#161a22]">
            <Search className="w-5 h-5 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search files, layouts, settings, and workspace widgets..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full bg-transparent border-none text-zinc-100 text-sm outline-none placeholder-zinc-500 font-medium"
            />
            <span className="text-[10px] font-mono bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
              ESC
            </span>
          </div>

          {/* Results Area */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 bg-[#101216]">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                No matching workspace patterns found. Try 'Editor', 'Theme' or 'Scripts'
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    style={{
                      borderLeftColor: isSelected ? theme.accent : 'transparent',
                      backgroundColor: isSelected ? `${theme.accent}14` : 'transparent',
                      color: isSelected ? theme.accent : undefined
                    }}
                    className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-md border-l-2 transition-all ${
                      isSelected ? '' : 'hover:bg-zinc-800/40 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        style={{
                          backgroundColor: isSelected ? `${theme.accent}25` : undefined,
                          color: isSelected ? theme.accent : undefined
                        }}
                        className={`p-1.5 rounded-md ${isSelected ? '' : 'bg-zinc-800/50 text-zinc-400'}`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div 
                          style={{ color: isSelected ? theme.accent : undefined }}
                          className={`text-xs font-semibold ${isSelected ? '' : 'text-zinc-200'}`}
                        >
                          {item.name}
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 animate-pulse" style={{ color: theme.accent }} />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Action Palette footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-[#161a22] text-[10px] text-zinc-500 font-mono">
            <span className="flex items-center space-x-2">
              <span className="text-zinc-400">↑↓</span> select
              <span className="mx-1 text-zinc-700">|</span>
              <span className="text-zinc-400">ENTER</span> activate
            </span>
            <span className="tracking-widest uppercase">Incognito Console</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
