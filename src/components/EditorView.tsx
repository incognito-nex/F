import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { 
  Folder, FileCode, FolderPlus, FilePlus, ChevronRight, ChevronDown, 
  X, Pin, Save, Star, Trash2, Edit, Copy, Move, Menu, Play, CheckCircle, 
  Sparkles, Maximize2, Minimize2, Terminal, AlertTriangle, Eye, ShieldAlert
} from 'lucide-react';
import { FileNode, TabItem, AppTheme, UserSettings, CustomSyntaxProfile } from '../types';

interface EditorViewProps {
  files: FileNode[];
  tabs: TabItem[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onPinTab: (fileId: string) => void;
  onReorderTabs: (sourceIdx: number, targetIdx: number) => void;
  onUpdateFileContent: (fileId: string, text: string) => void;
  onCreateNewFile: (name: string, type: 'file' | 'folder', parentId: string | null, content?: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDuplicateFile: (fileId: string) => void;
  onMoveFile: (fileId: string, newParentId: string | null) => void;
  onRunScript: (fileId: string) => void;
  onSaveFile: (fileId: string) => void;
  theme: AppTheme;
  settings: UserSettings;
  syntaxProfile: CustomSyntaxProfile;
}

export default function EditorView({
  files,
  tabs,
  activeFileId,
  onSelectFile,
  onCloseTab,
  onPinTab,
  onReorderTabs,
  onUpdateFileContent,
  onCreateNewFile,
  onDeleteFile,
  onRenameFile,
  onDuplicateFile,
  onMoveFile,
  onRunScript,
  onSaveFile,
  theme,
  settings,
  syntaxProfile,
}: EditorViewProps) {
  const monaco = useMonaco();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root-scripts': true,
    'root-modules': true
  });
  const [contextMenuFileId, setContextMenuFileId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  
  // Tab actions popup
  const [activeTabMenuId, setActiveTabMenuId] = useState<string | null>(null);
  const [tabMenuPos, setTabMenuPos] = useState({ x: 0, y: 0 });

  // Fullscreen option
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(240);
  const [isDraggingExplorer, setIsDraggingExplorer] = useState(false);
  const isDraggingExplorerRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Dynamic Monarch language register when syntax engine changes
  useEffect(() => {
    if (!monaco) return;

    try {
      // Register custom lua language if not already there
      const registeredLangs = monaco.languages.getLanguages();
      const isLuauRegistered = registeredLangs.some(l => l.id === 'lua');

      if (!isLuauRegistered) {
        monaco.languages.register({ id: 'lua' });
      }

      // Configure current highlighting colors parameters
      monaco.languages.setMonarchTokensProvider('lua', {
        keywords: syntaxProfile.keywords,
        functions: syntaxProfile.functions,
        tokenizer: {
          root: [
            [/[a-zA-Z_]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@functions': 'function',
                '@default': 'identifier'
              }
            }],
            [/[{}()\[\]]/, '@brackets'],
            [/[<>=\+\-\*\/&|!^%~]+/, 'operator'],
            [/\d+/, 'number'],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
            [/--.*$/, 'comment'],
          ]
        }
      });

      // Map tokenizer strings into visual editor theme
      monaco.editor.defineTheme('incognitoDynamicTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: syntaxProfile.colors.keywords },
          { token: 'function', foreground: syntaxProfile.colors.functions },
          { token: 'string', foreground: syntaxProfile.colors.strings },
          { token: 'number', foreground: syntaxProfile.colors.numbers },
          { token: 'comment', foreground: syntaxProfile.colors.comments, fontStyle: 'italic' },
          { token: 'operator', foreground: syntaxProfile.colors.operators },
        ],
        colors: {
          'editor.background': theme.editorBg,
          'editor.foreground': '#e2e8f0',
          'editorLineNumber.foreground': '#475569',
          'editorLineNumber.activeForeground': theme.accent,
          'editor.selectionBackground': `${theme.accent}30`,
          'editorCursor.foreground': theme.accent,
          'editorGutter.background': theme.editorBg,
        }
      });

      // active update
      monaco.editor.setTheme('incognitoDynamicTheme');
    } catch (err) {
      console.warn('Monaco configuration failure, using default syntax fallback.', err);
    }
  }, [monaco, syntaxProfile, theme]);

  // Click outside to dismiss menus
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenuFileId(null);
      setActiveTabMenuId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const activeNode = files.find(f => f.id === activeFileId);

  // File explorer width adjuster resizing dragging mechanics
  const handleExplorerDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingExplorerRef.current = true;
    setIsDraggingExplorer(true);
    startXRef.current = e.clientX;
    startWidthRef.current = explorerWidth;
    document.addEventListener('mousemove', handleExplorerDragMove);
    document.addEventListener('mouseup', handleExplorerDragStop);
  };

  const handleExplorerDragMove = (e: MouseEvent) => {
    if (!isDraggingExplorerRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const computedWidth = startWidthRef.current + deltaX;
    const clamped = Math.max(160, Math.min(400, computedWidth));
    setExplorerWidth(clamped);
  };

  const handleExplorerDragStop = () => {
    isDraggingExplorerRef.current = false;
    setIsDraggingExplorer(false);
    document.removeEventListener('mousemove', handleExplorerDragMove);
    document.removeEventListener('mouseup', handleExplorerDragStop);
  };

  // Node operations
  const triggerCreateIn = (parentId: string | null, type: 'file' | 'folder') => {
    const label = type === 'file' ? 'Script name (e.g. ServerAntiCheat.lua):' : 'Folder label:';
    const input = prompt(label);
    if (!input) return;

    let finalName = input.trim();
    if (type === 'file' && !finalName.endsWith('.lua')) {
      finalName = `${finalName}.lua`;
    }
    const defaultText = type === 'file' 
      ? `--!strict\n-- Virtual script node: ${finalName}\nprint("Starting diagnostics pipeline...")\n`
      : undefined;

    onCreateNewFile(finalName, type, parentId, defaultText);
  };

  const handleNodeRightClick = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuFileId(fileId);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleTabRightClick = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTabMenuId(fileId);
    setTabMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Compile active node tree
  const buildFolderLevels = (parentId: string | null, depth = 0): React.ReactNode => {
    const nodes = files.filter(f => f.parentId === parentId);
    // Sort directories before raw templates
    const sorted = [...nodes].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return sorted.map((node) => {
      const isFolder = node.type === 'folder';
      const isExpanded = !!expandedFolders[node.id];
      const isSelected = activeFileId === node.id;

      if (isFolder) {
        return (
          <div key={node.id} className="select-none">
            <div
              onContextMenu={(e) => handleNodeRightClick(e, node.id)}
              onClick={() => toggleFolder(node.id)}
              className="group flex items-center justify-between py-1 px-2.5 hover:bg-zinc-800/40 rounded cursor-pointer transition text-zinc-300 hover:text-white"
              style={{ paddingLeft: `${depth * 10 + 10}px` }}
            >
              <div className="flex items-center space-x-1.5 truncate flex-1 text-left">
                <span className="text-zinc-600 shrink-0">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <Folder size={14} style={{ color: theme.accent }} className="shrink-0" />
                <span className="text-xs font-mono truncate">{node.name}</span>
              </div>

              {/* micro controls */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerCreateIn(node.id, 'file'); }}
                  className="p-0.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                  title="Create script in folder"
                >
                  <FilePlus size={11} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerCreateIn(node.id, 'folder'); }}
                  className="p-0.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                  title="Create subfolder"
                >
                  <FolderPlus size={11} />
                </button>
              </div>
            </div>

            {isExpanded && buildFolderLevels(node.id, depth + 1)}
          </div>
        );
      } else {
        return (
          <div
            key={node.id}
            onContextMenu={(e) => handleNodeRightClick(e, node.id)}
            onClick={() => onSelectFile(node.id)}
            className={`group flex items-center py-1 px-2.5 rounded cursor-pointer transition font-mono ${
              isSelected 
                ? 'text-white font-semibold border-l-2' 
                : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'
            }`}
            style={{ 
              paddingLeft: `${depth * 10 + 26}px`,
              borderLeftColor: isSelected ? theme.accent : 'transparent',
              backgroundColor: isSelected ? `${theme.accent}14` : 'transparent'
            }}
          >
            <div className="flex items-center space-x-2 truncate text-left flex-1">
              <FileCode size={13} style={{ color: isSelected ? theme.accent : '#52525b' }} className="shrink-0" />
              <span className="text-xs truncate">{node.name}</span>
            </div>
            
            {node.isFavorite && (
              <Star size={10} className="text-yellow-500 fill-yellow-500 shrink-0 ml-1 opacity-70" />
            )}
          </div>
        );
      }
    });
  };

  // Custom reorder mechanisms (shift left/right)
  const shiftTab = (idx: number, dir: 'left' | 'right') => {
    const targetIdx = dir === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= tabs.length) return;
    onReorderTabs(idx, targetIdx);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${isFullscreen ? 'fixed inset-0 z-40 bg-[#0c0d10]' : ''}`}>
      
      {/* Mini Breadcrumb toolbar */}
      <div 
        style={{ borderColor: theme.borderColor, backgroundColor: theme.headerBg }}
        className="h-9 border-b flex items-center justify-between px-3 text-[10px] font-mono text-zinc-500 z-10 shrink-0 select-none"
      >
        <div className="flex items-center space-x-1">
          <span className="uppercase font-extrabold tracking-widest mr-1.5 text-xs font-mono" style={{ color: theme.accent }}>IDE CORE</span>
          <span>workspaces</span>
          <span>/</span>
          {activeNode ? (
            <span className="text-zinc-300 font-semibold">{activeNode.name}</span>
          ) : (
            <span className="text-zinc-600">No active file node open</span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {activeFileId && (
            <button
              onClick={() => onRunScript(activeFileId)}
              style={{ color: theme.accent, borderColor: theme.borderColor }}
              className="flex items-center space-x-1 px-2.5 py-1 text-[9px] font-bold rounded bg-zinc-900 hover:border-zinc-700 hover:text-white transition uppercase font-semibold"
            >
              <Play size={10} className="fill-current" style={{ color: theme.accent }} />
              <span>Run File</span>
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-200"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* File Explorer Sidebar */}
        <div
          style={{ 
            width: `${explorerWidth}px`,
            backgroundColor: theme.sidebarBg,
            borderColor: theme.borderColor
          }}
          className="border-r h-full flex flex-col text-left shrink-0 select-none relative"
        >
          {/* Header */}
          <div className="p-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/40">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold font-bold">
              Files Explorer
            </span>

            <div className="flex items-center space-x-1">
              <button 
                onClick={() => triggerCreateIn(null, 'file')}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Create physical standard script node"
              >
                <FilePlus size={12} />
              </button>
              <button 
                onClick={() => triggerCreateIn(null, 'folder')}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Create project folder node"
              >
                <FolderPlus size={12} />
              </button>
            </div>
          </div>

          {/* Files List Frame */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {buildFolderLevels(null)}
          </div>

          {/* Explorer Resizer Handle */}
          <div
            onMouseDown={handleExplorerDragStart}
            style={{
              backgroundColor: isDraggingExplorer ? theme.accent : undefined,
              boxShadow: isDraggingExplorer ? `0 0 12px ${theme.accent}` : undefined,
            }}
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-all z-20 hover:bg-zinc-700/20`}
          />
        </div>

        {/* Editing Deck Arena */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0b0d]">
          
          {/* Visual Workspace VS Code Tabs Bar */}
          <div 
            style={{ 
              borderColor: theme.borderColor,
              backgroundColor: theme.sidebarBg
            }}
            className="h-10 border-b flex items-center overflow-x-auto whitespace-nowrap scrollbar-none select-none px-1"
          >
            {tabs.length === 0 ? (
              <div className="text-[10px] font-mono text-zinc-600 px-4">
                Sandbox buffer empty. Click a Lua file from the explorer list to script.
              </div>
            ) : (
              tabs.map((tab, idx) => {
                const file = files.find(f => f.id === tab.fileId);
                if (!file) return null;

                const isSelected = activeFileId === tab.fileId;
                return (
                  <div
                    key={tab.fileId}
                    onContextMenu={(e) => handleTabRightClick(e, tab.fileId)}
                    onClick={() => onSelectFile(tab.fileId)}
                    style={{
                      borderColor: isSelected ? theme.accent : 'transparent',
                      backgroundColor: isSelected ? theme.editorBg : `${theme.sidebarBg}40`,
                    }}
                    className={`h-full inline-flex items-center px-4.5 border-t-2 select-none relative cursor-pointer group transition-all shrink-0 ${
                      isSelected 
                        ? 'text-white font-bold' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mr-2">
                      {tab.isPinned && (
                        <Pin size={10} style={{ color: theme.accent }} className="rotate-45 shrink-0" />
                      )}
                      
                      <FileCode size={11} className="text-zinc-500 shrink-0" />
                      <span className="text-xs font-mono">{file.name}</span>

                      {/* Unsaved indicator dot */}
                      {tab.isUnsaved && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" title="Unsaved changes" />
                      )}
                    </div>

                    {/* Tab controllers (move handles, quick close) */}
                    <div className="inline-flex items-center space-x-1 pl-1">
                      {/* Arrow shifting tab handles */}
                      {idx > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); shiftTab(idx, 'left'); }}
                          className="text-[9px] text-zinc-700 hover:text-zinc-300 px-0.5"
                          title="Move Left"
                        >
                          ‹
                        </button>
                      )}
                      {idx < tabs.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); shiftTab(idx, 'right'); }}
                          className="text-[9px] text-zinc-700 hover:text-zinc-300 px-0.5"
                          title="Move Right"
                        >
                          ›
                        </button>
                      )}

                      {!tab.isPinned && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onCloseTab(tab.fileId); }}
                          className="text-zinc-600 hover:text-rose-500 hover:bg-zinc-800 rounded p-0.5 transition duration-150 shrink-0"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Monaco Editor Slot */}
          <div className="flex-1 relative">
            {activeNode && activeNode.type === 'file' ? (
              <MonacoEditor
                height="100%"
                language="lua"
                value={activeNode.content || ''}
                onChange={(val) => {
                  if (val !== undefined) {
                    onUpdateFileContent(activeNode.id, val);
                  }
                }}
                theme="incognitoDynamicTheme"
                options={{
                  fontSize: settings.editor.fontSize,
                  fontFamily: settings.editor.fontFamily,
                  tabSize: settings.editor.tabSize,
                  wordWrap: settings.editor.wordWrap,
                  minimap: { enabled: settings.editor.minimap },
                  automaticLayout: true,
                  lineNumbers: 'on',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  renderLineHighlight: 'all',
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-zinc-950/40">
                <FileCode size={34} style={{ color: theme.accent }} className="animate-bounce mb-3" />
                <h4 className="text-xs font-bold font-mono tracking-widest text-zinc-400 uppercase">
                  Workspace Calibrator Idle
                </h4>
                <p className="max-w-xs text-[10px] text-zinc-600 font-mono mt-1">
                  Click a Lua resource node or calibration file to start tuning suspension indices.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => triggerCreateIn(null, 'file')}
                    style={{ color: theme.accent }}
                    className="p-1 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 rounded font-mono text-[9px] uppercase tracking-widest font-semibold"
                  >
                    + Create Nodule
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Floating Node Context Menu */}
      {contextMenuFileId && (
        <div
          style={{ top: `${contextMenuPos.y}px`, left: `${contextMenuPos.x}px` }}
          className="fixed z-50 bg-[#161a22] border border-zinc-800 rounded-lg p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] select-none text-left w-40 font-mono text-[10px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const file = files.find(f => f.id === contextMenuFileId);
              if (file) {
                const newName = prompt('Enter new resource name:', file.name);
                if (newName) {
                  onRenameFile(file.id, newName);
                }
              }
              setContextMenuFileId(null);
            }}
            className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-zinc-800/80 rounded text-zinc-300 hover:text-white"
          >
            <Edit size={11} />
            <span>Rename Nodule</span>
          </button>

          <button
            onClick={() => {
              onDuplicateFile(contextMenuFileId);
              setContextMenuFileId(null);
            }}
            className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-zinc-800/80 rounded text-zinc-300 hover:text-white"
          >
            <Copy size={11} />
            <span>Duplicate Nodule</span>
          </button>

          <button
            onClick={() => {
              // Simple popup to select folder
              const folders = files.filter(f => f.type === 'folder');
              if (folders.length === 0) {
                alert('No folders created.');
                return;
              }
              const folderNames = folders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
              const selIdx = prompt(`Move cell. Select destination folder index:\n0. Root Directory\n${folderNames}`);
              if (selIdx !== null) {
                const idx = parseInt(selIdx);
                if (idx === 0) {
                  onMoveFile(contextMenuFileId, null);
                } else if (folders[idx - 1]) {
                  onMoveFile(contextMenuFileId, folders[idx - 1].id);
                }
              }
              setContextMenuFileId(null);
            }}
            className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-zinc-800/80 rounded text-zinc-300 hover:text-white"
          >
            <Move size={11} />
            <span>Move Nodule</span>
          </button>

          <div className="h-px bg-zinc-800/80 my-1" />

          <button
            onClick={() => {
              const check = confirm('Purge this asset cell permanently?');
              if (check) onDeleteFile(contextMenuFileId);
              setContextMenuFileId(null);
            }}
            className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-rose-500/10 rounded text-rose-450 hover:text-rose-500"
          >
            <Trash2 size={11} />
            <span>Purge Cell</span>
          </button>
        </div>
      )}

      {/* Floating Tab Right Click Context Menu */}
      {activeTabMenuId && (
        <div
          style={{ top: `${tabMenuPos.y}px`, left: `${tabMenuPos.x}px` }}
          className="fixed z-50 bg-[#161a22] border border-zinc-800 rounded-lg p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] select-none text-left w-36 font-mono text-[10px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onPinTab(activeTabMenuId);
              setActiveTabMenuId(null);
            }}
            className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-zinc-800/80 rounded text-zinc-300"
          >
            <Pin size={11} />
            <span>Toggle Pin Tab</span>
          </button>

          <button
            onClick={() => {
              onSaveFile(activeTabMenuId);
              setActiveTabMenuId(null);
            }}
            className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-zinc-800/80 rounded text-zinc-300"
          >
            <Save size={11} />
            <span>Save Changes (Ctrl+S)</span>
          </button>

          <div className="h-px bg-zinc-800/80 my-1" />

          <button
            onClick={() => {
              // Close others
              tabs.forEach(t => {
                if (t.fileId !== activeTabMenuId && !t.isPinned) {
                  onCloseTab(t.fileId);
                }
              });
              setActiveTabMenuId(null);
            }}
            className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-zinc-800/80 rounded text-zinc-300"
          >
            <X size={11} />
            <span>Close Others</span>
          </button>

          <button
            onClick={() => {
              onCloseTab(activeTabMenuId);
              setActiveTabMenuId(null);
            }}
            className="w-full flex items-center space-x-2 px-2 py-1.5 hover:bg-rose-500/10 rounded text-rose-500"
          >
            <X size={11} />
            <span>Close Tab</span>
          </button>
        </div>
      )}

    </div>
  );
}
