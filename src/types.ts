export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  language?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  size: number;
}

export interface TabItem {
  fileId: string;
  isPinned: boolean;
  isUnsaved?: boolean;
}

export interface TerminalLine {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'input';
  text: string;
  timestamp: string;
}

export interface UpdateItem {
  id: string;
  date: string; // e.g. "2026-06-23" or formatted
  title: string;
  description: string;
  highlightedText?: string;
  redCrossesText?: string;
  greenPlusText?: string;
  names: string[];
}

export interface CustomSyntaxProfile {
  id: string;
  name: string;
  keywords: string[];
  functions: string[];
  colors: {
    background: string;
    keywords: string;
    functions: string;
    strings: string;
    numbers: string;
    comments: string;
    operators: string;
    accent: string;
  };
}

export interface AppTheme {
  id: string;
  name: string;
  isLight: boolean;
  background: string;
  bodyBg: string;
  editorBg: string;
  accent: string;
  accentGlow: string;
  sidebarBg: string;
  cardBg: string;
  textMain: string;
  textMuted: string;
  borderColor: string;
  terminalBg: string;
  headerBg: string;
}

export interface UserSettings {
  editor: {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: 'on' | 'off';
    minimap: boolean;
    autoSave: boolean;
    lineNumbers: 'on' | 'off';
    cursorBlinking: 'smooth' | 'blink' | 'expand' | 'phase';
    cursorStyle: 'line' | 'block' | 'underline';
    smoothCaret: boolean;
    bracketAutocomplete: boolean;
    enableItalics?: boolean;
  };
  terminal: {
    clearOnRun: boolean;
    showTimestamp: boolean;
    fontScale: number;
    simulatedLatency: number;
    bufferLimit: number;
    bellSound: boolean;
  };
  gitSync: {
    enabled: boolean;
    repositoryUrl: string;
    syncBranch: string;
    autoPush: boolean;
    commitMessage: string;
    lastSyncedAt: string | null;
    accessToken?: string;
  };
  appearance: {
    themeId: string;
    blurIntensity: 'none' | 'low' | 'medium' | 'high';
    animationsSpeed: 'slow' | 'normal' | 'fast';
    cardColorMode?: 'colorful' | 'synced';
    animationsEnabled?: boolean;
  };
  syntax: {
    engineId: string; // Active syntax ID e.g. 'studio-classic', 'roblox-luau', etc.
  };
  account: {
    username: string;
    avatarUrl: string;
    bio: string;
    badge: string;
    bannerUrl?: string;
    isPrivate?: boolean;
  };
  keybinds?: {
    toggleCommandPalette?: string;
    autoFixSyntax?: string;
    obfuscateScript?: string;
    deobfuscateScript?: string;
  };
  experimental?: {
    terminalEnabled: boolean;
    multiAccountInjection?: boolean;
  };
}
