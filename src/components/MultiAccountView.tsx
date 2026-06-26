import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Plus, Trash2, CheckCircle2, RefreshCw, Unplug, Zap, Play, Terminal, VolumeX, Shield, Circle, ExternalLink, Flame } from 'lucide-react';
import { AppTheme, UserSettings } from '../types';

interface RobloxAccount {
  id: string;
  pid: number;
  username: string;
  status: 'READY' | 'INJECTED' | 'FAILED';
  placeId: string;
  ping: number;
  fps: number;
  joinedAt: string;
}

interface MultiAccountViewProps {
  theme: AppTheme;
  settings: UserSettings;
  triggerToast: (message: string, type: 'clear' | 'inject' | 'execute' | 'success' | 'info') => void;
}

export default function MultiAccountView({ theme, settings, triggerToast }: MultiAccountViewProps) {
  const [accounts, setAccounts] = useState<RobloxAccount[]>([
    { id: 'acc-1', pid: 18402, username: 'Main_Architect', status: 'INJECTED', placeId: '185655149', ping: 24, fps: 144, joinedAt: '12:04:15 PM' },
    { id: 'acc-2', pid: 9140, username: 'Farming_Alt01', status: 'READY', placeId: '501009122', ping: 48, fps: 60, joinedAt: '12:06:40 PM' },
    { id: 'acc-3', pid: 12592, username: 'Trading_Bot_03', status: 'INJECTED', placeId: '501009122', ping: 35, fps: 60, joinedAt: '12:10:02 PM' },
  ]);

  const [newPid, setNewPid] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPlaceId, setNewPlaceId] = useState('185655149');
  
  // Script execute text state
  const [globalScript, setGlobalScript] = useState('print("Executing multi-instance cluster script")\ntask.wait(0.5)\nwarn("Cluster state verified")');
  
  // Custom multi options
  const [multiConfig, setMultiConfig] = useState({
    unlockFps: true,
    muteInactive: false,
    antiAfk: true,
    cpuLimiter: false,
    autoAttach: false
  });

  const handleConnectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const pidNum = parseInt(newPid.trim());
    const user = newUsername.trim() || `Alt_Player_${Math.floor(Math.random() * 900) + 100}`;

    if (isNaN(pidNum) || pidNum <= 0) {
      triggerToast('Invalid Roblox Process ID (PID)', 'clear');
      return;
    }

    if (accounts.some(a => a.pid === pidNum)) {
      triggerToast('Process ID is already attached', 'clear');
      return;
    }

    const newAcc: RobloxAccount = {
      id: `acc-${Date.now()}`,
      pid: pidNum,
      username: user,
      status: multiConfig.autoAttach ? 'INJECTED' : 'READY',
      placeId: newPlaceId.trim() || '185655149',
      ping: Math.floor(Math.random() * 50) + 15,
      fps: multiConfig.unlockFps ? 144 : 60,
      joinedAt: new Date().toLocaleTimeString(),
    };

    setAccounts(prev => [...prev, newAcc]);
    setNewPid('');
    setNewUsername('');
    triggerToast(`Connected Roblox instance: PID ${pidNum} [${user}]`, 'info');
  };

  const handleInjectAll = () => {
    setAccounts(prev => prev.map(a => ({ ...a, status: 'INJECTED' })));
    triggerToast('Injected Lua Hooks to all connected client instances', 'inject');
  };

  const handleKillAllProcesses = () => {
    if (accounts.length === 0) {
      triggerToast('No active processes to terminate', 'clear');
      return;
    }
    const count = accounts.length;
    setAccounts([]);
    triggerToast(`Terminated ${count} active Roblox client processes`, 'clear');
  };

  const handleSingleInject = (id: string, username: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'INJECTED' };
      }
      return a;
    }));
    triggerToast(`Hooks attached successfully: ${username}`, 'inject');
  };

  const handleSingleDisconnect = (id: string, pid: number) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    triggerToast(`Instance detached: PID ${pid}`, 'clear');
  };

  const handleRefocus = (username: string) => {
    triggerToast(`Brought window to foreground: ${username}`, 'info');
  };

  const handleGlobalExecute = () => {
    const injectedCount = accounts.filter(a => a.status === 'INJECTED').length;
    if (injectedCount === 0) {
      triggerToast('No active instances are injected', 'clear');
      return;
    }
    triggerToast(`Broadcasting script to ${injectedCount} connected instances`, 'execute');
  };

  const inputBg = theme.isLight 
    ? 'bg-zinc-100 text-zinc-900 border-zinc-200' 
    : 'bg-zinc-950 text-zinc-100 border-zinc-850';

  return (
    <div 
      className="flex-1 flex flex-col min-h-0 overflow-y-auto select-none pb-12"
      style={{
        backgroundColor: theme.bodyBg,
        color: theme.textMain,
        backgroundImage: theme.isLight 
          ? 'radial-gradient(rgba(0,0,0,0.015) 1px, transparent 1px)' 
          : 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }}
    >
      {/* Top Banner Header - Clean & Simple */}
      <div 
        className="p-6 border-b shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative backdrop-blur-sm"
        style={{ borderColor: theme.borderColor, backgroundColor: `${theme.headerBg}cc` }}
      >
        <div className="text-left space-y-1">
          <div className="flex items-center space-x-2.5">
            <span 
              style={{
                color: theme.accent,
                backgroundColor: `${theme.accent}15`,
                borderColor: `${theme.accent}30`
              }}
              className="text-[9px] font-mono tracking-widest font-extrabold uppercase px-2 py-0.5 rounded border shadow-xs"
            >
              Cluster Controller
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: theme.textMain }}>
            Multi-Account Control Panel
          </h1>
          <p className="text-[11px] font-mono tracking-tight" style={{ color: theme.textMuted }}>
            Coordinate scripts and manage multiple Roblox client processes simultaneously.
          </p>
        </div>

        {/* Global Cluster Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleInjectAll}
            style={{ backgroundColor: `${theme.accent}1c`, color: theme.accent, borderColor: `${theme.accent}40` }}
            className="px-4 py-2 border rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer flex items-center space-x-1.5"
          >
            <Zap size={11} />
            <span>Inject All</span>
          </button>
          
          <button
            onClick={handleKillAllProcesses}
            className="px-4 py-2 border rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 border-rose-500/20 transition cursor-pointer flex items-center space-x-1.5"
          >
            <Unplug size={11} />
            <span>Kill All PIDs</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full z-10 relative text-left">
        
        {/* Account instances Grid & Action Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Block: Connection & Configurations (1 Column) */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Form: Attach Client */}
            <div 
              className="border p-4.5 rounded-xl space-y-4 shadow-sm"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <h3 className="text-[11px] font-bold font-mono tracking-widest uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
                <Plus size={12} style={{ color: theme.accent }} />
                <span>Attach Instance</span>
              </h3>

              <form onSubmit={handleConnectAccount} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono font-bold uppercase tracking-widest block" style={{ color: theme.textMuted }}>
                    Process PID
                  </label>
                  <input
                    type="text"
                    required
                    value={newPid}
                    onChange={(e) => setNewPid(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g., 18402"
                    className="w-full py-1.5 px-2.5 rounded-lg border text-xs font-mono focus:outline-none transition-all"
                    style={{
                      backgroundColor: theme.isLight ? '#f4f4f5' : '#050505',
                      borderColor: theme.borderColor,
                      color: theme.textMain
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono font-bold uppercase tracking-widest block" style={{ color: theme.textMuted }}>
                    Account Tag
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g., FarmAlt_01"
                    className="w-full py-1.5 px-2.5 rounded-lg border text-xs font-mono focus:outline-none transition-all"
                    style={{
                      backgroundColor: theme.isLight ? '#f4f4f5' : '#050505',
                      borderColor: theme.borderColor,
                      color: theme.textMain
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono font-bold uppercase tracking-widest block" style={{ color: theme.textMuted }}>
                    Target Place ID
                  </label>
                  <input
                    type="text"
                    value={newPlaceId}
                    onChange={(e) => setNewPlaceId(e.target.value.replace(/\D/g, ''))}
                    placeholder="185655149"
                    className="w-full py-1.5 px-2.5 rounded-lg border text-xs font-mono focus:outline-none transition-all"
                    style={{
                      backgroundColor: theme.isLight ? '#f4f4f5' : '#050505',
                      borderColor: theme.borderColor,
                      color: theme.textMain
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl text-[10px] font-bold font-mono uppercase tracking-widest border transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:opacity-90 active:scale-98"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.isLight ? '#ffffff' : '#000000',
                    borderColor: theme.accent
                  }}
                >
                  <Plus size={11} />
                  <span>Attach Account</span>
                </button>
              </form>
            </div>

            {/* Sandbox Options Panel */}
            <div 
              className="border p-4.5 rounded-xl space-y-3.5 shadow-sm"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <h3 className="text-[11px] font-bold font-mono tracking-widest uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
                <Shield size={12} style={{ color: theme.accent }} />
                <span>Cluster Settings</span>
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Unlock FPS</span>
                  <input
                    type="checkbox"
                    checked={multiConfig.unlockFps}
                    onChange={(e) => setMultiConfig(prev => ({ ...prev, unlockFps: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className={`relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${theme.isLight ? 'bg-zinc-200' : 'bg-zinc-800'} peer-checked:bg-emerald-500`}
                       style={{ backgroundColor: multiConfig.unlockFps ? '#10b981' : undefined }} />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Mute Inactive</span>
                  <input
                    type="checkbox"
                    checked={multiConfig.muteInactive}
                    onChange={(e) => setMultiConfig(prev => ({ ...prev, muteInactive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className={`relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${theme.isLight ? 'bg-zinc-200' : 'bg-zinc-800'} peer-checked:bg-emerald-500`}
                       style={{ backgroundColor: multiConfig.muteInactive ? '#10b981' : undefined }} />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Anti-AFK Bypass</span>
                  <input
                    type="checkbox"
                    checked={multiConfig.antiAfk}
                    onChange={(e) => setMultiConfig(prev => ({ ...prev, antiAfk: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className={`relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${theme.isLight ? 'bg-zinc-200' : 'bg-zinc-800'} peer-checked:bg-emerald-500`}
                       style={{ backgroundColor: multiConfig.antiAfk ? '#10b981' : undefined }} />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">CPU Limiter</span>
                  <input
                    type="checkbox"
                    checked={multiConfig.cpuLimiter}
                    onChange={(e) => setMultiConfig(prev => ({ ...prev, cpuLimiter: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className={`relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${theme.isLight ? 'bg-zinc-200' : 'bg-zinc-800'} peer-checked:bg-emerald-500`}
                       style={{ backgroundColor: multiConfig.cpuLimiter ? '#10b981' : undefined }} />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Auto-Attach</span>
                  <input
                    type="checkbox"
                    checked={multiConfig.autoAttach}
                    onChange={(e) => setMultiConfig(prev => ({ ...prev, autoAttach: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className={`relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${theme.isLight ? 'bg-zinc-200' : 'bg-zinc-800'} peer-checked:bg-emerald-500`}
                       style={{ backgroundColor: multiConfig.autoAttach ? '#10b981' : undefined }} />
                </label>
              </div>
            </div>
          </div>

          {/* Right Block: Account Table / List and Code broadcast panel (3 Columns) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Instance List */}
            <div 
              className="border rounded-xl overflow-hidden shadow-sm text-left"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <div 
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ backgroundColor: theme.headerBg, borderColor: theme.borderColor }}
              >
                <div className="flex items-center space-x-2">
                  <Cpu size={12} style={{ color: theme.accent }} />
                  <span style={{ color: theme.textMain }} className="text-[11px] font-mono font-bold uppercase tracking-wider">
                    Active Cluster Instances ({accounts.length})
                  </span>
                </div>
              </div>

              {accounts.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-zinc-550">
                  No Roblox client processes are currently linked to this workspace.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.borderColor, color: theme.textMuted }}>
                        <th className="p-3 uppercase text-[9px] tracking-wider font-extrabold">Account / Tag</th>
                        <th className="p-3 uppercase text-[9px] tracking-wider font-extrabold">PID</th>
                        <th className="p-3 uppercase text-[9px] tracking-wider font-extrabold">Place ID</th>
                        <th className="p-3 uppercase text-[9px] tracking-wider font-extrabold">FPS</th>
                        <th className="p-3 uppercase text-[9px] tracking-wider font-extrabold">Ping</th>
                        <th className="p-3 uppercase text-[9px] tracking-wider font-extrabold">Status</th>
                        <th className="p-3 text-right uppercase text-[9px] tracking-wider font-extrabold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc) => (
                        <tr 
                          key={acc.id} 
                          className="border-b last:border-b-0 hover:bg-zinc-800/5 transition duration-150"
                          style={{ borderColor: theme.borderColor }}
                        >
                          {/* Name */}
                          <td className="p-3 font-bold text-zinc-200">
                            <span className="flex items-center space-x-1.5">
                              <Circle size={6} className={acc.status === 'INJECTED' ? 'fill-emerald-500 text-emerald-500 animate-pulse' : 'fill-zinc-600 text-zinc-600'} />
                              <span>{acc.username}</span>
                            </span>
                          </td>
                          {/* PID */}
                          <td className="p-3 text-zinc-400 font-bold">{acc.pid}</td>
                          {/* Place ID */}
                          <td className="p-3 text-zinc-500">
                            <span className="flex items-center space-x-1 group hover:text-zinc-300 transition duration-100 cursor-pointer">
                              <span>{acc.placeId}</span>
                              <ExternalLink size={10} className="opacity-40 group-hover:opacity-100" />
                            </span>
                          </td>
                          {/* FPS */}
                          <td className="p-3 text-zinc-400 font-bold">{acc.fps} FPS</td>
                          {/* Ping */}
                          <td className="p-3 font-bold" style={{ color: acc.ping < 30 ? '#10b981' : acc.ping < 60 ? '#f59e0b' : '#ef4444' }}>
                            {acc.ping}ms
                          </td>
                          {/* Status */}
                          <td className="p-3">
                            <span 
                              className="text-[9px] px-2 py-0.5 rounded font-black tracking-wider"
                              style={{
                                color: acc.status === 'INJECTED' ? '#10b981' : '#888888',
                                backgroundColor: acc.status === 'INJECTED' ? 'rgba(16,185,129,0.1)' : 'rgba(120,120,120,0.1)',
                              }}
                            >
                              {acc.status}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="p-3 text-right space-x-1.5">
                            {acc.status !== 'INJECTED' && (
                              <button
                                onClick={() => handleSingleInject(acc.id, acc.username)}
                                style={{ borderColor: `${theme.accent}50`, color: theme.accent }}
                                className="px-2 py-1 border rounded text-[9px] font-bold uppercase tracking-wider hover:opacity-90 transition active:scale-95 cursor-pointer"
                              >
                                Inject
                              </button>
                            )}

                            <button
                              onClick={() => handleRefocus(acc.username)}
                              className="px-2 py-1 border rounded text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition active:scale-95 cursor-pointer"
                              style={{ borderColor: theme.borderColor }}
                            >
                              Focus
                            </button>

                            <button
                              onClick={() => handleSingleDisconnect(acc.id, acc.pid)}
                              className="p-1 rounded border border-rose-500/10 hover:border-rose-500/30 text-zinc-500 hover:text-rose-500 transition cursor-pointer inline-flex items-center justify-center align-middle"
                              title="Disconnect PID"
                            >
                              <Unplug size={11} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Global Execution Panel */}
            <div 
              className="border rounded-xl overflow-hidden shadow-sm text-left flex flex-col"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <div 
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ backgroundColor: theme.headerBg, borderColor: theme.borderColor }}
              >
                <div className="flex items-center space-x-2">
                  <Terminal size={12} style={{ color: theme.accent }} />
                  <span style={{ color: theme.textMain }} className="text-[11px] font-mono font-bold uppercase tracking-wider">
                    Cluster Global Broadcast Console
                  </span>
                </div>
                <div className="text-[9px] font-mono font-bold uppercase text-zinc-550">
                  Broadcasts code to all INJECTED instances
                </div>
              </div>

              <div className="p-4.5 space-y-4">
                <textarea
                  rows={4}
                  value={globalScript}
                  onChange={(e) => setGlobalScript(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] leading-relaxed rounded-xl border focus:outline-none focus:ring-0 focus:border-zinc-700 resize-none"
                  style={{
                    backgroundColor: theme.isLight ? '#fcfcfc' : '#050505',
                    borderColor: theme.borderColor,
                    color: theme.isLight ? '#18181b' : '#38bdf8'
                  }}
                  placeholder="-- Type your Lua script here to broadcast globally..."
                />

                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Active target instances: <span className="font-bold text-emerald-500">{accounts.filter(a => a.status === 'INJECTED').length} / {accounts.length}</span>
                  </div>

                  <button
                    onClick={handleGlobalExecute}
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.isLight ? '#ffffff' : '#000000',
                    }}
                    className="px-4 py-2 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider flex items-center space-x-1.5 hover:opacity-90 transition active:scale-95 cursor-pointer"
                  >
                    <Play size={10} className="fill-current" />
                    <span>Broadcast Script</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
