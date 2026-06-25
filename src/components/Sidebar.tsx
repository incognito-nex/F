import React from 'react';
import { motion, LayoutGroup } from 'motion/react';
import { LayoutGrid, Code2, Compass, Sliders, Cpu, Fingerprint, Shield, X } from 'lucide-react';
import { AppTheme, UserSettings } from '../types';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  theme: AppTheme;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  statusColorText?: string;
  isCollapsed?: boolean;
}

export default function Sidebar({ 
  activeSection, 
  setActiveSection, 
  theme, 
  settings, 
  setSettings, 
  statusColorText = 'green' 
}: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <LayoutGrid size={18} /> },
    { id: 'editor', label: 'Editor', icon: <Code2 size={18} /> },
    { id: 'scripts', label: 'Scripts', icon: <Compass size={18} /> },
    ...(settings.experimental?.multiAccountInjection ? [{ id: 'multiaccount', label: 'Multi-Account', icon: <Cpu size={18} /> }] : []),
    { id: 'settings', label: 'Settings', icon: <Sliders size={18} /> },
    { id: 'about', label: 'Workspace Info', icon: <Fingerprint size={18} /> },
  ];

  return (
    <div className="h-full flex items-center relative select-none px-1">
      <div className="flex items-center space-x-1">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <motion.button
              id={`sidebar-btn-${item.id}`}
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ scale: 1.05, y: 1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-11 h-11 flex items-center justify-center rounded-xl text-xs font-semibold font-sans border relative cursor-pointer outline-none transition-colors duration-200 ${
                isActive
                  ? 'border-transparent bg-zinc-800/10 dark:bg-white/5'
                  : 'border-transparent hover:bg-zinc-800/5 dark:hover:bg-white/5'
              }`}
              style={{
                color: isActive ? theme.textMain : theme.textMuted,
                boxShadow: 'none',
              }}
              title={item.label}
            >
              {/* Dynamic Non-Stretching Smooth Linear Active Indicator on Top */}
              {isActive && (
                <motion.div
                  layoutId="top-bar-active-indicator"
                  className="absolute top-0 h-[3px] rounded-b-full w-[22px] z-50 left-1/2 -translate-x-1/2"
                  style={{
                    backgroundColor: theme.accent,
                    boxShadow: `0 1px 12px ${theme.accent}, 0 0 3px ${theme.accent}aa`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}

              <div
                style={{
                  color: isActive ? theme.accent : theme.textMuted,
                  filter: isActive ? `drop-shadow(0 0 3px ${theme.accent}30)` : 'none',
                }}
                className="transition-colors duration-200 shrink-0 flex items-center justify-center"
              >
                {item.icon}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

interface ProfileMenuProps {
  theme: AppTheme;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

export function ProfileMenu({ theme, settings, setSettings }: ProfileMenuProps) {
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [tempName, setTempName] = React.useState(settings.account.username);
  const [tempTitle, setTempTitle] = React.useState(settings.account.badge || 'Lead Architect');
  const [tempAvatar, setTempAvatar] = React.useState(settings.account.avatarUrl);
  const [tempBanner, setTempBanner] = React.useState(settings.account.bannerUrl || '');
  const [isPrivate, setIsPrivate] = React.useState(settings.account.isPrivate || false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        username: tempName.trim() || prev.account.username,
        badge: tempTitle.trim() || 'Lead Architect',
        avatarUrl: tempAvatar.trim() || prev.account.avatarUrl,
        bannerUrl: tempBanner.trim(),
        isPrivate: isPrivate
      }
    }));
    setShowProfileModal(false);
  };

  React.useEffect(() => {
    setTempName(settings.account.username);
    setTempTitle(settings.account.badge || 'Lead Architect');
    setTempAvatar(settings.account.avatarUrl);
    setTempBanner(settings.account.bannerUrl || '');
    setIsPrivate(settings.account.isPrivate || false);
  }, [settings.account]);

  return (
    <div className="relative flex items-center shrink-0">
      <button
        onClick={() => setShowProfileModal(!showProfileModal)}
        className="w-9 h-9 rounded-full border border-zinc-700/50 hover:border-zinc-500 overflow-hidden cursor-pointer transition relative shrink-0"
        title={`Profile: ${settings.account.username}`}
      >
        <img
          src={settings.account.avatarUrl}
          alt={settings.account.username}
          className={`w-full h-full object-cover transition duration-300 ${settings.account.isPrivate ? 'blur-[3px] brightness-75 scale-110' : ''}`}
        />
        <div
          style={{ backgroundColor: theme.accent }}
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-zinc-950 animate-pulse"
        />
      </button>

      {/* Float absolute Card modal next to profile - Native Elite App style (always black mode) */}
      {showProfileModal && (
        <div
          style={{ 
            backgroundColor: '#07080a', 
            borderColor: '#1d1e22',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85)'
          }}
          className="absolute top-12 right-0 z-50 w-80 border rounded-2xl p-4 space-y-4 font-sans select-none backdrop-blur-xl bg-opacity-95 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
            <div className="flex items-center space-x-2">
              <Shield size={14} className="text-zinc-400 animate-pulse" />
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-zinc-300">
                EDIT DEVELOPER PERSONA
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => {
                setShowProfileModal(false);
              }}
              className="p-1 rounded-full hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Live Interactive Preview Card */}
          <div className="relative rounded-xl border border-zinc-800/50 bg-black/50 overflow-hidden">
            {/* Banner Area */}
            <div className="h-16 w-full relative bg-zinc-900">
              {tempBanner.trim() ? (
                <img src={tempBanner.trim()} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-zinc-950 via-zinc-850 to-zinc-950" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            {/* Identity Row on Top of Banner */}
            <div className="absolute top-4 left-3 right-3 flex items-center space-x-2.5">
              {/* Floating Avatar */}
              <div className="w-9 h-9 rounded-full ring-2 ring-zinc-800 bg-zinc-950 overflow-hidden shrink-0">
                <img 
                  src={tempAvatar.trim() || settings.account.avatarUrl} 
                  alt="Avatar Preview" 
                  className={`w-full h-full object-cover ${isPrivate ? 'blur-[3px] brightness-75 scale-115' : ''}`}
                />
              </div>
              {/* Text Block */}
              <div className="min-w-0 flex-1 text-left">
                <div className="font-mono text-[11px] font-bold text-white tracking-wide truncate flex items-center gap-1">
                  {isPrivate ? '[REDACTED]' : (tempName.trim() || settings.account.username)}
                  {isPrivate && <Shield size={10} className="text-zinc-500 shrink-0" />}
                </div>
                <div className="text-[8px] font-mono font-semibold tracking-wider text-zinc-400 uppercase truncate">
                  {isPrivate ? '[ENCRYPTED]' : (tempTitle.trim() || 'Lead Architect')}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="space-y-2.5">
              <div className="space-y-1 text-left">
                <label className="text-[8.5px] font-mono font-bold uppercase tracking-widest block text-zinc-500">Name</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  disabled={isPrivate}
                  className="w-full py-1.5 px-3 rounded-xl bg-black border border-zinc-800/80 text-[11px] font-mono focus:outline-none focus:border-zinc-500 text-white disabled:opacity-50"
                  placeholder="Architect Name"
                  maxLength={18}
                  required={!isPrivate}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[8.5px] font-mono font-bold uppercase tracking-widest block text-zinc-500">Professional Title</label>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  disabled={isPrivate}
                  className="w-full py-1.5 px-3 rounded-xl bg-black border border-zinc-800/80 text-[11px] font-mono focus:outline-none focus:border-zinc-500 text-white disabled:opacity-50"
                  placeholder="Exploit Engineer"
                  maxLength={22}
                  required={!isPrivate}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 text-left">
                  <label className="text-[8.5px] font-mono font-bold uppercase tracking-widest block text-zinc-500">Avatar Image URL</label>
                  <input
                    type="text"
                    value={tempAvatar}
                    onChange={(e) => setTempAvatar(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-black border border-zinc-800/80 text-[10px] font-mono focus:outline-none focus:border-zinc-500 text-white truncate"
                    placeholder="Image link..."
                    required
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[8.5px] font-mono font-bold uppercase tracking-widest block text-zinc-500">Banner Image URL</label>
                  <input
                    type="text"
                    value={tempBanner}
                    onChange={(e) => setTempBanner(e.target.value)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-black border border-zinc-800/80 text-[10px] font-mono focus:outline-none focus:border-zinc-500 text-white truncate"
                    placeholder="Optional link..."
                  />
                </div>
              </div>

              {/* Custom Private Toggle Switch */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 mt-1">
                <div className="text-left">
                  <span className="text-[9px] font-mono font-bold text-zinc-300 block">Private Profile</span>
                  <span className="text-[7.5px] font-mono text-zinc-500 block">Enshrouds with encryption</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-8 h-4 rounded-full transition relative cursor-pointer ${isPrivate ? 'bg-zinc-100' : 'bg-zinc-800'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-black absolute top-0.5 transition-all ${isPrivate ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-1.5 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setTempName(settings.account.username);
                  setTempTitle(settings.account.badge || 'Lead Architect');
                  setTempAvatar(settings.account.avatarUrl);
                  setTempBanner(settings.account.bannerUrl || '');
                  setIsPrivate(settings.account.isPrivate || false);
                  setShowProfileModal(false);
                }}
                className="flex-1 py-1.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[9px] font-mono font-black uppercase tracking-wider transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-gradient-to-r from-zinc-100 to-zinc-400 hover:opacity-90 text-black rounded-xl text-[9px] font-mono font-black uppercase tracking-wider transition cursor-pointer font-extrabold"
                style={{ color: '#000000' }}
              >
                Apply Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
