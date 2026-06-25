import { AppTheme } from '../types';

export const defaultThemes: AppTheme[] = [
  {
    id: 'black-white-dark',
    name: 'Black & White (Dark)',
    isLight: false,
    background: 'bg-[#000000] text-[#ffffff]',
    bodyBg: '#000000',
    editorBg: '#000000',
    accent: '#ffffff',
    accentGlow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)]',
    sidebarBg: '#080808',
    cardBg: '#0c0c0c',
    textMain: '#ffffff',
    textMuted: '#7c7c7c',
    borderColor: '#1a1a1a',
    terminalBg: '#000000',
    headerBg: '#060606',
  },
  {
    id: 'transparent-beta',
    name: 'Transparent [Beta]',
    isLight: false,
    background: 'bg-[#000000]/15 backdrop-blur-2xl text-[#ffffff]',
    bodyBg: 'rgba(10, 11, 14, 0.25)',
    editorBg: 'rgba(5, 5, 5, 0.3)',
    accent: '#ffffff',
    accentGlow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)]',
    sidebarBg: 'rgba(8, 8, 8, 0.45)',
    cardBg: 'rgba(20, 20, 25, 0.35)',
    textMain: '#ffffff',
    textMuted: '#a1a1aa',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    terminalBg: 'rgba(5, 5, 5, 0.4)',
    headerBg: 'rgba(12, 12, 12, 0.4)',
  }
];

