import React, { useState, useRef, useEffect } from 'react';
import { 
  Sliders, User, Download, Upload, Settings2, Paintbrush, BookOpen, Check,
  Terminal, Github, Cpu, Layers, Volume2, Sparkles, Code, ShieldAlert, BadgeInfo,
  ChevronDown, Code2, Zap, Key
 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSettings, CustomSyntaxProfile, AppTheme } from '../types';

interface CustomSelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (val: any) => void;
  options: CustomSelectOption[];
  theme: AppTheme;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value.toString() === value.toString()) || options[0];

  return (
    <div 
      ref={containerRef} 
      style={{ zIndex: isOpen ? 100 : 20 }}
      className="relative w-full font-mono transition-all duration-75"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: theme.isLight ? '#ffffff' : '#080808',
          borderColor: theme.borderColor,
          color: theme.textMain
        }}
        className="w-full flex items-center justify-between border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none transition hover:brightness-110"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4, scaleY: 0.95, originY: 0 }}
            animate={{ opacity: 1, height: 'auto', y: 0, scaleY: 1, originY: 0 }}
            exit={{ opacity: 0, height: 0, y: -4, scaleY: 0.95, originY: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: theme.isLight ? '#ffffff' : '#0c0c0c',
              borderColor: theme.borderColor,
              boxShadow: `0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)`
            }}
            className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto border rounded-xl py-1.5 z-[110] text-xs select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {options.map((opt) => {
              const isSelected = opt.value.toString() === value.toString();
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  style={{
                    color: isSelected ? theme.accent : theme.textMain,
                    backgroundColor: isSelected ? (theme.isLight ? '#f4f4f5' : '#161616') : 'transparent'
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-zinc-800/20 hover:text-white transition flex items-center justify-between`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <div style={{ backgroundColor: theme.accent }} className="w-1.5 h-1.5 rounded-full" />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface WindowsSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  theme: AppTheme;
}

const WindowsSwitch: React.FC<WindowsSwitchProps> = ({ checked, onChange, theme }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer flex items-center shrink-0 border ${
        checked 
          ? 'bg-zinc-950 border-zinc-800' 
          : 'bg-zinc-100 border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800'
      }`}
      style={{
        backgroundColor: checked ? theme.accent : 'transparent',
        borderColor: checked ? theme.accent : (theme.isLight ? '#d4d4d8' : '#27272a')
      }}
    >
      <div 
        className={`w-3.5 h-3.5 rounded-full transition-all duration-150 absolute ${
          checked 
            ? 'left-[17px] bg-white dark:bg-zinc-950' 
            : 'left-[3px] bg-zinc-400 dark:bg-zinc-500'
        }`} 
      />
    </button>
  );
};

interface SettingsProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  syntaxes: CustomSyntaxProfile[];
  setSyntaxes: React.Dispatch<React.SetStateAction<CustomSyntaxProfile[]>>;
  themes: AppTheme[];
  onSetTheme: (themeId: string) => void;
  theme: AppTheme;
  initialTab?: 'editor' | 'terminal' | 'gitsync' | 'lua' | 'appearance' | 'profile' | 'experimental';
  onTriggerGitSync?: () => void;
  triggerToast?: (message: string, type?: any) => void;
}

export default function SettingsView({
  settings,
  setSettings,
  syntaxes,
  setSyntaxes,
  themes,
  onSetTheme,
  theme,
  onTriggerGitSync,
  triggerToast: propsTriggerToast,
}: SettingsProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [activeSubSection, setActiveSubSection] = useState<string>('editor-section');
  const isScrollingRef = useRef(false);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sections = [
      'editor-section',
      'performance-section',
      ...(settings.experimental?.terminalEnabled ? ['terminal-section'] : []),
      'gitsync-section',
      'theme-section',
      'keybinds-section',
      'advanced-section'
    ];

    const observerOptions = {
      root: document.getElementById('settings-scroll-container'),
      rootMargin: '0px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSubSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [settings.experimental?.terminalEnabled]);

  const triggerToast = (message: string, type: any = 'success') => {
    if (propsTriggerToast) {
      propsTriggerToast(message, type);
    } else {
      setToast({ message, type: type === 'error' ? 'error' : 'success' });
      setTimeout(() => {
        setToast(null);
      }, 4000);
    }
  };

  const startRecording = (field: string) => {
    setRecordingField(field);
    triggerToast("Listening for keybind. Press your desired keys (e.g. Ctrl+Shift+K)...", "success");
  };

  React.useEffect(() => {
    if (!recordingField) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');

      let keyName = e.key;
      if (keyName === ' ') keyName = 'Space';
      if (keyName.length === 1) {
        keyName = keyName.toUpperCase();
      } else {
        keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
      }

      parts.push(keyName);
      const recordedString = parts.join('+');

      setSettings(prev => {
        const updated = {
          ...prev,
          keybinds: {
            ...(prev.keybinds || {
              toggleCommandPalette: 'Ctrl+P'
            }),
            [recordingField]: recordedString
          }
        };
        localStorage.setItem('incognito_settings', JSON.stringify(updated));
        return updated;
      });

      triggerToast(`Keybind updated to ${recordedString}`, 'success');
      setRecordingField(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingField]);

  const handleUpdate = <T extends keyof UserSettings>(section: T, field: keyof UserSettings[T], value: any) => {
    setSettings((prev) => {
      const sectionObj = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...sectionObj,
          [field]: value
        }
      };
    });
  };

  const handleExportSyntax = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(syntaxes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "incognito_syntax_engines.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSyntax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setSyntaxes(parsed);
          triggerToast('Custom syntax engines loaded successfully.', 'success');
        } else {
          triggerToast('Invalid format. Must be an array of syntax engine specifications.', 'error');
        }
      } catch (err) {
        triggerToast('Failed to parse syntax file.', 'error');
      }
    };
    fileReader.readAsText(filesList[0]);
  };

  const inputBg = theme.isLight 
    ? 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-zinc-400' 
    : 'bg-zinc-900 text-zinc-100 border-zinc-800 focus:border-zinc-700';

  const containerBorder = theme.isLight ? 'border-zinc-200' : 'border-zinc-850';

  return (
    <div id="settings-scroll-container" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 font-sans text-left pb-24 scroll-smooth">
      {/* Title */}
      <div className="pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left" style={{ borderColor: theme.borderColor }}>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
            <Settings2 className="w-5 h-5" style={{ color: theme.accent }} />
            <span>Settings</span>
          </h1>
          <p className="text-xs mt-1 font-medium" style={{ color: theme.textMuted }}>
            Manage your editor, hotkeys, theme and advanced preferences.
          </p>
        </div>
      </div>

      {/* Side-by-side Fluent Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-start max-w-5xl">
        
        {/* Left Navigation Sidebar with Logos Only (No text, Contextually correct icons, CSS tooltips, Auto-highlight on scroll) */}
        <div className="w-full md:w-14 shrink-0 flex flex-row md:flex-col items-center overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 md:sticky md:top-6 space-x-2 md:space-x-0 md:space-y-3.5 scrollbar-none border-b md:border-b-0 md:border-r border-zinc-200/50 dark:border-zinc-800/40 md:pr-3.5">
          {[
            { id: 'editor-section', label: 'Editor Preferences', icon: Code2 },
            { id: 'performance-section', label: 'Performance Settings', icon: Sliders },
            ...(settings.experimental?.terminalEnabled ? [{ id: 'terminal-section', label: 'Terminal settings', icon: Terminal }] : []),
            { id: 'gitsync-section', label: 'GitHub Synchronization', icon: Github },
            { id: 'theme-section', label: 'Theming & Layout', icon: Paintbrush },
            { id: 'keybinds-section', label: 'Hotkey Keybinds', icon: Key },
            { id: 'advanced-section', label: 'Advanced Settings', icon: Cpu }
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSubSection === sec.id;
            const isKeybind = sec.id === 'keybinds-section';
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  isScrollingRef.current = true;
                  if (scrollingTimeoutRef.current) {
                    clearTimeout(scrollingTimeoutRef.current);
                  }
                  setActiveSubSection(sec.id);
                  const container = document.getElementById('settings-scroll-container');
                  const target = document.getElementById(sec.id);
                  if (container && target) {
                    const containerRect = container.getBoundingClientRect();
                    const targetRect = target.getBoundingClientRect();
                    const relativeTop = targetRect.top - containerRect.top + container.scrollTop - 24;
                    container.scrollTo({
                      top: relativeTop,
                      behavior: 'smooth'
                    });
                  }
                  scrollingTimeoutRef.current = setTimeout(() => {
                    isScrollingRef.current = false;
                  }, 800);
                }}
                className="group relative flex items-center justify-center w-10 h-10 transition-all duration-200 cursor-pointer bg-transparent border-0 outline-none hover:scale-[1.05] active:scale-95"
              >
                {isKeybind ? (
                  <div 
                    className={`w-5 h-5 rounded-[4px] border border-b-2 flex items-center justify-center text-[10px] font-mono font-extrabold select-none transition-all duration-150 transform ${
                      isActive 
                        ? 'bg-zinc-800 text-white border-white border-b-zinc-400 shadow-[0_2px_0_rgba(255,255,255,0.2)] scale-110' 
                        : 'bg-zinc-950/40 text-zinc-400 border-zinc-600 border-b-zinc-500 shadow-[0_1.5px_0_rgba(255,255,255,0.1)] group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-400 group-hover:scale-110'
                    }`}
                  >
                    I
                  </div>
                ) : (
                  <Icon 
                    size={16} 
                    className={`transition-all duration-150 transform ${
                      isActive ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-zinc-500 hover:text-white group-hover:scale-110'
                    }`} 
                  />
                )}

                {/* Left/Right Floating CSS Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 text-[10px] font-mono font-bold bg-zinc-900 dark:bg-zinc-950 text-white rounded-md border border-zinc-800/60 shadow-xl opacity-0 scale-90 translate-x-[-10px] group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap z-50">
                  {sec.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Content Sections */}
        <div className="flex-1 w-full space-y-14">
          
          {/* CATEGORY 1: EDITOR */}
          <div id="editor-section" className="space-y-2 scroll-mt-6">
            <div className="pb-2 border-b border-zinc-200/40 dark:border-zinc-800/20 flex items-center space-x-2">
              <Sliders size={14} style={{ color: theme.accent }} />
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                Editor Preferences
              </h3>
            </div>
            
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/40">
              {/* Font Size */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Font Size</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Adjust the code editor display font size</span>
                </div>
                <div className="w-48 shrink-0">
                  <input
                    type="number"
                    min="10"
                    max="24"
                    value={settings.editor.fontSize}
                    onChange={(e) => handleUpdate('editor', 'fontSize', parseInt(e.target.value) || 12)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  />
                </div>
              </div>

              {/* Font Family */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Font Family</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Select the custom monospace typeface for coding</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.editor.fontFamily}
                    onChange={(val) => handleUpdate('editor', 'fontFamily', val)}
                    options={[
                      { value: 'JetBrains Mono', label: 'JetBrains Mono' },
                      { value: 'Fira Code', label: 'Fira Code' },
                      { value: 'ui-monospace', label: 'System Monospace' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Indentation */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Indentation Spacing</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Number of spaces equivalent to one Tab press</span>
                </div>
                <div className="w-48 shrink-0">
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={settings.editor.tabSize}
                    onChange={(e) => handleUpdate('editor', 'tabSize', parseInt(e.target.value) || 4)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  />
                </div>
              </div>

              {/* Cursor Blinking */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Cursor Blinking</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Set the animation profile of the editor cursor</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.editor.cursorBlinking}
                    onChange={(val) => handleUpdate('editor', 'cursorBlinking', val)}
                    options={[
                      { value: 'smooth', label: 'Smooth Caret' },
                      { value: 'blink', label: 'Standard Blink' },
                      { value: 'expand', label: 'Laser Pulse' },
                      { value: 'phase', label: 'Steady Phase' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Cursor Style */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Cursor Style</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Adjust the shape and design of the editor cursor</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.editor.cursorStyle}
                    onChange={(val) => handleUpdate('editor', 'cursorStyle', val)}
                    options={[
                      { value: 'line', label: 'Thin Line (VSCode)' },
                      { value: 'block', label: 'Solid Block' },
                      { value: 'underline', label: 'Underline Prompt' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Word Wrapping */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Word Wrapping</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Auto-wrap long lines to prevent horizontal scrolling</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.editor.wordWrap}
                    onChange={(val) => handleUpdate('editor', 'wordWrap', val)}
                    options={[
                      { value: 'on', label: 'Enabled' },
                      { value: 'off', label: 'Disabled' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Minimap Toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Editor Minimap</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Display a visual outline minimap of active file on the right margin</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.editor.minimap}
                    onChange={(checked) => handleUpdate('editor', 'minimap', checked)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Auto-Save Toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Auto-Save</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Saves files automatically as changes occur</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.editor.autoSave}
                    onChange={(checked) => handleUpdate('editor', 'autoSave', checked)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Line Numbers Toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Line Numbers</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Show line count margin on the left side of the editor</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.editor.lineNumbers === 'on'}
                    onChange={(checked) => handleUpdate('editor', 'lineNumbers', checked ? 'on' : 'off')}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Smooth Caret Toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Smooth Caret Animation</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Enable smooth fluid cursor typing transitions</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.editor.smoothCaret}
                    onChange={(checked) => handleUpdate('editor', 'smoothCaret', checked)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Autoclose Brackets Toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Autoclose Brackets</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Automatically close parenthesis, brackets, braces, and quotes</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.editor.bracketAutocomplete}
                    onChange={(checked) => handleUpdate('editor', 'bracketAutocomplete', checked)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Italics Toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Italics Accentuation</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Use cursive styles on comments and keywords</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.editor.enableItalics !== false}
                    onChange={(checked) => handleUpdate('editor', 'enableItalics', checked)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Auto Script Save Toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Auto Script Save</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Bypass pop-up confirmation and save Lua scripts automatically</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.editor.autoScriptSave !== false}
                    onChange={(checked) => handleUpdate('editor', 'autoScriptSave', checked)}
                    theme={theme}
                  />
                </div>
              </div>
            </div>

            {/* Sub-group: LUA SYNTAX ENGINE PROFILES */}
            <div className="pt-6 space-y-3">
              <div className="flex items-center space-x-2">
                <Code size={13} style={{ color: theme.accent }} />
                <h4 className="text-[11px] font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                  Lua Syntax Engine Profiles
                </h4>
              </div>
              
              <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/40">
                {syntaxes.map((syn) => {
                  const isActive = settings.syntax.engineId === syn.id;
                  return (
                    <div key={syn.id} className="flex items-center justify-between py-3">
                      <div className="text-left pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold font-sans block" style={{ color: theme.textMain }}>{syn.name}</span>
                          {isActive && (
                            <span 
                              className="text-[8px] px-1.5 py-0.5 rounded font-mono font-extrabold tracking-widest uppercase"
                              style={{ backgroundColor: theme.accent, color: theme.isLight ? '#ffffff' : '#000000' }}
                            >
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] block text-zinc-500 font-mono mt-0.5 uppercase">
                          Keywords: {syn.colors.keywords} • Globals: {syn.colors.functions} • Comments: {syn.colors.comments}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="flex items-center -space-x-1">
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-800/60" style={{ backgroundColor: syn.colors.keywords }} />
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-800/60" style={{ backgroundColor: syn.colors.functions }} />
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-800/60" style={{ backgroundColor: syn.colors.strings }} />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdate('syntax', 'engineId', syn.id)}
                          style={{ 
                            backgroundColor: isActive ? `${theme.accent}1c` : 'transparent',
                            color: isActive ? theme.accent : theme.textMuted,
                            borderColor: isActive ? theme.accent : theme.borderColor
                          }}
                          className="px-3.5 py-1.5 border rounded-xl font-sans text-[11px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer"
                        >
                          {isActive ? 'Active' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CATEGORY 2: PERFORMANCE SETTINGS */}
          <div id="performance-section" className="space-y-2 scroll-mt-6">
            <div className="pb-2 border-b border-zinc-200/40 dark:border-zinc-800/20 flex items-center space-x-2">
              <Sliders size={14} style={{ color: theme.accent }} />
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                Performance Settings
              </h3>
            </div>
            
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/40">
              
              {/* Choose Client */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Execution Client Core</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Choose target architecture/client profile for Lua compilation</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.performance?.client || 'Web Client (64-bit)'}
                    onChange={(val) => handleUpdate('performance', 'client', val)}
                    options={[
                      { value: 'Web Client (64-bit)', label: 'Web Client (64-bit)' },
                      { value: 'UWP App Store Client', label: 'UWP App Client' },
                      { value: 'Mobile Emulator Engine', label: 'Mobile Emulator Core' },
                      { value: 'Incognito Internal Debugger', label: 'Internal Debug Core' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Theme/Lighting selection (the lighting menu!) */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Client Lighting Style (Theme)</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Select the lighting and theme preset profile</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.appearance.themeId}
                    onChange={(val) => onSetTheme(val)}
                    options={themes.map(t => ({ value: t.id, label: t.name }))}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Unlock FPS */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Unlock Client Frame Rate (FPS)</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Unlock or set target frames per second limitation</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.performance?.unlockFps || 'Unlimited'}
                    onChange={(val) => handleUpdate('performance', 'unlockFps', val)}
                    options={[
                      { value: '60', label: '60 FPS (V-Sync)' },
                      { value: '144', label: '144 FPS (High-Hz)' },
                      { value: '240', label: '240 FPS (Ultra)' },
                      { value: '360', label: '360 FPS (Competitive)' },
                      { value: 'Unlimited', label: 'Unlimited (Maximum)' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Auto Launch Roblox */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Auto Launch Roblox Client</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Automatically initialize Roblox process upon running sandbox script</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.performance?.autoLaunchRoblox !== false}
                    onChange={(checked) => handleUpdate('performance', 'autoLaunchRoblox', checked)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Hide process during screenshare */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Anti-Capture OBS Shield</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Hide sandbox interface during recording or active screensharing sessions</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={!!settings.performance?.hideProcessScreenshare}
                    onChange={(checked) => handleUpdate('performance', 'hideProcessScreenshare', checked)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Hide process entirely */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Stealth Process Disguise</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Instantly hide process entirely from desktop with Ctrl+Shift+I keybind</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={!!settings.performance?.hideProcessEntirely}
                    onChange={(checked) => handleUpdate('performance', 'hideProcessEntirely', checked)}
                    theme={theme}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* CATEGORY 3: TERMINAL (Conditional) */}
          {settings.experimental?.terminalEnabled && (
            <div id="terminal-section" className="space-y-2 scroll-mt-6">
              <div className="pb-2 border-b border-zinc-200/40 dark:border-zinc-800/20 flex items-center space-x-2">
                <Terminal size={14} style={{ color: theme.accent }} />
                <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                  Terminal Settings
                </h3>
              </div>
              
              <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/40">
                {/* Latency Slider */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="text-left pr-4">
                    <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Simulated Network Latency</span>
                    <span className="text-[11px] block" style={{ color: theme.textMuted }}>Simulate delay for Lua network telemetry streams</span>
                  </div>
                  <div className="w-48 flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="1500"
                      step="50"
                      value={settings.terminal.simulatedLatency}
                      onChange={(e) => handleUpdate('terminal', 'simulatedLatency', parseInt(e.target.value))}
                      style={{ accentColor: theme.accent }}
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-mono text-zinc-400 w-12 shrink-0 text-right">{settings.terminal.simulatedLatency}ms</span>
                  </div>
                </div>

                {/* Buffer Limit */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="text-left pr-4">
                    <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Buffer Line Limit</span>
                    <span className="text-[11px] block" style={{ color: theme.textMuted }}>Max history scroll limit of terminal logging buffer</span>
                  </div>
                  <div className="w-48 shrink-0">
                    <CustomSelect
                      value={settings.terminal.bufferLimit}
                      onChange={(val) => handleUpdate('terminal', 'bufferLimit', parseInt(val))}
                      options={[
                        { value: '50', label: '50 Lines' },
                        { value: '100', label: '100 Lines' },
                        { value: '200', label: '200 Lines' },
                        { value: '500', label: 'Unbounded' }
                      ]}
                      theme={theme}
                    />
                  </div>
                </div>

                {/* Font Scale */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="text-left pr-4">
                    <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Terminal Font Size Scale</span>
                    <span className="text-[11px] block" style={{ color: theme.textMuted }}>Adjust console logging typography density</span>
                  </div>
                  <div className="w-48 shrink-0">
                    <CustomSelect
                      value={settings.terminal.fontScale.toString()}
                      onChange={(val) => handleUpdate('terminal', 'fontScale', parseFloat(val))}
                      options={[
                        { value: '0.8', label: '0.8x Compact' },
                        { value: '1.0', label: '1.0x Default' },
                        { value: '1.2', label: '1.2x Comfort' },
                        { value: '1.4', label: '1.4x High' }
                      ]}
                      theme={theme}
                    />
                  </div>
                </div>

                {/* Auto Clear */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="text-left pr-4">
                    <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Auto-Clear Log</span>
                    <span className="text-[11px] block" style={{ color: theme.textMuted }}>Clear console log buffer automatically on script execute</span>
                  </div>
                  <div>
                    <WindowsSwitch
                      checked={settings.terminal.clearOnRun}
                      onChange={(checked) => handleUpdate('terminal', 'clearOnRun', checked)}
                      theme={theme}
                    />
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="text-left pr-4">
                    <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Show Timestamps</span>
                    <span className="text-[11px] block" style={{ color: theme.textMuted }}>Prefix console log rows with dynamic time strings</span>
                  </div>
                  <div>
                    <WindowsSwitch
                      checked={settings.terminal.showTimestamp}
                      onChange={(checked) => handleUpdate('terminal', 'showTimestamp', checked)}
                      theme={theme}
                    />
                  </div>
                </div>

                {/* Bell Sound */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="text-left pr-4">
                    <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Error Warning Bell</span>
                    <span className="text-[11px] block" style={{ color: theme.textMuted }}>Play alert warnings on compilation/runtime errors</span>
                  </div>
                  <div>
                    <WindowsSwitch
                      checked={settings.terminal.bellSound}
                      onChange={(checked) => handleUpdate('terminal', 'bellSound', checked)}
                      theme={theme}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 3: GIT SYNC */}
          <div id="gitsync-section" className="space-y-2 scroll-mt-6">
            <div className="pb-2 border-b border-zinc-200/40 dark:border-zinc-800/20 flex items-center space-x-2">
              <Github size={14} style={{ color: theme.accent }} />
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                GitHub Repository Sync
              </h3>
            </div>
            
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/40">
              {/* Repo URL */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Repository URL</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Specify the full Git target workspace repository path</span>
                </div>
                <div className="w-64 shrink-0">
                  <input
                    type="text"
                    value={settings.gitSync.repositoryUrl}
                    onChange={(e) => handleUpdate('gitSync', 'repositoryUrl', e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              {/* Branch */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Target Branch</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>The branch where scripts will be loaded and saved</span>
                </div>
                <div className="w-64 shrink-0">
                  <input
                    type="text"
                    value={settings.gitSync.syncBranch}
                    onChange={(e) => handleUpdate('gitSync', 'syncBranch', e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                    placeholder="main"
                  />
                </div>
              </div>

              {/* Commit message template */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Commit Template</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Default commit message layout prefix</span>
                </div>
                <div className="w-64 shrink-0">
                  <input
                    type="text"
                    value={settings.gitSync.commitMessage}
                    onChange={(e) => handleUpdate('gitSync', 'commitMessage', e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  />
                </div>
              </div>

              {/* Personal Access Token */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>GitHub Access Token</span>
                    <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded" style={{ 
                      backgroundColor: settings.gitSync.accessToken ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: settings.gitSync.accessToken ? '#10b981' : '#ef4444'
                    }}>
                      {settings.gitSync.accessToken ? 'Configured' : 'Empty'}
                    </span>
                  </div>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>GitHub PAT token used for authentication</span>
                </div>
                <div className="w-64 shrink-0">
                  <input
                    type="password"
                    value={settings.gitSync.accessToken || ''}
                    onChange={(e) => handleUpdate('gitSync', 'accessToken', e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                    placeholder="ghp_************************************"
                  />
                </div>
              </div>

              {/* Auto Tracking */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Auto Git Tracking</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Automatically sync script checkpoints with GitHub on manual saves</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={settings.gitSync.enabled}
                    onChange={(checked) => handleUpdate('gitSync', 'enabled', checked)}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Sync Trigger button */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Manual Synchronization</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Force pull/push all active workspace modifications immediately</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={onTriggerGitSync}
                    style={{ backgroundColor: `${theme.accent}1c`, color: theme.accent, borderColor: `${theme.accent}33` }}
                    className="px-4 py-1.5 border rounded-xl font-sans text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer"
                  >
                    Sync Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY 5: THEMES & APPEARANCE */}
          <div id="theme-section" className="space-y-2 scroll-mt-6">
            <div className="pb-2 border-b border-zinc-200/40 dark:border-zinc-800/20 flex items-center space-x-2">
              <Paintbrush size={14} style={{ color: theme.accent }} />
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                Theming & Layout
              </h3>
            </div>
            
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/40">
              {themes.map((t) => {
                const isActive = settings.appearance.themeId === t.id;
                return (
                  <div key={t.id} className="flex items-center justify-between py-3.5">
                    <div className="text-left pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>{t.name}</span>
                        {isActive && (
                          <span 
                            className="text-[8px] px-1.5 py-0.5 rounded font-mono font-extrabold tracking-widest uppercase"
                            style={{ backgroundColor: theme.accent, color: theme.isLight ? '#ffffff' : '#000000' }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] block" style={{ color: theme.textMuted }}>
                        Accent accentuation: {t.accent}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="flex items-center -space-x-1">
                        <div style={{ backgroundColor: t.accent }} className="w-3.5 h-3.5 rounded-full border border-zinc-800/60" />
                        <div style={{ backgroundColor: t.sidebarBg }} className="w-3.5 h-3.5 rounded-full border border-zinc-800/60" />
                      </div>
                      <button
                        type="button"
                        onClick={() => onSetTheme(t.id)}
                        style={{ 
                          backgroundColor: isActive ? `${theme.accent}1c` : 'transparent',
                          color: isActive ? theme.accent : theme.textMuted,
                          borderColor: isActive ? theme.accent : theme.borderColor
                        }}
                        className="px-4 py-1.5 border rounded-xl font-sans text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer"
                      >
                        {isActive ? 'Active' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Interface Blur */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Aero Glass Blur Effect</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Apply customizable background blurring to UI containers</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.appearance.blurIntensity}
                    onChange={(val) => handleUpdate('appearance', 'blurIntensity', val)}
                    options={[
                      { value: 'none', label: 'Disabled' },
                      { value: 'low', label: 'Low Blur' },
                      { value: 'medium', label: 'Medium Blur' },
                      { value: 'high', label: 'High Blur' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Card Theme Mode */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Card Background Colors</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Toggle colorful accent containers versus uniform dark card layout</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.appearance.cardColorMode || 'colorful'}
                    onChange={(val) => handleUpdate('appearance', 'cardColorMode', val)}
                    options={[
                      { value: 'colorful', label: 'Default' },
                      { value: 'synced', label: 'Theme Synced' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Motion Enabled */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Interface Layout Transitions</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Enable motion physics, page entering and scaling animations</span>
                </div>
                <div className="w-48 shrink-0">
                  <CustomSelect
                    value={settings.appearance.animationsEnabled !== false ? 'on' : 'off'}
                    onChange={(val) => handleUpdate('appearance', 'animationsEnabled', val === 'on')}
                    options={[
                      { value: 'on', label: 'Animations Enabled' },
                      { value: 'off', label: 'Reduce Motion' }
                    ]}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY 7: KEYBINDS */}
          <div id="keybinds-section" className="space-y-2 scroll-mt-6">
            <div className="pb-2 border-b border-zinc-200/40 dark:border-zinc-800/20 flex items-center space-x-2">
              <div 
                className="w-4.5 h-4.5 rounded-[4px] border border-b-2 flex items-center justify-center text-[11px] font-extrabold font-mono shrink-0 select-none shadow-xs"
                style={{ 
                  borderColor: theme.accent, 
                  color: theme.accent,
                  backgroundColor: `${theme.accent}12`
                }}
              >
                I
              </div>
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                Hotkey Keybinds
              </h3>
            </div>
            
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/40">
              {[
                {
                  id: 'toggleCommandPalette',
                  label: 'Toggle Command Palette',
                  desc: 'Opens/closes the universal command menu and file locator',
                  default: 'Ctrl+P'
                }
              ].map((item) => {
                const currentBinds = settings.keybinds || {
                  toggleCommandPalette: 'Ctrl+P'
                };
                const value = currentBinds[item.id as keyof typeof currentBinds] || item.default;
                const isRecording = recordingField === item.id;

                return (
                  <div key={item.id} className="flex items-center justify-between py-3.5">
                    <div className="text-left pr-4">
                      <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>
                        {item.label}
                      </span>
                      <span className="text-[11px] block text-left" style={{ color: theme.textMuted }}>
                        {item.desc}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startRecording(item.id)}
                        style={{
                          borderColor: isRecording ? theme.accent : theme.borderColor,
                          backgroundColor: isRecording ? `${theme.accent}15` : 'transparent',
                          color: isRecording ? theme.accent : theme.textMain
                        }}
                        className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border hover:opacity-90 transition active:scale-95 cursor-pointer flex items-center space-x-2 min-w-[120px] justify-center ${
                          isRecording ? 'animate-pulse' : ''
                        }`}
                      >
                        <span>{isRecording ? 'Listening...' : value}</span>
                      </button>

                      {!isRecording && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettings(prev => {
                              const updated = {
                                ...prev,
                                keybinds: {
                                  ...(prev.keybinds || {}),
                                  [item.id]: item.default
                                }
                              };
                              localStorage.setItem('incognito_settings', JSON.stringify(updated));
                              return updated;
                            });
                            triggerToast(`Reset ${item.label} to default`, 'success');
                          }}
                          className="text-xs font-sans text-zinc-500 hover:text-zinc-300 transition px-2 py-1 cursor-pointer"
                          title="Reset to default"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CATEGORY 8: EXPERIMENTAL */}
          <div id="advanced-section" className="space-y-2 scroll-mt-6">
            <div className="pb-2 border-b border-zinc-200/40 dark:border-zinc-800/20 flex items-center space-x-2">
              <Cpu size={14} style={{ color: theme.accent }} />
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                Advanced Settings
              </h3>
            </div>
            
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/40">
              {/* Terminal toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Terminal Log Console</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Toggle integrated interactive developer console bottom output pane</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={!!settings.experimental?.terminalEnabled}
                    onChange={(checked) => {
                      setSettings((prev) => {
                        const updated = {
                          ...prev,
                          experimental: {
                            ...prev.experimental,
                            terminalEnabled: checked
                          }
                        };
                        localStorage.setItem('incognito_settings', JSON.stringify(updated));
                        return updated;
                      });
                      triggerToast(`Terminal console ${checked ? 'enabled' : 'disabled'}`, 'success');
                    }}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Multi Account toggle */}
              <div className="flex items-center justify-between py-3.5">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-semibold font-sans block" style={{ color: theme.textMain }}>Multi-Account Administration</span>
                  <span className="text-[11px] block" style={{ color: theme.textMuted }}>Toggle active multi-client account injection configuration panel</span>
                </div>
                <div>
                  <WindowsSwitch
                    checked={!!settings.experimental?.multiAccountInjection}
                    onChange={(checked) => {
                      setSettings((prev) => {
                        const updated = {
                          ...prev,
                          experimental: {
                            ...prev.experimental,
                            multiAccountInjection: checked
                          }
                        };
                        localStorage.setItem('incognito_settings', JSON.stringify(updated));
                        return updated;
                      });
                      triggerToast(`Multi-Account view ${checked ? 'enabled' : 'disabled'}`, 'success');
                    }}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="flex items-center justify-between py-4">
                <div className="text-left pr-4">
                  <span className="text-[13px] font-bold font-sans block text-red-500">Factory Reset Application Data</span>
                  <span className="text-[11px] block text-zinc-500 dark:text-zinc-400">Permanently wipes all active files, syntaxes, custom profiles, themes, and keybind cache</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("WARNING: This will wipe ALL of your stored files, custom profiles, settings, and reload the application from scratch. Are you absolutely sure you want to proceed?")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 rounded-xl border font-sans text-xs font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30 transition duration-150 active:scale-95 cursor-pointer"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4.5 py-3 rounded-2xl border shadow-2xl bg-zinc-900 border-zinc-800 text-xs font-mono transition-all duration-300">
          <span className={`w-2 h-2 rounded-full inline-block animate-pulse shrink-0 ${toast.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
          <span className="text-zinc-200 font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
