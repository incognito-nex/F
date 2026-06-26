import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Plus, Star, ArrowRight,
  Terminal, Settings, Flame, Cpu, Activity, Zap, CheckCircle2, ExternalLink, GitBranch
} from 'lucide-react';
import { FileNode, AppTheme, UserSettings } from '../types';

interface DashboardProps {
  files: FileNode[];
  onOpenFileInEditor: (fileId: string) => void;
  onCreateNewFile: (name: string, type: 'file' | 'folder', content?: string) => void;
  onClearTerminal: () => void;
  theme: AppTheme;
  settings: UserSettings;
  setActiveSection: (sec: string) => void;
  injectionStatus?: 'READY' | 'INJECTING' | 'SUCCESS' | 'FAILED';
  injectionLog?: string;
  triggerSimulation?: () => void;
}

export default function Dashboard({
  files,
  onOpenFileInEditor,
  onCreateNewFile,
  theme,
  settings,
  setActiveSection,
  injectionStatus: propInjectionStatus,
  injectionLog: propInjectionLog,
  triggerSimulation: propTriggerSimulation,
}: DashboardProps) {
  
  const [statusColorText, setStatusColorText] = useState('green');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeHomeTab, setActiveHomeTab] = useState<'overview' | 'updates'>('overview');

  const getCardColor = (cardIndex: number): string => {
    const isSynced = settings.appearance?.cardColorMode === 'synced';
    if (isSynced) {
      return theme.accent;
    }
    // Default colorful colorways
    const colors = [
      '#10b981', // Emerald (Card 1)
      '#0ea5e9', // Sky (Card 2)
      '#8b5cf6', // Violet (Card 3)
      '#d946ef', // Fuchsia (Card 4)
      '#f59e0b', // Amber (Card 5)
      '#f43f5e', // Rose (Card 6)
    ];
    return colors[cardIndex] || theme.accent;
  };

  // Simulated Executor Core Telemetry States
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] >> Lua virtual thread active`,
    `[${new Date().toLocaleTimeString()}] >> Memory registers verified stable`,
    `[${new Date().toLocaleTimeString()}] >> Status channel: secure`
  ]);
  const [simulatedFps, setSimulatedFps] = useState(144.2);
  const [simulatedCpu, setSimulatedCpu] = useState(0.65);
  const [simulatedMem, setSimulatedMem] = useState(38.2);
  const [activeThreads, setActiveThreads] = useState(4);

  // Parent status synchronization
  const [localInjectionStatus, setLocalInjectionStatus] = useState<'READY' | 'INJECTING' | 'SUCCESS' | 'FAILED'>('READY');
  const [localInjectionLog, setLocalInjectionLog] = useState<string>('');

  const injectionStatus = propInjectionStatus !== undefined ? propInjectionStatus : localInjectionStatus;
  const injectionLog = propInjectionLog !== undefined ? propInjectionLog : localInjectionLog;

  const triggerSimulation = propTriggerSimulation || (() => {
    if (injectionStatus !== 'READY') return;
    setLocalInjectionStatus('INJECTING');
    setLocalInjectionLog('Scanning game registers...');
    
    setTimeout(() => {
      setLocalInjectionLog('Hooking Lua thread scheduler...');
    }, 700);
    
    setTimeout(() => {
      setLocalInjectionLog('Injecting core bypass libraries...');
    }, 1400);

    setTimeout(() => {
      setLocalInjectionLog('Validating sandbox security borders...');
    }, 2100);

    setTimeout(() => {
      setLocalInjectionLog('Active Connection Established!');
      setLocalInjectionStatus('SUCCESS');
    }, 2800);
  });

  // Automatically sync logs when status updates from anywhere
  useEffect(() => {
    if (injectionStatus === 'SUCCESS') {
      setLogs(prev => {
        if (prev.some(log => log.includes('Lua executor attached successfully'))) return prev;
        return [
          ...prev,
          `[${new Date().toLocaleTimeString()}] >> [SUCCESS] Lua executor attached successfully.`,
          `[${new Date().toLocaleTimeString()}] >> Hook integrity check: 100% active`
        ];
      });
    } else if (injectionStatus === 'READY') {
      setLogs([
        `[${new Date().toLocaleTimeString()}] >> Lua virtual thread active`,
        `[${new Date().toLocaleTimeString()}] >> Memory registers verified stable`,
        `[${new Date().toLocaleTimeString()}] >> Status channel: secure`
      ]);
    }
  }, [injectionStatus]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedFps(prev => +(prev + (Math.random() * 1.6 - 0.8)).toFixed(1));
      setSimulatedCpu(prev => +(Math.max(0.1, prev + (Math.random() * 0.28 - 0.14))).toFixed(2));
      setSimulatedMem(prev => +(Math.max(10.0, prev + (Math.random() * 0.4 - 0.2))).toFixed(1));
      setActiveThreads(prev => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(3, Math.min(10, prev + change));
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Fetch status color from tracker on mount
  useEffect(() => {
    const fetchStatusColor = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/incognito-updates/tracker/refs/heads/main/colour');
        if (response.ok) {
          const text = (await response.text()).trim().toLowerCase();
          if (['green', 'red', 'yellow'].includes(text)) {
            setStatusColorText(text);
          }
        }
      } catch (e) {
        console.warn("Error fetching status color from tracker:", e);
      }
    };
    fetchStatusColor();
  }, []);

  // Left column variables
  const recentFiles = [...files]
    .filter(f => f.type === 'file')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const favoriteFiles = [...files]
    .filter(f => f.type === 'file' && f.isFavorite)
    .slice(0, 4);

  const handleCreateNewScript = () => {
    const scriptName = `script_${Math.floor(Math.random() * 900) + 100}.lua`;
    onCreateNewFile(scriptName, 'file', '-- Welcome to Lua/u workspace\nprint("Hello World from Incognito IDE!")');
    setActiveSection('editor');
  };

  return (
    <div className="flex-1 flex min-h-0" style={{ backgroundColor: theme.bodyBg }}>
      {/* Home Quick Access Sidebar Menu - No background, logos highlight white on hover/active */}
      <div 
        className="w-16 flex flex-col items-center py-6 border-r shrink-0 gap-6 select-none"
        style={{ borderColor: theme.borderColor }}
      >
        {/* Overview Button */}
        <button
          onClick={() => setActiveHomeTab('overview')}
          className="relative p-2.5 transition-all group cursor-pointer text-zinc-500 hover:text-white"
          title="Overview"
        >
          <Flame 
            size={18} 
            className={`transition-all ${activeHomeTab === 'overview' ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-zinc-500 group-hover:text-zinc-300'}`} 
          />
        </button>

        {/* Updates Button */}
        <button
          onClick={() => setActiveHomeTab('updates')}
          className="relative p-2.5 transition-all group cursor-pointer text-zinc-500 hover:text-white"
          title="Updates Feed"
        >
          <Activity 
            size={18} 
            className={`transition-all ${activeHomeTab === 'updates' ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-zinc-500 group-hover:text-zinc-300'}`} 
          />
        </button>

        {/* Discord Redirect Button */}
        <a
          href="https://discord.gg/427WYSChRt"
          target="_blank"
          rel="noopener noreferrer"
          className="relative p-2.5 transition-all group cursor-pointer text-zinc-500 hover:text-white"
          title="Discord Community"
        >
          <ExternalLink 
            size={18} 
            className="transition-all text-zinc-500 group-hover:text-white group-hover:scale-110" 
          />
        </a>
      </div>

      {/* Main Home Area */}
      {activeHomeTab === 'overview' ? (
        <div 
          id="dashboard-viewport" 
          className="flex-1 flex flex-col min-h-0 overflow-y-auto relative select-none pb-12"
          style={{
            backgroundColor: theme.bodyBg,
            color: theme.textMain,
            backgroundImage: theme.isLight 
              ? 'radial-gradient(rgba(0,0,0,0.015) 1px, transparent 1px)' 
              : 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        >
          {/* Laser Scanning Sweep Line */}
          <div 
            className="absolute top-0 left-0 w-full h-[1px] animate-[pulse_3s_infinite] pointer-events-none z-20"
            style={{
              background: `linear-gradient(to right, transparent, ${theme.accent}80, transparent)`
            }}
          />

          {/* Ambient Radial Glows */}
          <div 
            style={{
              background: `radial-gradient(circle at 50% 15%, ${theme.accent}12, transparent 50%)`
            }}
            className="absolute inset-0 pointer-events-none" 
          />

          {/* Main Container Layout */}
          <div className="p-6 space-y-8 max-w-7xl mx-auto w-full z-10 relative text-left pt-10">
            
            {/* Sleek welcome header row with status in top right */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-zinc-800/30">
              <div className="flex flex-col space-y-1.5 text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: theme.textMain }}>
                  Hello, <span style={{ color: theme.accent }}>{settings.account?.isPrivate ? '[REDACTED]' : (settings.account?.username || 'Developer')}</span>
                </h1>
                <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                  Create, Innovate without a single detection with high UNC.
                </p>
              </div>

              {/* Small network status pill in top right of home */}
              <div 
                style={{ borderColor: theme.borderColor, backgroundColor: theme.cardBg }}
                className="flex items-center space-x-2 px-3 py-1.5 border rounded-xl shadow-xs self-start md:self-auto"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: statusColorText === 'red' ? '#ef4444' : statusColorText === 'yellow' ? '#f59e0b' : '#10b981' }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: statusColorText === 'red' ? '#ef4444' : statusColorText === 'yellow' ? '#f59e0b' : '#10b981' }}></span>
                </span>
                <span className="text-[9.5px] font-mono font-bold tracking-wider" style={{ color: theme.textMain }}>
                  EXECUTOR STATUS: <span style={{ color: statusColorText === 'red' ? '#ef4444' : statusColorText === 'yellow' ? '#f59e0b' : '#10b981' }}>{statusColorText === 'red' ? 'OFFLINE' : statusColorText === 'yellow' ? 'MAINTENANCE' : 'ACTIVE'}</span>
                </span>
              </div>
            </div>

            {/* Six Telemetry HUD cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              
              {/* Card 1: Injection Status */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.02 }}
                onClick={triggerSimulation}
                style={{ 
                  borderColor: injectionStatus === 'SUCCESS' ? `${getCardColor(0)}80` : theme.borderColor,
                  backgroundColor: theme.cardBg,
                  boxShadow: injectionStatus === 'SUCCESS'
                    ? `0 0 15px ${getCardColor(0)}15` 
                    : 'none',
                }}
                className="p-4.5 rounded-xl border text-left relative overflow-hidden backdrop-blur-md transition-all duration-300 group cursor-pointer"
              >
                <div 
                  style={{ backgroundColor: `${getCardColor(0)}0a` }}
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none" 
                />
                <div className="flex items-center justify-between">
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono font-bold tracking-widest uppercase">
                    Injection Status
                  </span>
                  <Zap 
                    size={13} 
                    className={`transition-colors ${injectionStatus === 'SUCCESS' ? 'text-emerald-400' : injectionStatus === 'INJECTING' ? 'text-amber-400 animate-spin' : ''}`}
                    style={{ color: injectionStatus === 'SUCCESS' ? undefined : injectionStatus === 'INJECTING' ? undefined : getCardColor(0) }}
                  />
                </div>
                <div className="mt-4">
                  <span 
                    className="text-xl font-extrabold font-mono tracking-tight drop-shadow-md"
                    style={{ color: injectionStatus === 'SUCCESS' ? '#10b981' : injectionStatus === 'INJECTING' ? '#fbbf24' : theme.textMain }}
                  >
                    {injectionStatus === 'SUCCESS' ? 'Injected' : injectionStatus === 'INJECTING' ? 'Injecting...' : 'Not Injected'}
                  </span>
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono block mt-1.5 leading-relaxed">
                    {injectionStatus === 'SUCCESS' ? 'Bypass active and ready' : 'Not hooked to game process'}
                  </span>
                </div>
              </motion.div>

              {/* Card 2: UNC Compatibility */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.04 }}
                style={{ 
                  borderColor: theme.borderColor,
                  backgroundColor: theme.cardBg,
                  boxShadow: 'none',
                }}
                className="p-4.5 rounded-xl border text-left relative overflow-hidden backdrop-blur-md transition-all duration-300 group"
              >
                <div 
                  style={{ backgroundColor: `${getCardColor(1)}0a` }}
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none" 
                />
                <div className="flex items-center justify-between">
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono font-bold tracking-widest uppercase">
                    UNC Compatibility
                  </span>
                  <Activity size={13} style={{ color: getCardColor(1) }} />
                </div>
                <div className="mt-4">
                  <span style={{ color: theme.textMain }} className="text-xl font-extrabold font-mono tracking-tight drop-shadow-md">
                    98.7% Supported
                  </span>
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono block mt-1.5 leading-relaxed">
                    Meets complete execution guidelines
                  </span>
                </div>
              </motion.div>

              {/* Card 3: Active Threads */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.06 }}
                style={{ 
                  borderColor: theme.borderColor,
                  backgroundColor: theme.cardBg,
                  boxShadow: 'none',
                }}
                className="p-4.5 rounded-xl border text-left relative overflow-hidden backdrop-blur-md transition-all duration-300 group"
              >
                <div 
                  style={{ backgroundColor: `${getCardColor(2)}0a` }}
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none" 
                />
                <div className="flex items-center justify-between">
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono font-bold tracking-widest uppercase">
                    Active Threads
                  </span>
                  <Cpu size={13} style={{ color: getCardColor(2) }} />
                </div>
                <div className="mt-4">
                  <span style={{ color: theme.textMain }} className="text-xl font-extrabold font-mono tracking-tight drop-shadow-md">
                    {activeThreads} Threads
                  </span>
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono block mt-1.5 leading-relaxed">
                    Number of running Lua threads
                  </span>
                </div>
              </motion.div>

              {/* Card 4: Lua Heap Usage */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.08 }}
                style={{ 
                  borderColor: theme.borderColor,
                  backgroundColor: theme.cardBg,
                  boxShadow: 'none',
                }}
                className="p-4.5 rounded-xl border text-left relative overflow-hidden backdrop-blur-md transition-all duration-300 group"
              >
                <div 
                  style={{ backgroundColor: `${getCardColor(3)}0a` }}
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none" 
                />
                <div className="flex items-center justify-between">
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono font-bold tracking-widest uppercase">
                    Lua Heap Usage
                  </span>
                  <Cpu size={13} style={{ color: getCardColor(3) }} />
                </div>
                <div className="mt-4">
                  <span style={{ color: theme.textMain }} className="text-xl font-extrabold font-mono tracking-tight drop-shadow-md">
                    {simulatedMem} MB
                  </span>
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono block mt-1.5 leading-relaxed">
                    Memory used by the executor's Lua VM
                  </span>
                </div>
              </motion.div>

              {/* Card 5: Execution Success Rate */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                style={{ 
                  borderColor: theme.borderColor,
                  backgroundColor: theme.cardBg,
                  boxShadow: 'none',
                }}
                className="p-4.5 rounded-xl border text-left relative overflow-hidden backdrop-blur-md transition-all duration-300 group"
              >
                <div 
                  style={{ backgroundColor: `${getCardColor(4)}0a` }}
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none" 
                />
                <div className="flex items-center justify-between">
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono font-bold tracking-widest uppercase">
                    Execution Success Rate
                  </span>
                  <CheckCircle2 size={13} style={{ color: getCardColor(4) }} />
                </div>
                <div className="mt-4">
                  <span style={{ color: theme.textMain }} className="text-xl font-extrabold font-mono tracking-tight drop-shadow-md">
                    99.4%
                  </span>
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono block mt-1.5 leading-relaxed">
                    Percentage of scripts that executed successfully
                  </span>
                </div>
              </motion.div>

              {/* Card 6: CPU Usage */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.12 }}
                style={{ 
                  borderColor: theme.borderColor,
                  backgroundColor: theme.cardBg,
                  boxShadow: 'none',
                }}
                className="p-4.5 rounded-xl border text-left relative overflow-hidden backdrop-blur-md transition-all duration-300 group"
              >
                <div 
                  style={{ backgroundColor: `${getCardColor(5)}0a` }}
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none" 
                />
                <div className="flex items-center justify-between">
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono font-bold tracking-widest uppercase">
                    CPU Usage
                  </span>
                  <Activity size={13} style={{ color: getCardColor(5) }} />
                </div>
                <div className="mt-4">
                  <span style={{ color: theme.textMain }} className="text-xl font-extrabold font-mono tracking-tight drop-shadow-md">
                    {simulatedCpu}%
                  </span>
                  <span style={{ color: theme.textMuted }} className="text-[10px] font-mono block mt-1.5 leading-relaxed">
                    Current executor process CPU usage
                  </span>
                </div>
              </motion.div>

            </div>

            {/* Console logs status panel */}
            <div 
              className="border rounded-xl overflow-hidden shadow-2xl relative"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/5 to-transparent pointer-events-none" />
              <div 
                className="px-4 py-2.5 border-b flex items-center justify-between"
                style={{ backgroundColor: theme.headerBg, borderColor: theme.borderColor }}
              >
                <div className="flex items-center space-x-2">
                  <Terminal size={11} style={{ color: theme.accent }} />
                  <span style={{ color: theme.textMain }} className="text-[10px] font-mono font-bold tracking-wider uppercase">
                    Executor VM Status Log
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500/30" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/30" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
                </div>
              </div>
              
              <div className="p-4.5 font-mono text-[10px] leading-relaxed text-left space-y-1.5 max-h-36 overflow-y-auto select-text scrollbar-thin">
                {logs.map((log, lIdx) => (
                  <div key={lIdx} style={{ color: theme.textMuted }} className="hover:opacity-80 transition duration-100">
                    <span style={{ color: theme.accent }} className="font-bold">[{lIdx + 1}]</span> {log}
                  </div>
                ))}
                
                {injectionStatus === 'INJECTING' && (
                  <div className="text-amber-500 font-bold animate-pulse">
                    &gt;&gt; [SYS] {injectionLog}
                  </div>
                )}
                {injectionStatus === 'SUCCESS' && (
                  <div className="text-emerald-500 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                    <span>&gt;&gt; [VM] Active Hook Connected: {injectionLog}</span>
                  </div>
                )}
                
                <div style={{ color: theme.accent }} className="blink font-bold">&gt; _</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-4">
              <h2 style={{ color: theme.textMuted }} className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2">
                <Flame size={10} className="text-amber-500 animate-pulse shrink-0" />
                <span>Workspace Management Quick-Actions</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                <button
                  onClick={handleCreateNewScript}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                  className="p-5 rounded-xl border text-left flex items-start space-x-4 hover:opacity-95 hover:scale-[1.01] transition-all duration-300 shadow-sm cursor-pointer group"
                >
                  <div 
                    style={{
                      color: '#10b981',
                      backgroundColor: 'rgba(16,185,129,0.1)',
                      borderColor: 'rgba(16,185,129,0.2)'
                    }}
                    className="p-3 rounded-lg border group-hover:bg-emerald-500/20 transition-colors"
                  >
                    <Plus size={16} />
                  </div>
                  <div className="text-left">
                    <span style={{ color: theme.textMain }} className="text-xs font-bold font-mono tracking-tight block">Append New script</span>
                    <span style={{ color: theme.textMuted }} className="text-[10px] block mt-1 leading-relaxed">Creates a fresh Lua code node inside space</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('settings')}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                  className="p-5 rounded-xl border text-left flex items-start space-x-4 hover:opacity-95 hover:scale-[1.01] transition-all duration-300 shadow-sm cursor-pointer group"
                >
                  <div 
                    style={{
                      color: theme.accent,
                      backgroundColor: `${theme.accent}15`,
                      borderColor: `${theme.accent}30`
                    }}
                    className="p-3 rounded-lg border group-hover:bg-opacity-20 transition-colors"
                  >
                    <Settings size={16} />
                  </div>
                  <div className="text-left">
                    <span style={{ color: theme.textMain }} className="text-xs font-bold font-mono tracking-tight block">Lua configuration</span>
                    <span style={{ color: theme.textMuted }} className="text-[10px] block mt-1 leading-relaxed">Define syntax engines, profiles and theme guides</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Recently Modified & Pinned Hubs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Recent Files List */}
              <div className="space-y-4">
                <h2 style={{ color: theme.textMuted }} className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2">
                  <FileText size={10} style={{ color: theme.accent }} className="shrink-0" />
                  <span>Recently Modified scripts</span>
                </h2>
                <div className="space-y-2.5">
                  {recentFiles.length === 0 ? (
                    <div 
                      style={{ borderColor: theme.borderColor, color: theme.textMuted }} 
                      className="border border-dashed p-8 rounded-xl text-center text-xs font-mono"
                    >
                      No scripts cached in memory.
                    </div>
                  ) : (
                    recentFiles.map(file => (
                      <div
                        key={file.id}
                        onClick={() => onOpenFileInEditor(file.id)}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                        className="p-4 rounded-xl border hover:opacity-90 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div 
                            style={{
                              color: theme.accent,
                              backgroundColor: `${theme.accent}10`,
                              borderColor: `${theme.accent}20`
                            }}
                            className="p-2 rounded-lg border group-hover:bg-opacity-20 transition-colors"
                          >
                            <FileText size={12} className="shrink-0" />
                          </div>
                          <div className="text-left min-w-0">
                            <span 
                              style={{ color: theme.textMain }}
                              className="text-xs font-bold font-mono truncate block group-hover:opacity-80 transition-opacity"
                            >
                              {file.name}
                            </span>
                            <span style={{ color: theme.textMuted }} className="text-[9px] font-mono block mt-0.5">
                              Length: {file.size} characters
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={12} style={{ color: theme.textMuted }} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Favorite Files List */}
              <div className="space-y-4">
                <h2 style={{ color: theme.textMuted }} className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2">
                  <Star size={10} className="text-amber-500 shrink-0" />
                  <span>Pinned script hub</span>
                </h2>
                <div className="space-y-2.5">
                  {favoriteFiles.length === 0 ? (
                    <div 
                      style={{ borderColor: theme.borderColor, color: theme.textMuted }}
                      className="border border-dashed p-8 rounded-xl text-center text-xs font-mono"
                    >
                      No pinned script slots reserved yet.
                    </div>
                  ) : (
                    favoriteFiles.map(file => (
                      <div
                        key={file.id}
                        onClick={() => onOpenFileInEditor(file.id)}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                        className="p-4 rounded-xl border hover:opacity-90 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="p-2 rounded-lg bg-amber-500/5 text-amber-500 border border-amber-500/10 group-hover:bg-amber-500/10 transition-colors">
                            <Star size={12} className="fill-amber-500/10 shrink-0" />
                          </div>
                          <div className="text-left min-w-0">
                            <span 
                              style={{ color: theme.textMain }}
                              className="text-xs font-bold font-mono truncate block group-hover:text-amber-400 transition-colors"
                            >
                              {file.name}
                            </span>
                            <span style={{ color: theme.textMuted }} className="text-[9px] font-mono block mt-0.5">
                              Locked execution slot
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={12} style={{ color: theme.textMuted }} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* Real-time System Updates Feed - Styled beautifully from Git tracker */
        <div 
          id="dashboard-viewport" 
          className="flex-1 flex flex-col min-h-0 overflow-y-auto relative select-none pb-12"
          style={{
            backgroundColor: theme.bodyBg,
            color: theme.textMain,
            backgroundImage: theme.isLight 
              ? 'radial-gradient(rgba(0,0,0,0.015) 1px, transparent 1px)' 
              : 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        >
          <div 
            style={{
              background: `radial-gradient(circle at 50% 15%, ${theme.accent}12, transparent 50%)`
            }}
            className="absolute inset-0 pointer-events-none" 
          />

          <div className="p-6 space-y-8 max-w-7xl mx-auto w-full z-10 relative text-left pt-10">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/30">
              <div className="flex flex-col space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: theme.textMain }}>
                  Latest System <span style={{ color: theme.accent }}>Updates</span>
                </h1>
                <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                  Real-time synchronization logs tracking upstream repository status
                </p>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/40 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-zinc-400">
                <GitBranch size={10} className="text-zinc-500" />
                <span>origin/main</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Release 1 */}
              <div 
                className="p-5 rounded-xl border text-left relative overflow-hidden bg-zinc-950/45"
                style={{ borderColor: theme.borderColor }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40 uppercase tracking-wider">
                    Released
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">v5.4.1 (Stable)</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-3 font-sans">Incremental Core Lua Compiler Tuning</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans space-y-1">
                  • Fully replaced all remnants of Luau executor with lightweight standard Lua 5.1/5.2 compiler constraints.<br />
                  • Resolved memory heap threshold leaks during long execution sessions.<br />
                  • Strengthened UNC compliance rates for script safety borders.
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Commit hash: <span className="text-zinc-400 select-all">e5f8a12</span></span>
                  <span>Synced 2 hours ago</span>
                </div>
              </div>

              {/* Release 2 */}
              <div 
                className="p-5 rounded-xl border text-left relative overflow-hidden bg-zinc-950/45"
                style={{ borderColor: theme.borderColor }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-850 uppercase tracking-wider">
                    Archived
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">v5.3.0</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-300 mt-3 font-sans">Advanced VS Code Connection Tunnel Support</h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-sans">
                  • Implemented dual socket/polling synchronizer tunnels for local file persistence.<br />
                  • Added customizable ignored paths checker directly inside side panel options.<br />
                  • Introduced connection ping testing logs to verify message latency.
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Commit hash: <span className="text-zinc-600 select-all">4b9d0e1</span></span>
                  <span>Synced 1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
