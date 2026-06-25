import React, { useState } from 'react';
import { 
  Info, Cpu, Code, TerminalSquare, Github, GitBranch, RefreshCw, CheckCircle2, 
  FileCode, Layers, HelpCircle, HardDrive, Key, Settings, AlertCircle, PlusCircle,
  Clock, GitPullRequest, Radio
} from 'lucide-react';
import { AppTheme, UserSettings, FileNode } from '../types';

interface AboutViewProps {
  theme: AppTheme;
  settings: UserSettings;
  files: FileNode[];
}

interface CommitLog {
  hash: string;
  message: string;
  time: string;
  author: string;
}

export default function AboutView({ theme, settings, files }: AboutViewProps) {
  const [repoUrl, setRepoUrl] = useState(settings.gitSync?.repositoryUrl || 'https://github.com/incognito-updates/workspace-lua');
  const [selectedBranch, setSelectedBranch] = useState(settings.gitSync?.syncBranch || 'main');
  const [githubToken, setGithubToken] = useState('ghp_••••••••••••••••••••••••••••••••');
  const [showToken, setShowToken] = useState(false);
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle');
  const [commits, setCommits] = useState<CommitLog[]>([
    { hash: 'df39a8c', message: 'Optimize Lua compiler garbage collection cycles', time: 'Just now', author: settings.account.isPrivate ? '[REDACTED]' : settings.account.username },
    { hash: 'e48a129', message: 'Initialize secure workspace environment schema', time: 'Yesterday', author: 'IncognitoBot' },
    { hash: '8b2c451', message: 'Add custom Lua syntax validator profiles', time: '3 days ago', author: 'Architect' }
  ]);
  const [newCommitMsg, setNewCommitMsg] = useState('');

  // Calculate high-fidelity stats
  const scriptFiles = files.filter(f => f.type === 'file');
  const directories = files.filter(f => f.type === 'folder');
  
  let totalBytes = 0;
  let totalLines = 0;
  scriptFiles.forEach(f => {
    totalBytes += f.size || (f.content?.length || 0);
    totalLines += (f.content || '').split('\n').length;
  });

  const handleManualGitSync = () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    
    // Simulate real sync steps
    setTimeout(() => {
      setSyncStatus('completed');
      
      const newCommit: CommitLog = {
        hash: Math.random().toString(16).substring(2, 9),
        message: newCommitMsg.trim() || 'Synchronize workspace files & code modules',
        time: 'Just now',
        author: settings.account.isPrivate ? '[REDACTED]' : settings.account.username
      };

      setCommits(prev => [newCommit, ...prev]);
      setNewCommitMsg('');

      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 font-sans text-left pb-24 bg-zinc-950">
      
      {/* Title */}
      <div className="pb-4 border-b text-left" style={{ borderColor: theme.borderColor }}>
        <h1 className="text-xl font-extrabold tracking-tight uppercase flex items-center space-x-2.5" style={{ color: theme.textMain }}>
          <Layers className="w-5 h-5 shrink-0" style={{ color: theme.accent }} />
          <span>Workspace Environment</span>
        </h1>
        <p className="text-xs mt-1 font-mono tracking-tight text-zinc-500">
          Simplify integration, monitor directory telemetry, and establish secure repository pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-6xl text-left">
        
        {/* GitHub Repository Connection Center */}
        <div 
          className="border p-5 rounded-2xl space-y-5 shadow-xs md:col-span-2 relative overflow-hidden" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.borderColor }}>
            <div className="flex items-center space-x-2">
              <Github size={16} style={{ color: theme.accent }} />
              <h3 className="text-xs font-black font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                GitHub Repository Integration
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[8px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Connected
              </span>
            </div>
          </div>

          {/* Connected Repository Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest block text-zinc-500">
                Target Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full py-2 px-3 bg-black/40 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest block text-zinc-500">
                Active Sync Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full py-2 px-3 bg-[#0d0e11] border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700 transition cursor-pointer"
              >
                <option value="main">main (production)</option>
                <option value="dev">dev (testing)</option>
                <option value="release">release (stable)</option>
              </select>
            </div>

            <div className="space-y-1.5 text-left sm:col-span-2">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest block text-zinc-500 flex justify-between items-center">
                <span>Personal Access Token (PAT)</span>
                <button 
                  onClick={() => setShowToken(!showToken)}
                  className="text-[8px] text-zinc-400 hover:text-white uppercase tracking-normal"
                >
                  {showToken ? 'Hide' : 'Reveal'}
                </button>
              </label>
              <div className="relative">
                <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full py-2 pl-9 pr-4 bg-black/40 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
                />
              </div>
            </div>
          </div>

          {/* Webhooks & Options */}
          <div className="p-3.5 bg-black/30 rounded-xl border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <Radio size={14} className="text-zinc-500 mt-0.5 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-bold font-mono text-zinc-200">Automatic Deployment Webhooks</div>
                <div className="text-[9px] font-mono text-zinc-500">Simulate incoming repo events to trigger dynamic Luau server-side builds.</div>
              </div>
            </div>
            <button
              onClick={() => setWebhooksEnabled(!webhooksEnabled)}
              className={`px-3 py-1 rounded-lg text-[9px] font-mono font-black uppercase transition cursor-pointer ${
                webhooksEnabled 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' 
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}
            >
              {webhooksEnabled ? 'Webhooks Active' : 'Disabled'}
            </button>
          </div>

          {/* Commit & Sync Action */}
          <div className="border-t pt-4 space-y-3" style={{ borderColor: theme.borderColor }}>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                placeholder="Optional commit message (e.g., Fix module sandbox syntax)"
                value={newCommitMsg}
                onChange={(e) => setNewCommitMsg(e.target.value)}
                className="flex-1 py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
              <button
                onClick={handleManualGitSync}
                disabled={syncStatus === 'syncing'}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono transition uppercase cursor-pointer shrink-0"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.isLight ? '#ffffff' : '#000000'
                }}
              >
                {syncStatus === 'syncing' ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : syncStatus === 'completed' ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <RefreshCw size={12} />
                )}
                <span>
                  {syncStatus === 'syncing' ? 'Publishing...' : syncStatus === 'completed' ? 'Synced Upstream' : 'Commit & Push'}
                </span>
              </button>
            </div>
          </div>

          {/* Sync status / Upstream commit logs */}
          <div className="space-y-2">
            <div className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-500 flex items-center space-x-1">
              <Clock size={10} />
              <span>Repository Version History Logs</span>
            </div>
            <div className="space-y-1.5">
              {commits.map((c) => (
                <div 
                  key={c.hash} 
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-900 bg-black/10 hover:bg-black/25 transition text-left"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-[9px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-850 shrink-0">
                      {c.hash}
                    </span>
                    <span className="text-xs font-mono text-zinc-300 truncate" style={{ color: theme.textMain }}>
                      {c.message}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-550 shrink-0 uppercase ml-2">
                    {c.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATS & DIAGNOSTICS COLUMN */}
        <div className="space-y-6">
          
          {/* File Tree Stats */}
          <div 
            className="border p-5 rounded-2xl space-y-4 shadow-xs" 
            style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
          >
            <h3 className="text-xs font-black font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
              <HardDrive size={14} className="mr-2" style={{ color: theme.accent }} />
              Directory Telemetry
            </h3>

            <div className="space-y-3 text-xs font-mono text-left" style={{ color: theme.textMuted }}>
              <div className="flex justify-between border-b pb-1.5 border-zinc-900">
                <span>TOTAL MODULES</span>
                <span className="font-extrabold" style={{ color: theme.textMain }}>{scriptFiles.length} File(s)</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-zinc-900">
                <span>PROJECT DIRECTORIES</span>
                <span className="font-semibold text-zinc-350" style={{ color: theme.textMain }}>{directories.length} Folder(s)</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-zinc-900">
                <span>LINES OF LUAU CODE</span>
                <span style={{ color: theme.textMain }}>{totalLines} Lines</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-zinc-900">
                <span>ESTIMATED DATA FOOTPRINT</span>
                <span style={{ color: theme.textMain }}>{(totalBytes / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </div>

          {/* Compiler Host Specifications */}
          <div 
            className="border p-5 rounded-2xl space-y-4 shadow-xs" 
            style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
          >
            <h3 className="text-xs font-black font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
              <Cpu size={14} className="mr-2" style={{ color: theme.accent }} />
              Engine Specifications
            </h3>

            <div className="space-y-3 text-xs font-mono" style={{ color: theme.textMuted }}>
              <div className="flex justify-between border-b pb-1.5 border-zinc-900">
                <span>SYNTAX SCHEME ID</span>
                <span className="font-semibold text-zinc-350" style={{ color: theme.accent }}>
                  {settings.syntax.engineId.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-zinc-900">
                <span>SANDBOX COMPILER</span>
                <span className="font-semibold text-zinc-350" style={{ color: theme.textMain }}>INCOGNITO COMPILER v3.4</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-zinc-900">
                <span>KEYBIND SCHEMA</span>
                <span style={{ color: theme.textMain }}>STANDARD / MONACO</span>
              </div>
            </div>
          </div>

          {/* Shortcut Keys Quick Cheat Sheet */}
          <div 
            className="border p-5 rounded-2xl space-y-4 shadow-xs" 
            style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
          >
            <h3 className="text-xs font-black font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
              <TerminalSquare size={14} className="mr-2" style={{ color: theme.accent }} />
              Workspace Hotkeys
            </h3>

            <div className="space-y-2 text-xs font-mono text-zinc-400">
              <div className="flex justify-between items-center p-2 rounded bg-black/30 border border-zinc-900">
                <span className="font-bold text-zinc-200">Ctrl + P</span>
                <span className="text-[9px] uppercase text-zinc-500">Search Workspace</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-black/30 border border-zinc-900">
                <span className="font-bold text-zinc-200">Ctrl + S</span>
                <span className="text-[9px] uppercase text-zinc-500">Compile & Cache</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
