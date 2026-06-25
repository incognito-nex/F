import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, ArrowUpRight, Play, Server, RefreshCw } from 'lucide-react';
import { TerminalLine, AppTheme } from '../types';

interface TerminalPanelProps {
  lines: TerminalLine[];
  onSendCommand: (cmd: string) => void;
  onClear: () => void;
  terminalHeight: number;
  setTerminalHeight: (h: number) => void;
  theme: AppTheme;
}

export default function TerminalPanel({
  lines,
  onSendCommand,
  onClear,
  terminalHeight,
  setTerminalHeight,
  theme,
}: TerminalPanelProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeStop);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const terminalNode = document.getElementById('terminal-panel-container');
    if (terminalNode) {
      const windowHeight = window.innerHeight;
      const computedHeight = windowHeight - e.clientY;
      // Clamp terminal height between 100px and 500px
      const clampedHeight = Math.max(120, Math.min(500, computedHeight));
      setTerminalHeight(clampedHeight);
    }
  };

  const handleResizeStop = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeStop);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    onSendCommand(cmd);
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex === history.length - 1) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  };

  return (
    <div
      id="terminal-panel-container"
      style={{
        height: `${terminalHeight}px`,
        backgroundColor: theme.terminalBg,
        borderColor: theme.borderColor,
      }}
      className="border-t flex flex-col font-mono text-xs select-none relative shrink-0 transition-height"
    >
      {/* Resizer drag bar */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute top-0 inset-x-0 h-1.5 cursor-ns-resize transition-colors z-20"
        style={{
          backgroundColor: isDraggingRef.current ? theme.accent : 'transparent'
        }}
        title="Drag upward to resize terminal"
      />

      {/* Terminal Title Bar */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="h-10 border-b flex items-center justify-between px-4 bg-zinc-950/20 z-10 shrink-0"
      >
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold selection:bg-transparent">
          <Terminal size={14} style={{ color: theme.accent }} />
          <span>Terminal console buffer</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSendCommand('diagnose')}
            className="flex items-center space-x-1 px-2.5 py-1 text-[9px] rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition uppercase font-semibold"
          >
            <RefreshCw size={10} style={{ color: theme.accent }} />
            <span>Diagnose</span>
          </button>
          
          <button
            onClick={onClear}
            className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-500 hover:text-rose-500 transition"
            title="Clear Buffer Logs"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Log Feed Buffer */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 select-text text-[11px] leading-relaxed"
        style={{
          color: theme.isLight ? '#1f2937' : '#e4e4e7',
        }}
      >
        {lines.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-6">
            Terminal console active. Type 'help' to check standard sandboxed diagnostic commands.
          </div>
        ) : (
          lines.map((line) => {
            let rowColor = 'text-zinc-300';
            let prefix = '● ';

            if (line.type === 'success') {
              rowColor = 'text-green-500';
              prefix = '✔ ';
            } else if (line.type === 'warning') {
              rowColor = 'text-amber-500';
              prefix = '⚠ ';
            } else if (line.type === 'error') {
              rowColor = 'text-rose-500 font-bold';
              prefix = '✘ ';
            } else if (line.type === 'input') {
              rowColor = 'font-semibold';
              prefix = '$ ';
            }

            return (
              <div 
                key={line.id} 
                className={`flex items-start ${rowColor}`}
                style={line.type === 'input' ? { color: theme.accent } : undefined}
              >
                <span className="shrink-0 mr-1.5 opacity-80">{prefix}</span>
                <span className="font-mono break-all whitespace-pre-wrap">{line.text}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Prompt Interaction Row */}
      <form
        onSubmit={handleSubmit}
        style={{ borderColor: theme.borderColor }}
        className="h-10 border-t flex items-center px-4 bg-zinc-950/60 shrink-0"
      >
        <span style={{ color: theme.accent }} className="font-extrabold mr-2 select-none">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Command (e.g. compile, run, clear, help)..."
          className="flex-1 bg-transparent border-none text-zinc-100 outline-none placeholder-zinc-650 font-mono text-[11px]"
        />
        <button
          type="submit"
          className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold uppercase tracking-widest font-mono flex items-center"
        >
          <span>Send</span>
          <ArrowUpRight size={12} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
}
