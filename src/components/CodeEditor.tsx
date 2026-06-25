import React, { useState, useEffect, useRef, Component } from 'react';
import { motion, LayoutGroup } from 'motion/react';
import Editor, { Monaco, useMonaco, loader } from '@monaco-editor/react';
import { 
  X, Pin, Save, Star, Terminal, Play, RotateCcw, AlertTriangle, CheckCircle,
  MoreVertical, FileCode, Sparkles, Sliders, AlertCircle, Copy, Search, HelpCircle,
  Minimize2, Maximize2, Syringe, Trash2, Plus, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { FileNode, TabItem, AppTheme, UserSettings, CustomSyntaxProfile } from '../types';

interface CodeEditorProps {
  files: FileNode[];
  setFiles: React.Dispatch<React.SetStateAction<FileNode[]>>;
  tabs: TabItem[];
  setTabs: React.Dispatch<React.SetStateAction<TabItem[]>>;
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  syntaxes: CustomSyntaxProfile[];
  theme: AppTheme;
  settings: UserSettings;
  onRunScript: (fileId: string) => void;
  onSaveFile: (fileId: string, text: string) => void;
  onInjectScript?: (fileId: string) => void;
  onClearTerminal?: () => void;
  onSyntaxCheck?: () => void;
  isFullscreen?: boolean;
  setIsFullscreen?: (val: boolean) => void;
}

const obfuscateLuauCode = (code: string): string => {
  if (!code.trim()) return '';
  const bytes = Array.from(code).map(c => c.charCodeAt(0));
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 25) {
    chunks.push(`string.char(${bytes.slice(i, i + 25).join(',')})`);
  }
  return `-- [!] INCOGNITO ENGINE SECURITY: LUAU OBFUSCATION INTEGRITY MODULE v5.0\n` +
         `-- ENCRYPTION TIME: ${new Date().toISOString()}\n` +
         `local _0xIncognitoPayload = {\n` +
         `  payload = ${chunks.join(' .. \n  ')}\n` +
         `}\n` +
         `local _executor = task.spawn(loadstring or load, _0xIncognitoPayload.payload)\n` +
         `return _executor`;
};

const deobfuscateLuauCode = (code: string): string => {
  if (!code.trim()) return '';
  const charMatches = code.match(/string\.char\(([\d,\s]+)\)/g);
  if (charMatches && charMatches.length > 0) {
    try {
      let decoded = '';
      charMatches.forEach(match => {
        const numbers = match
          .replace('string.char(', '')
          .replace(')', '')
          .split(',')
          .map(n => parseInt(n.trim(), 10));
        decoded += String.fromCharCode(...numbers);
      });
      return decoded;
    } catch (e) {
      // fallback
    }
  }
  return code
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const WORKSPACE_SNIPPETS = [
  {
    name: 'Camera Aimbot',
    description: 'High performance Camera-based Aimbot targeting nearest player head',
    code: `-- Camera Aimbot Module\nlocal Players = game:GetService("Players")\nlocal LocalPlayer = Players.LocalPlayer\nlocal Camera = workspace.CurrentCamera\n\nlocal function getClosestPlayer()\n    local target, minDist = nil, math.huge\n    for _, player in ipairs(Players:GetPlayers()) do\n        if player ~= LocalPlayer and player.Character and player.Character:FindFirstChild("Head") then\n            local head = player.Character.Head\n            local screenPos, onScreen = Camera:WorldToViewportPoint(head.Position)\n            if onScreen then\n                local mousePos = LocalPlayer:GetMouse()\n                local dist = (Vector2.new(screenPos.X, screenPos.Y) - Vector2.new(mousePos.X, mousePos.Y)).Magnitude\n                if dist < minDist then\n                    minDist = dist\n                    target = player\n                end\n            end\n        end\n    end\n    return target\nend\n\nprint("[Incognito] Aimbot initiated.")`
  },
  {
    name: 'ESP Highlights',
    description: 'Draw standard highlight boxes on players through walls',
    code: `-- Premium Player ESP\nlocal Players = game:GetService("Players")\nlocal LocalPlayer = Players.LocalPlayer\n\nlocal function applyESP(player)\n    player.CharacterAdded:Connect(function(char)\n        local highlight = Instance.new("Highlight")\n        highlight.Name = "ESPHighlight"\n        highlight.FillColor = Color3.fromRGB(0, 162, 255)\n        highlight.FillOpacity = 0.5\n        highlight.OutlineColor = Color3.fromRGB(255, 255, 255)\n        highlight.Parent = char\n    end)\nend\n\nfor _, p in ipairs(Players:GetPlayers()) do\n    if p ~= LocalPlayer then applyESP(p) end\nend\nPlayers.PlayerAdded:Connect(applyESP)`
  },
  {
    name: 'Metatable Bypass Hook',
    description: 'Bypass game anticheat metatable checks on walkspeed',
    code: `-- Anti-Cheat Metatable Bypass Hook\nlocal mt = getrawmetatable(game)\nsetreadonly(mt, false)\nlocal oldIndex = mt.__index\n\nmt.__index = newcclosure(function(t, k)\n    if t:IsA("Humanoid") and (k == "WalkSpeed" or k == "JumpPower") then\n        return k == "WalkSpeed" and 16 or 50 -- Spoof defaults\n    end\n    return oldIndex(t, k)\nend)\nsetreadonly(mt, true)\nprint("[Bypass] Metatable hooked successfully!")`
  },
  {
    name: 'Infinite Yield Admin',
    description: 'Inject premium admin custom commands console system',
    code: `-- Infinite Yield Console Command Deck\nlocal Commands = {}\nCommands.fly = function() print("Flying mode enabled") end\nCommands.speed = function(val) print("Speed set to " .. tostring(val)) end\n\nprint("[Admin] Custom Commands ready. Run help() for list.")`
  },
  {
    name: 'Tween Smooth Anim',
    description: 'CFrame tween animation macro for smooth UI or objects',
    code: `-- Smooth CFrame Animation Macro\nlocal TweenService = game:GetService("TweenService")\nlocal part = workspace:FindFirstChild("Part")\nif part then\n    local info = TweenInfo.new(2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)\n    local tween = TweenService:Create(part, info, {CFrame = part.CFrame * CFrame.new(0, 10, 0)})\n    tween:Play()\nend`
  },
  {
    name: 'Remote Event Spy',
    description: 'Log all remote calls and parameters sent to server',
    code: `-- Secure Remote Event Spy Logger\nlocal oldNamecall\noldNamecall = hookmetamethod(game, "__namecall", function(self, ...)\n    local method = getnamecallmethod()\n    if method == "FireServer" or method == "InvokeServer" then\n        print("[RemoteSpy] Target:", self.Name, "Method:", method, "Args:", {...})\n    end\n    return oldNamecall(self, ...)\nend)\nprint("[Spy] Remote event logger active.")`
  }
];

const minifyCode = (code: string): string => {
  return code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('--'))
    .join(' ');
};

const getFunctionNames = (code: string): string[] => {
  const names: string[] = [];
  const regex = /(?:local\s+)?function\s+([a-zA-Z0-9_.:]+)/g;
  let match;
  try {
    while ((match = regex.exec(code)) !== null) {
      names.push(match[1]);
    }
  } catch (e) {
    // ignore regex issues
  }
  return names;
};

function CodeEditorInner({
  files,
  setFiles,
  tabs,
  setTabs,
  activeFileId,
  setActiveFileId,
  syntaxes,
  theme,
  settings,
  onRunScript,
  onSaveFile,
  onInjectScript,
  onClearTerminal,
  onSyntaxCheck,
  isFullscreen: isFullscreenProp,
  setIsFullscreen: setIsFullscreenProp,
}: CodeEditorProps) {
  const monaco = useMonaco();
  const [editorVal, setEditorVal] = useState('');
  const saveTimeoutRef = useRef<any>(null);
  const prevActiveFileIdRef = useRef<string | null>(null);
  const editorValRef = useRef('');
  const editorRef = useRef<any>(null);

  const setEditorValueProgrammatically = (newVal: string) => {
    setEditorVal(newVal);
    if (editorRef.current) {
      editorRef.current.setValue(newVal);
    }
  };

  useEffect(() => {
    editorValRef.current = editorVal;
  }, [editorVal]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const [activeTabMenu, setActiveTabMenu] = useState<{
    fileId: string;
    x: number;
    y: number;
  } | null>(null);

  // Tab dragging state
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);

  // Right Toolbox Drawer states
  const [isToolboxOpen, setIsToolboxOpen] = useState(true);
  const [toolboxTab, setToolboxTab] = useState<'snippets' | 'analyzer' | 'config'>('snippets');

  // Local override states for hot-toggles in the editor
  const [localFontSize, setLocalFontSize] = useState<number | null>(null);
  const [localMinimap, setLocalMinimap] = useState<boolean | null>(null);
  const [localWordWrap, setLocalWordWrap] = useState<'on' | 'off' | null>(null);

  const fontSize = localFontSize !== null ? localFontSize : settings.editor.fontSize;
  const minimapEnabled = localMinimap !== null ? localMinimap : settings.editor.minimap;
  const wordWrap = localWordWrap !== null ? localWordWrap : settings.editor.wordWrap;

  // Full screen mode
  const [localFullscreen, setLocalFullscreen] = useState(false);
  const isFullscreen = isFullscreenProp !== undefined ? isFullscreenProp : localFullscreen;
  const setIsFullscreen = setIsFullscreenProp !== undefined ? setIsFullscreenProp : setLocalFullscreen;

  // Auto-scroll active tab into center of view
  useEffect(() => {
    if (activeFileId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`editor-tab-${activeFileId}`);
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeFileId]);

  // Custom rename tab GUI state
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

  // Monaco Loader / Failover States
  const [editorMode, setEditorMode] = useState<'monaco' | 'lite'>('monaco');
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const [monacoLoadingError, setMonacoLoadingError] = useState(false);

  // Fallback refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const handleTextareaScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pairs: Record<string, string> = {
      '"': '"',
      "'": "'",
      '(': ')',
      '[': ']',
      '{': '}'
    };

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = ' '.repeat(settings.editor.tabSize || 4);
      const value = textarea.value;
      const newValue = value.substring(0, start) + spaces + value.substring(end);
      
      setEditorVal(newValue);
      handleEditorChange(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    } else if (pairs[e.key] !== undefined && settings.editor.bracketAutocomplete !== false) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const closingChar = pairs[e.key];
      
      if (start !== end) {
        // Wrap selection
        const selection = value.substring(start, end);
        const newValue = value.substring(0, start) + e.key + selection + closingChar + value.substring(end);
        setEditorVal(newValue);
        handleEditorChange(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = end + 1;
        }, 0);
      } else {
        // Simple insert pair
        const newValue = value.substring(0, start) + e.key + closingChar + value.substring(end);
        setEditorVal(newValue);
        handleEditorChange(newValue);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Calculate current line text before cursor to preserve indentation
      const beforeCursor = value.substring(0, start);
      const linesBefore = beforeCursor.split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];

      // Extract leading whitespace
      const matchIndent = currentLine.match(/^(\s*)/);
      const currentIndent = matchIndent ? matchIndent[1] : '';

      // Check if we need to increase indentation (e.g., ends with: then, do, repeat, else, elseif, function, or {)
      const trimmedLine = currentLine.trim();
      const needsIncrease = /\b(then|do|repeat|else|elseif|function)\b\s*(\s*\(.*)?$|\{\s*$/.test(trimmedLine);

      const tabSize = settings.editor.tabSize || 4;
      const extraIndent = ' '.repeat(tabSize);
      const nextIndent = needsIncrease ? currentIndent + extraIndent : currentIndent;

      const newlineAndIndent = '\n' + nextIndent;
      const newValue = value.substring(0, start) + newlineAndIndent + value.substring(end);

      setEditorVal(newValue);
      handleEditorChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + newlineAndIndent.length;
      }, 0);
    }
  };

  useEffect(() => {
    if (monacoLoaded) return;

    let active = true;
    loader.init()
      .then(() => {
        if (active) {
          setMonacoLoaded(true);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load Monaco Editor from CDN:", err);
          setMonacoLoadingError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [monacoLoaded]);

  // Retrieve current active code node
  const activeFile = files.find(f => f.id === activeFileId);

  // Select active syntax profile
  const activeSyntax = syntaxes.find(s => s.id === settings.syntax.engineId) || syntaxes[0];

  useEffect(() => {
    const prevId = prevActiveFileIdRef.current;
    if (prevId && prevId !== activeFileId && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      onSaveFile(prevId, editorValRef.current);
    }

    if (activeFile) {
      const content = activeFile.content || '';
      setEditorVal(content);
      if (editorRef.current && editorRef.current.getValue() !== content) {
        editorRef.current.setValue(content);
      }
    } else {
      setEditorVal('');
      if (editorRef.current) {
        editorRef.current.setValue('');
      }
    }
    prevActiveFileIdRef.current = activeFileId;
  }, [activeFileId]);

  // Dynamic Monarch language config based on selected user-custom defined syntax rules
  useEffect(() => {
    if (!monaco) return;

    // Register Luau as custom ID if not already registered
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'luau')) {
      monaco.languages.register({ id: 'luau' });
    }

    // Advanced Language Configuration for Luau (brackets, auto-indent, block openings, and auto-closing)
    monaco.languages.setLanguageConfiguration('luau', {
      comments: {
        lineComment: '--',
        blockComment: ['--[[', ']]'],
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"', notIn: ['string'] },
        { open: "'", close: "'", notIn: ['string', 'comment'] },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      indentationRules: {
        // Increase indent when current line ends with: then, do, repeat, else, elseif, function, or {
        increaseIndentPattern: /((^|[^"'])\b(then|do|repeat|else|elseif)\b\s*(?!local\b)([^"']*--.*)?$)|(\bfunction\b\s*\(.*$)|(\{\s*$)/i,
        // Decrease indent when current line is end, else, elseif, until, or }
        decreaseIndentPattern: /^\s*(end|else|elseif|until|\})\s*$/i
      },
      onEnterRules: [
        {
          // Matches lines that open a block followed by closing characters
          beforeText: /((^|[^"'])\b(then|do|repeat|else|elseif)\b\s*(?!local\b)([^"']*--.*)?$)|(\bfunction\b\s*\(.*$)|(\{\s*$)/i,
          afterText: /^\s*(end|until|\})\s*$/i,
          action: {
            indentAction: monaco.languages.IndentAction.IndentOutdent
          }
        },
        {
          // Matches general block opening on enter
          beforeText: /((^|[^"'])\b(then|do|repeat|else|elseif)\b\s*(?!local\b)([^"']*--.*)?$)|(\bfunction\b\s*\(.*$)|(\{\s*$)/i,
          action: {
            indentAction: monaco.languages.IndentAction.Indent
          }
        }
      ]
    });

    // Build lists
    const keywordsList = activeSyntax.keywords.length > 0 ? activeSyntax.keywords : ['local', 'function', 'return', 'end'];
    const functionsList = activeSyntax.functions.length > 0 ? activeSyntax.functions : ['print', 'warn'];

    monaco.languages.setMonarchTokensProvider('luau', {
      defaultToken: 'invalid',
      keywords: keywordsList,
      functions: functionsList,
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>'
      ],
      // Regexes
      symbols:  /[=><!~?:&|+\-*\/\^%]+/,
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|u{[0-9A-Fa-f]+})/,
      
      tokenizer: {
        root: [
          // dotted identifiers first (e.g., Drawing.new, debug.getinfo)
          [/[a-zA-Z_]\w*\.[a-zA-Z_]\w*/, {
            cases: {
              '@functions': 'custom-func',
              '@default': 'identifier'
            }
          }],

          // identifiers and keywords
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@functions': 'custom-func',
              '@default': 'identifier'
            }
          }],

          // whitespace
          { include: '@whitespace' },

          // delimiters and operators
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],

          // numbers
          [/\d*\.\d+(?:[eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],

          // delimiter: member or object
          [/[;,.]/, 'delimiter'],

          // strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-templated string
          [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/'/,  { token: 'string.quote', bracket: '@open', next: '@stringSingle' }],
        ],

        string: [
          [/[^\\"]+/,  'string'],
          [/@escapes/, 'string.escape'],
          [/\\./,      'string.escape.invalid'],
          [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        stringSingle: [
          [/[^\\']+/,  'string'],
          [/@escapes/, 'string.escape'],
          [/\\./,      'string.escape.invalid'],
          [/'/,        { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/--.*$/, 'comment'], // Luau dual dashes for comment
        ],
      },
    });

    // Helper to adapt dark syntax colors on dark themes and light syntax colors on light themes
    const adaptColor = (hex: string) => {
      const clean = hex.replace('#', '');
      if (!theme.isLight) {
        if (clean === '18181b' || clean === '000000' || clean === '0f172a' || clean === '09090b' || clean === '050505') {
          return 'e2e8f0';
        }
      } else {
        if (clean === 'ffffff' || clean === 'fafafa' || clean === 'f4f4f5' || clean === 'f5f5f5') {
          return '18181b';
        }
      }
      return clean;
    };

    // Register active compiler theme depending on active custom profiles config colors!
    const italicStyle = settings.editor.enableItalics !== false ? 'italic' : '';
    const keywordStyle = settings.editor.enableItalics !== false ? 'bold italic' : 'bold';
    const sanitizedEditorBg = (theme.editorBg && theme.editorBg.startsWith('#')) ? theme.editorBg : '#0c0c0f';

    monaco.editor.defineTheme('incognitoTheme', {
      base: theme.isLight ? 'vs' : 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: adaptColor(activeSyntax.colors.keywords), fontStyle: keywordStyle },
        { token: 'custom-func', foreground: adaptColor(activeSyntax.colors.functions), fontStyle: italicStyle },
        { token: 'string', foreground: adaptColor(activeSyntax.colors.strings) },
        { token: 'number', foreground: adaptColor(activeSyntax.colors.numbers) },
        { token: 'comment', foreground: adaptColor(activeSyntax.colors.comments), fontStyle: italicStyle },
        { token: 'operator', foreground: adaptColor(activeSyntax.colors.operators) },
        { token: 'identifier', foreground: theme.isLight ? '18181b' : 'e2e8f0' },
      ],
      colors: {
        'editor.background': sanitizedEditorBg,
        'editor.foreground': theme.isLight ? '#18181b' : '#f1f5f9',
        'editorLineNumber.foreground': theme.isLight ? '#71717a' : '#52525b',
        'editorLineNumber.activeForeground': theme.accent,
        'editor.lineHighlightBackground': theme.isLight ? '#fafafa50' : '#1e222b40',
        'editor.selectionBackground': `${theme.accent}33`,
        'editorCursor.foreground': theme.accent,
      }
    });

    monaco.editor.setTheme('incognitoTheme');

    // Register dynamic autocomplete completion provider
    const completionProvider = monaco.languages.registerCompletionItemProvider('luau', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const keywordsSuggestions = keywordsList.map(kw => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range: range
        }));

        const functionsSuggestions = functionsList.map(fn => ({
          label: fn,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${fn}($1)`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        }));

        const luauGlobals = [
          { name: 'task', desc: 'Schedules tasks', kind: 'Module' },
          { name: 'task.wait', desc: 'Yields the current thread for the specified duration', kind: 'Method', snippet: 'task.wait($1)' },
          { name: 'task.delay', desc: 'Schedules a function to run after a specified delay', kind: 'Method', snippet: 'task.delay(${1:delay}, function()\n\t$2\nend)' },
          { name: 'task.spawn', desc: 'Spawns a thread immediately', kind: 'Method', snippet: 'task.spawn(function()\n\t$1\nend)' },
          { name: 'game', desc: 'The DataModel root service container', kind: 'Variable' },
          { name: 'workspace', desc: 'Quick reference to game.Workspace', kind: 'Variable' },
          { name: 'Instance', desc: 'Constructor helper for creating Object instances', kind: 'Module' },
          { name: 'Instance.new', desc: 'Creates a new object instance', kind: 'Method', snippet: 'Instance.new("${1:Part}", ${2:workspace})' },
          { name: 'Vector3', desc: 'Constructor helper for 3D coordinates', kind: 'Module' },
          { name: 'Vector3.new', desc: 'Creates a new Vector3 coordinate', kind: 'Method', snippet: 'Vector3.new(${1:0}, ${2:0}, ${3:0})' },
          { name: 'math.clamp', desc: 'Clamps a number between a min and max', kind: 'Method', snippet: 'math.clamp(${1:val}, ${2:min}, ${3:max})' },
          { name: 'math.random', desc: 'Returns a random number or integer', kind: 'Method', snippet: 'math.random(${1:1}, ${2:100})' },
          { name: 'TweenService', desc: 'Service to animate property offsets smoothly', kind: 'Module' },
          { name: 'Players', desc: 'Roblox / Luau Players server/client container', kind: 'Module' },
          { name: 'ReplicatedStorage', desc: 'Synchronized workspace assets container', kind: 'Module' },
          { name: 'Script', desc: 'Reference to this active script instance', kind: 'Variable' },
          { name: 'print', desc: 'Log standard message debug lines to developer output', kind: 'Function', snippet: 'print($1)' },
          { name: 'warn', desc: 'Log colored warning lines to diagnostic output', kind: 'Function', snippet: 'warn($1)' },
          { name: 'error', desc: 'Raise fatal exception and discontinue sequence execution', kind: 'Function', snippet: 'error($1)' },
          { name: 'pairs', desc: 'Generator function for standard iterative loops', kind: 'Function', snippet: 'pairs($1)' },
          { name: 'ipairs', desc: 'Generator function for indexed sequential arrays', kind: 'Function', snippet: 'ipairs($1)' },
          { name: 'type', desc: 'Identifies string type names of parameters', kind: 'Function', snippet: 'type($1)' },
          { name: 'typeof', desc: 'Identifies complex structure type names in Luau environment', kind: 'Function', snippet: 'typeof($1)' },
        ];

        const rbxSuggestions = luauGlobals.map(g => {
          let kind = monaco.languages.CompletionItemKind.Variable;
          if (g.kind === 'Method' || g.kind === 'Function') kind = monaco.languages.CompletionItemKind.Method;
          if (g.kind === 'Module') kind = monaco.languages.CompletionItemKind.Module;
          return {
            label: g.name,
            kind: kind,
            documentation: g.desc,
            insertText: g.snippet || g.name,
            insertTextRules: g.snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            range: range
          };
        });

        return {
          suggestions: [...keywordsSuggestions, ...functionsSuggestions, ...rbxSuggestions]
        };
      }
    });

    return () => {
      completionProvider.dispose();
    };

  }, [monaco, activeSyntax, theme, settings.editor.enableItalics]);

  // Handle Monaco changes
  const handleEditorChange = (val: string | undefined) => {
    const updatedVal = val || '';
    setEditorVal(updatedVal);

    if (activeFileId) {
      // Mark tab as unsaved if contents changed from disk representation
      const orig = files.find(f => f.id === activeFileId);
      if (orig && orig.content !== updatedVal) {
        setTabs(prev => prev.map(t => {
          if (t.fileId === activeFileId) {
            return { ...t, isUnsaved: true };
          }
          return t;
        }));
      }

      // If autosave is on, debounce updating local database to avoid freezing the editor
      if (settings.editor.autoSave) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          onSaveFile(activeFileId, updatedVal);
          saveTimeoutRef.current = null;
        }, 1000);
      }
    }
  };

  const handleClearEditorText = () => {
    if (!activeFileId) return;
    setEditorValueProgrammatically('');
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: '' } : f));
    // Also trigger save so the cleared file is immediately committed
    onSaveFile(activeFileId, '');
  };

  // Keyboard save manual hook: Ctrl + S or Command + S
  useEffect(() => {
    const handleSaveHotkey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        triggerManualSave();
      }
    };
    window.addEventListener('keydown', handleSaveHotkey);
    return () => window.removeEventListener('keydown', handleSaveHotkey);
  }, [activeFileId, editorVal]);

  const triggerManualSave = () => {
    if (activeFileId) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      onSaveFile(activeFileId, editorVal);
      setTabs(prev => prev.map(t => {
        if (t.fileId === activeFileId) {
          return { ...t, isUnsaved: false };
        }
        return t;
      }));
    }
  };

  // Tab operations
  const handleCloseTab = (fId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const targetTab = tabs.find(t => t.fileId === fId);
    if (targetTab?.isUnsaved && !settings.editor.autoSave) {
      if (!confirm('You have unsaved workspace logs. Lose these changes?')) {
        return;
      }
    }

    const filtered = tabs.filter(t => t.fileId !== fId);
    setTabs(filtered);

    if (activeFileId === fId) {
      if (filtered.length > 0) {
        // Select nearest tab
        const lastTab = filtered[filtered.length - 1];
        setActiveFileId(lastTab.fileId);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const handleCloseOthers = (fId: string) => {
    const filtered = tabs.filter(t => t.fileId === fId || t.isPinned);
    setTabs(filtered);
    setActiveFileId(fId);
  };

  const handleTogglePin = (fId: string) => {
    setTabs(prev => prev.map(t => {
      if (t.fileId === fId) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    }));
  };

  const handleDuplicate = (fId: string) => {
    const orig = files.find(f => f.id === fId);
    if (!orig) return;

    const newId = `file-${Date.now()}`;
    const newName = `Copy_${orig.name}`;
    const newNode: FileNode = {
      ...orig,
      id: newId,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFiles(prev => [...prev, newNode]);
    // open tab
    setTabs(prev => [...prev, { fileId: newId, isPinned: false }]);
    setActiveFileId(newId);
  };

  const handleRename = (fId: string) => {
    const orig = files.find(f => f.id === fId);
    if (!orig) return;

    setRenameFileId(fId);
    setRenameInputValue(orig.name);
    setRenameError(null);
  };

  const submitTabRename = (e: React.FormEvent) => {
    e.preventDefault();
    const val = renameInputValue.trim();
    if (!val) {
      setRenameError('Filename cannot be empty');
      return;
    }
    if (val.includes('/') || val.includes('\\')) {
      setRenameError('Invalid characters in file name');
      return;
    }
    setFiles(prev => prev.map(f => {
      if (f.id === renameFileId) {
        return { ...f, name: val, updatedAt: new Date().toISOString() };
      }
      return f;
    }));
    setRenameFileId(null);
  };

  const handleRightClickTab = (e: React.MouseEvent, fId: string) => {
    e.preventDefault();
    setActiveTabMenu({
      fileId: fId,
      x: e.clientX,
      y: e.clientY
    });
  };

  useEffect(() => {
    const closeTabMenu = () => setActiveTabMenu(null);
    window.addEventListener('click', closeTabMenu);
    return () => window.removeEventListener('click', closeTabMenu);
  }, []);

  // Sort Pinned first, then normal tabs
  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // maintain relative order otherwise
  });

  // Reorder dragging handlers
  const handleDragStart = (e: React.DragEvent, fId: string) => {
    setDraggedFileId(fId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetFId: string) => {
    e.preventDefault();
    if (!draggedFileId || draggedFileId === targetFId) return;

    const draggedIdx = tabs.findIndex(t => t.fileId === draggedFileId);
    const targetIdx = tabs.findIndex(t => t.fileId === targetFId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const reordered = [...tabs];
      const [removed] = reordered.splice(draggedIdx, 1);
      reordered.splice(targetIdx, 0, removed);
      setTabs(reordered);
    }
    setDraggedFileId(null);
  };

  const insertSnippet = (snippetCode: string) => {
    if (!activeFileId) return;
    
    if (editorMode === 'monaco' && editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      const m = monaco || (window as any).monaco;
      if (m && selection) {
        const range = new m.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        );
        const id = { major: 1, minor: 1 };
        const op = { identifier: id, range: range, text: snippetCode, forceMoveMarkers: true };
        editor.executeEdits("snippet-insertion", [op]);
        editor.focus();
      } else {
        const updatedVal = editorVal + "\n" + snippetCode;
        setEditorValueProgrammatically(updatedVal);
        handleEditorChange(updatedVal);
      }
    } else {
      // fallback for textarea
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        const updatedVal = before + snippetCode + after;
        setEditorValueProgrammatically(updatedVal);
        handleEditorChange(updatedVal);
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + snippetCode.length;
        }, 10);
      } else {
        const updatedVal = editorVal + "\n" + snippetCode;
        setEditorValueProgrammatically(updatedVal);
        handleEditorChange(updatedVal);
      }
    }
  };

  const beautifyScript = () => {
    if (!editorVal) return;
    let lines = editorVal.split('\n');
    let formattedLines = lines.map(line => line.trimEnd());
    let cleaned: string[] = [];
    let emptyCount = 0;
    for (let line of formattedLines) {
      if (line.trim() === '') {
        emptyCount++;
        if (emptyCount <= 1) {
          cleaned.push('');
        }
      } else {
        emptyCount = 0;
        cleaned.push(line);
      }
    }
    const result = cleaned.join('\n').trim();
    setEditorValueProgrammatically(result);
    onSaveFile(activeFileId, result);
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 font-sans select-none relative ${isFullscreen ? 'fixed inset-0 z-40 bg-[#0c0d0f]' : 'h-full'}`}>
      
      {/* Tab Area Toolbar standard row */}
      <div
        style={{
          backgroundColor: theme.headerBg,
        }}
        className={`h-9 flex items-stretch select-none shrink-0 relative`}
        onWheel={(e) => {
          const container = e.currentTarget.querySelector('.tabs-scroll-container');
          if (container) {
            container.scrollLeft += e.deltaY;
          }
        }}
      >
        {/* Subtle left spacer with bottom border to align starting tab nicely */}
        <div 
          style={{ borderColor: theme.borderColor }}
          className="w-2 h-full border-b shrink-0" 
        />

        <div className={`tabs-scroll-container flex items-stretch ${isFullscreen ? 'justify-center' : 'flex-1'} min-w-0 h-full overflow-x-auto no-scrollbar scroll-smooth`}>
          {sortedTabs.map((tb, index) => {
            const fileItem = files.find(f => f.id === tb.fileId);
            if (!fileItem) return null;

            const isCurrent = activeFileId === tb.fileId;
            const isUnsaved = !!tb.isUnsaved;
            const isNextActive = activeFileId === sortedTabs[index + 1]?.fileId;

            return (
              <div key={tb.fileId} className="flex items-stretch h-full relative shrink-0">
                <div
                  id={`editor-tab-${tb.fileId}`}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, tb.fileId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, tb.fileId)}
                  onContextMenu={(e) => handleRightClickTab(e, tb.fileId)}
                  onClick={() => setActiveFileId(tb.fileId)}
                  style={{
                    backgroundColor: isCurrent ? theme.editorBg : 'transparent',
                    borderColor: theme.borderColor,
                  }}
                  className={`group cursor-pointer relative text-[11px] min-w-[120px] max-w-[200px] flex-1 shrink-0 overflow-visible flex items-center justify-between px-3.5 h-full transition-colors duration-75 ${
                    isCurrent 
                      ? 'text-zinc-100 font-medium rounded-t-[5px] z-20' 
                      : 'text-zinc-400 hover:text-zinc-200 border-b z-10 hover:bg-zinc-850/20'
                  }`}
                >
                  {/* Symmetrical Left and Right Inverted curves for seamless physical connection to the editor body */}
                  {isCurrent && (
                    <>
                      {/* Left Curve */}
                      <svg 
                        className="absolute bottom-0 -left-[6px] w-[6px] h-[6px] pointer-events-none z-20" 
                        viewBox="0 0 6 6" 
                        fill="none"
                      >
                        <path d="M6,0 C6,3.31 3.31,6 0,6 L6,6 Z" fill={theme.editorBg} />
                      </svg>
                      {/* Right Curve */}
                      <svg 
                        className="absolute bottom-0 -right-[6px] w-[6px] h-[6px] pointer-events-none z-20" 
                        viewBox="0 0 6 6" 
                        fill="none"
                      >
                        <path d="M0,0 C0,3.31 2.69,6 6,6 L0,6 Z" fill={theme.editorBg} />
                      </svg>

                      {/* Extremely subtle glass-like border stroke at the top/left/right of the active tab */}
                      <div 
                        style={{ borderColor: theme.isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)' }}
                        className="absolute inset-0 border-t border-l border-r rounded-t-[5px] pointer-events-none" 
                      />
                    </>
                  )}

                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <FileCode 
                      size={12} 
                      style={{ 
                        color: isCurrent ? theme.accent : undefined,
                        filter: isCurrent ? `drop-shadow(0 0 3px ${theme.accent}40)` : 'none'
                      }} 
                      className="shrink-0 transition-all duration-200" 
                    />
                    
                    <span className={`truncate font-mono text-[10px] transition-all duration-200 ${
                      isCurrent ? 'tracking-wide text-zinc-100 font-medium' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}>
                      {fileItem.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 pl-1.5 ml-auto">
                    {/* Pin Badge icon */}
                    {tb.isPinned && (
                      <Pin size={10} className="text-amber-500 shrink-0 transform -rotate-45" />
                    )}

                    {/* Close/Status element - Always visible on active tab, hovered on inactive */}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 relative">
                      {isUnsaved && !settings.editor.autoSave ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse group-hover:opacity-0 transition-opacity duration-75" />
                      ) : null}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(tb.fileId, e);
                        }}
                        className={`absolute inset-0 w-4 h-4 rounded flex items-center justify-center transition-all duration-75 cursor-pointer z-10 ${
                          isCurrent
                            ? 'opacity-80 hover:opacity-100 hover:bg-zinc-800/60 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-100'
                            : 'opacity-0 group-hover:opacity-100 hover:bg-zinc-800/40 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-200'
                        }`}
                        title="Close Tab"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtle vertical separator line between inactive tabs */}
                {!isCurrent && !isNextActive && index < sortedTabs.length - 1 && (
                  <div 
                    style={{ backgroundColor: theme.borderColor }}
                    className="absolute right-0 top-1/4 h-1/2 w-[1px] opacity-40 pointer-events-none z-0" 
                  />
                )}
              </div>
            );
          })}

          {/* Plus icon to quickly create new script file in workspace */}
          <div 
            style={{ borderColor: theme.borderColor }}
            className="h-full flex items-center px-2 border-b shrink-0"
          >
            <button
              onClick={() => {
                let baseName = 'script';
                let extension = '.lua';
                let finalName = `${baseName}${extension}`;
                let index = 1;
                while (files.some(f => f.name.toLowerCase() === finalName.toLowerCase())) {
                  finalName = `${baseName}${index}${extension}`;
                  index++;
                }
                const newId = `file-${Date.now()}`;
                const newFile: FileNode = {
                  id: newId,
                  name: finalName,
                  type: 'file',
                  parentId: null,
                  content: '-- New script in workspace\nprint("Hello World")\n',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  size: 0
                };
                setFiles(prev => [...prev, newFile]);
                setTabs(prev => [...prev, { fileId: newId, isPinned: false }]);
                setActiveFileId(newId);
              }}
              className="flex items-center justify-center h-6 w-6 rounded hover:bg-zinc-800/30 dark:hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition shrink-0 cursor-pointer"
              title="Create new script file"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Right spacer to continue the bottom border across empty space */}
          <div 
            style={{ borderColor: theme.borderColor }}
            className="flex-1 h-full border-b min-w-[12px]" 
          />
        </div>
      </div>

      {/* Editor Main Client Panel */}
      <div 
        style={{
          backgroundColor: theme.id === 'transparent-beta' ? 'transparent' : theme.editorBg
        }}
        className="flex-1 min-h-0 flex flex-col relative"
      >
        {activeFileId ? (
          <div className="flex-1 min-h-0 text-left flex flex-col relative h-full">
            
            {/* Split view: Editor left, Toolbox right */}
            <div className="flex-1 flex min-h-0 relative w-full overflow-hidden">
              <div className="flex-1 min-h-0 relative h-full">
                {editorMode === 'monaco' ? (
                  <Editor
                    height="100%"
                    language="luau"
                    path={activeFileId}
                    defaultValue={activeFile?.content || ''}
                    onMount={(editor) => {
                      editorRef.current = editor;
                    }}
                    onChange={handleEditorChange}
                    theme="incognitoTheme"
                    options={{
                      fontSize: fontSize,
                      fontFamily: settings.editor.fontFamily,
                      tabSize: settings.editor.tabSize,
                      wordWrap: wordWrap,
                      minimap: { enabled: minimapEnabled },
                      automaticLayout: true,
                      padding: { top: 8, bottom: 8 },
                      cursorBlinking: settings.editor.cursorBlinking || 'smooth',
                      cursorSmoothCaretAnimation: settings.editor.smoothCaret !== false ? 'on' : 'off',
                      cursorStyle: settings.editor.cursorStyle || 'line',
                      cursorWidth: 2,
                      folding: true,
                      autoIndent: 'full',
                      bracketPairColorization: { enabled: true },
                      colorDecorators: true,
                      formatOnPaste: true,
                      contextmenu: true,
                      autoClosingBrackets: settings.editor.bracketAutocomplete ? 'always' : 'never',
                      autoClosingQuotes: settings.editor.bracketAutocomplete ? 'always' : 'never',
                      autoSurround: settings.editor.bracketAutocomplete ? 'languageDefined' : 'never',
                      quickSuggestions: { other: true, comments: false, strings: false },
                      suggestOnTriggerCharacters: true,
                      acceptSuggestionOnEnter: 'on',
                      tabCompletion: 'on',
                      parameterHints: { enabled: true },
                      dragAndDrop: true,
                      wordBasedSuggestions: 'allDocuments'
                    }}
                  />
                ) : (
                  <div className="flex-1 flex min-h-0 w-full relative overflow-hidden h-full" style={{ backgroundColor: theme.editorBg }}>
                    {/* Line Gutter */}
                    <div 
                      ref={gutterRef}
                      className="w-12 select-none pr-2.5 text-right font-mono overflow-hidden border-r shrink-0 opacity-40 py-2 select-none scrollbar-none"
                      style={{ 
                        borderColor: theme.borderColor, 
                        color: theme.isLight ? '#71717a' : '#a1a1aa',
                        backgroundColor: theme.headerBg 
                      }}
                    >
                      {Array.from({ length: editorVal.split('\n').length || 1 }).map((_, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            fontSize: `${fontSize}px`,
                            fontFamily: settings.editor.fontFamily,
                            height: '22px',
                            lineHeight: '22px'
                          }}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Textarea Area */}
                    <textarea
                      ref={textareaRef}
                      value={editorVal}
                      onChange={(e) => handleEditorChange(e.target.value)}
                      onScroll={handleTextareaScroll}
                      onKeyDown={handleTextareaKeyDown}
                      spellCheck={false}
                      placeholder="-- Start writing your Luau code here..."
                      className="flex-1 h-full py-2 px-3 resize-none focus:outline-none focus:ring-0 border-0 font-mono overflow-y-auto"
                      style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: settings.editor.fontFamily,
                        lineHeight: '22px',
                        backgroundColor: theme.editorBg,
                        color: theme.isLight ? '#18181b' : '#f1f5f9',
                      }}
                    />

                    {/* Lite Mode Indicator Badge */}
                    <div className="absolute top-3 right-3 bg-zinc-900/90 border border-zinc-800 backdrop-blur-sm rounded-full py-1 px-3 flex items-center space-x-1.5 text-[9px] font-mono font-bold text-zinc-400 select-none z-10 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Lite Mode Fallback</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Right-Side Premium Toolbox Drawer */}
              {isToolboxOpen && (
                <div 
                  style={{ 
                    backgroundColor: theme.id === 'transparent-beta' ? 'rgba(10, 11, 15, 0.4)' : theme.sidebarBg,
                    borderColor: theme.borderColor,
                  }}
                  className="w-80 h-full border-l flex flex-col shrink-0 select-none backdrop-blur-md relative overflow-hidden"
                >
                  {/* Glass highlight effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                  {/* Header */}
                  <div className="h-11 border-b border-zinc-900/40 px-3.5 flex items-center justify-between bg-zinc-950/20 relative z-10">
                    <div className="flex items-center space-x-1.5 text-zinc-300">
                      <Sparkles size={13} style={{ color: theme.accent }} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Workspace Assistant</span>
                    </div>
                    <button
                      onClick={() => setIsToolboxOpen(false)}
                      className="p-1 hover:bg-zinc-800/40 dark:hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Windows 11 Fluent Tab Bar */}
                  <div className="h-9 border-b border-zinc-900/40 px-2 flex items-center space-x-1 bg-zinc-950/10 relative z-10">
                    {(['snippets', 'analyzer', 'config'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setToolboxTab(tab)}
                        className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-all duration-75 cursor-pointer ${
                          toolboxTab === tab
                            ? 'bg-zinc-900/80 border border-zinc-800 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {tab === 'snippets' ? 'Snippets' : tab === 'analyzer' ? 'Analyzer' : 'Controls'}
                      </button>
                    ))}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-left relative z-10 scrollbar-none">
                    {toolboxTab === 'snippets' && (
                      <div className="space-y-3">
                        <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1">Double click or click Plus to inject template:</div>
                        <div className="space-y-2">
                          {WORKSPACE_SNIPPETS.map((snip) => (
                            <div 
                              key={snip.name}
                              onClick={() => insertSnippet(snip.code)}
                              className="group p-2.5 rounded-xl border border-zinc-900/80 bg-zinc-950/40 hover:bg-zinc-900/30 hover:border-zinc-700/60 cursor-pointer transition-all duration-75"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold font-mono text-zinc-200 group-hover:text-white transition-colors">{snip.name}</span>
                                <Plus size={11} style={{ color: theme.accent }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-[9px] font-mono text-zinc-500 mt-1 leading-normal">{snip.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {toolboxTab === 'analyzer' && (
                      <div className="space-y-4">
                        {/* Quality indicators */}
                        <div className="p-3 rounded-xl border border-zinc-900/80 bg-zinc-950/40 space-y-2">
                          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Real-time script telemetry</span>
                          <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                            <div className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-900/50">
                              <div className="text-[9px] text-zinc-500 uppercase">Lines</div>
                              <div className="text-sm font-bold text-zinc-200 mt-0.5">{editorVal.split('\n').filter(l=>l.trim()).length}</div>
                            </div>
                            <div className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-900/50">
                              <div className="text-[9px] text-zinc-500 uppercase">Chars</div>
                              <div className="text-sm font-bold text-zinc-200 mt-0.5">{editorVal.length}</div>
                            </div>
                            <div className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-900/50">
                              <div className="text-[9px] text-zinc-500 uppercase">Functions</div>
                              <div className="text-sm font-bold text-zinc-200 mt-0.5">{(editorVal.match(/\bfunction\b/g) || []).length}</div>
                            </div>
                            <div className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-900/50">
                              <div className="text-[9px] text-zinc-500 uppercase">Variables</div>
                              <div className="text-sm font-bold text-zinc-200 mt-0.5">{(editorVal.match(/\blocal\s+\w+/g) || []).length}</div>
                            </div>
                          </div>
                        </div>

                        {/* Compiler refactoring */}
                        <div className="p-3 rounded-xl border border-zinc-900/80 bg-zinc-950/40 space-y-2">
                          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Refactoring Commands</span>
                          <div className="flex flex-col space-y-2 pt-1">
                            <button
                              onClick={beautifyScript}
                              style={{ borderColor: theme.borderColor }}
                              className="w-full py-2 bg-zinc-900/60 hover:bg-zinc-850 border rounded-lg text-[10px] font-mono font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-center space-x-1.5"
                            >
                              <RotateCcw size={11} />
                              <span>Beautify & Format Code</span>
                            </button>
                            <button
                              onClick={() => {
                                if (editorVal) {
                                  const minified = minifyCode(editorVal);
                                  setEditorValueProgrammatically(minified);
                                  onSaveFile(activeFileId, minified);
                                }
                              }}
                              style={{ borderColor: theme.borderColor }}
                              className="w-full py-2 bg-zinc-900/60 hover:bg-zinc-850 border rounded-lg text-[10px] font-mono font-bold text-zinc-300 hover:text-white transition cursor-pointer flex items-center justify-center space-x-1.5"
                            >
                              <Lock size={11} />
                              <span>Minify Script Space</span>
                            </button>
                          </div>
                        </div>

                        {/* Functions checklist */}
                        <div className="p-3 rounded-xl border border-zinc-900/80 bg-zinc-950/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Symbol Navigator</span>
                            <span className="text-[8px] font-mono font-bold bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">LUAU</span>
                          </div>
                          <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-[10px] text-zinc-400 scrollbar-none pt-1">
                            {getFunctionNames(editorVal).length > 0 ? (
                              getFunctionNames(editorVal).map((fn, idx) => (
                                <div key={idx} className="flex items-center space-x-1.5 py-0.5 border-b border-zinc-900/30 truncate">
                                  <span className="text-[8px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded px-1 shrink-0">FN</span>
                                  <span className="truncate text-zinc-300">{fn}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-[9px] text-zinc-600 text-center py-2">No functions found.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {toolboxTab === 'config' && (
                      <div className="space-y-4 font-mono">
                        <div className="p-3 rounded-xl border border-zinc-900/80 bg-zinc-950/40 space-y-3">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Hot-Toggles</span>
                          
                          {/* Font size control */}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-zinc-400">Font Size ({fontSize}px)</span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setLocalFontSize(Math.max(10, fontSize - 1))}
                                className="w-6 h-6 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer text-xs font-bold"
                              >
                                -
                              </button>
                              <button
                                onClick={() => setLocalFontSize(Math.min(24, fontSize + 1))}
                                className="w-6 h-6 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Minimap control */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">Editor Minimap</span>
                            <button
                              onClick={() => setLocalMinimap(!minimapEnabled)}
                              className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all duration-75 cursor-pointer ${
                                minimapEnabled
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                              }`}
                            >
                              {minimapEnabled ? 'Visible' : 'Hidden'}
                            </button>
                          </div>

                          {/* Word wrap control */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">Word Wrap</span>
                            <button
                              onClick={() => setLocalWordWrap(wordWrap === 'on' ? 'off' : 'on')}
                              className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all duration-75 cursor-pointer ${
                                wordWrap === 'on'
                                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                              }`}
                            >
                              {wordWrap === 'on' ? 'Wrapped' : 'Standard'}
                            </button>
                          </div>
                        </div>

                        {/* Roblox services autoloader */}
                        <div className="p-3 rounded-xl border border-zinc-900/80 bg-zinc-950/40 space-y-2">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Service Instantiation</span>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {['Players', 'ReplicatedStorage', 'TweenService', 'RunService', 'HttpService', 'UserInputService'].map(srv => (
                              <button
                                key={srv}
                                onClick={() => insertSnippet(`local ${srv} = game:GetService("${srv}")\n`)}
                                className="py-1 bg-zinc-900/60 hover:bg-zinc-850 hover:text-white border border-zinc-900 rounded text-[9px] text-zinc-400 text-left px-2 truncate cursor-pointer transition-colors"
                              >
                                {srv}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 100x Improved Editor Actions Bottom Bar */}
            <div 
              style={{
                backgroundColor: theme.headerBg,
                borderColor: theme.borderColor,
              }}
              className="h-14 border-t flex items-center justify-between px-4 select-none shrink-0"
            >
              {/* Left group: Custom Status & Obfuscate/Deobfuscate Actions (Logos only) */}
              <div className="flex items-center space-x-2">
                {/* Syntax Checker Diagnostic Logo Badge */}
                <button
                  onClick={() => onSyntaxCheck?.()}
                  style={{
                    backgroundColor: theme.isLight ? '#f4f4f5' : '#0a0a0c',
                    borderColor: theme.borderColor
                  }}
                  className="h-9 w-9 rounded-xl border flex items-center justify-center hover:brightness-110 active:scale-95 transition-all text-emerald-400 cursor-pointer"
                  title="Run Diagnostic Syntax Verification Checker"
                >
                  <CheckCircle size={15} />
                </button>

                 {/* Obfuscate Button (Lock logo) */}
                <button
                  onClick={() => {
                    if (editorVal) {
                      const obfuscated = obfuscateLuauCode(editorVal);
                      setEditorValueProgrammatically(obfuscated);
                      onSaveFile(activeFileId, obfuscated);
                    }
                  }}
                  style={{
                    backgroundColor: theme.isLight ? '#f4f4f5' : '#0a0a0c',
                    borderColor: theme.borderColor,
                    color: theme.isLight ? '#52525b' : '#a1a1aa'
                  }}
                  className="h-9 w-9 rounded-xl border flex items-center justify-center hover:bg-zinc-800/30 hover:text-white hover:border-zinc-500 active:scale-95 transition-all cursor-pointer"
                  title="Obfuscate Luau Script Code"
                >
                  <Lock size={15} />
                </button>

                {/* Deobfuscate / Beautify Button (Unlock logo) */}
                <button
                  onClick={() => {
                    if (editorVal) {
                      const deobfuscated = deobfuscateLuauCode(editorVal);
                      setEditorValueProgrammatically(deobfuscated);
                      onSaveFile(activeFileId, deobfuscated);
                    }
                  }}
                  style={{
                    backgroundColor: theme.isLight ? '#f4f4f5' : '#0a0a0c',
                    borderColor: theme.borderColor,
                    color: theme.isLight ? '#52525b' : '#a1a1aa'
                  }}
                  className="h-9 w-9 rounded-xl border flex items-center justify-center hover:bg-zinc-800/30 hover:text-white hover:border-zinc-500 active:scale-95 transition-all cursor-pointer"
                  title="Deobfuscate / Beautify Luau Script Code"
                >
                  <Unlock size={15} />
                </button>

                {/* Toolbox Toggle Button */}
                <button
                  onClick={() => setIsToolboxOpen(!isToolboxOpen)}
                  style={{
                    backgroundColor: isToolboxOpen ? `${theme.accent}15` : (theme.isLight ? '#f4f4f5' : '#0a0a0c'),
                    borderColor: isToolboxOpen ? `${theme.accent}40` : theme.borderColor,
                    color: isToolboxOpen ? theme.accent : (theme.isLight ? '#52525b' : '#a1a1aa')
                  }}
                  className="h-9 px-3.5 rounded-xl border flex items-center space-x-1.5 text-xs font-mono font-bold active:scale-95 hover:brightness-110 transition-all cursor-pointer"
                  title="Toggle Workspace Toolbox Panel"
                >
                  <Sparkles size={14} className={isToolboxOpen ? 'animate-pulse' : ''} style={{ color: isToolboxOpen ? theme.accent : undefined }} />
                  <span className="text-[10px] uppercase tracking-wider">Toolbox</span>
                </button>
              </div>

              {/* Right group: Clear, Fullscreen, Inject, Execute (Logos only) */}
              <div className="flex items-center space-x-2">
                {/* Clear Code Button */}
                <button
                  onClick={handleClearEditorText}
                  style={{
                    backgroundColor: theme.isLight ? 'rgba(239, 68, 68, 0.05)' : '#0a0a0c',
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                    color: '#ef4444'
                  }}
                  className="h-9 w-9 rounded-xl border flex items-center justify-center hover:bg-rose-500/15 active:scale-95 transition-all text-red-500 cursor-pointer"
                  title="Clear Code Area Content"
                >
                  <Trash2 size={15} />
                </button>

                {/* Fullscreen Button */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  style={{
                    backgroundColor: theme.isLight ? '#f4f4f5' : '#0a0a0c',
                    borderColor: theme.borderColor
                  }}
                  className="h-9 w-9 rounded-xl border flex items-center justify-center hover:brightness-110 active:scale-95 transition-all text-zinc-400 cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen Editor" : "Enter Fullscreen Editor"}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                <div className="h-5 w-[1px] bg-zinc-800/80 mx-1" />

                {/* Inject Script Button */}
                <button
                  onClick={() => onInjectScript?.(activeFileId)}
                  style={{
                    backgroundColor: theme.isLight ? 'rgba(16, 185, 129, 0.05)' : '#0a0a0c',
                    borderColor: 'rgba(16, 185, 129, 0.25)'
                  }}
                  className="h-9 w-9 rounded-xl border flex items-center justify-center hover:bg-emerald-500/15 active:scale-95 transition-all text-emerald-400 cursor-pointer"
                  title="Inject Script into game process"
                >
                  <Syringe size={15} />
                </button>

                {/* Execute Script Button */}
                <button
                  onClick={() => onRunScript(activeFileId)}
                  style={{
                    backgroundColor: theme.isLight ? `${theme.accent}0a` : '#0a0a0c',
                    borderColor: `${theme.accent}40`,
                    color: theme.accent,
                    boxShadow: `0 0 10px ${theme.accent}15`
                  }}
                  className="h-9 w-9 rounded-xl border flex items-center justify-center hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title="Execute current script"
                >
                  <Play size={14} className="fill-current" />
                </button>
              </div>
            </div>

            {/* Float Save alert */}
            {tabs.find(t => t.fileId === activeFileId)?.isUnsaved && (
              <div 
                className="absolute bottom-18 right-4 border backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center space-x-2 font-mono text-[10px] z-10 shadow-lg"
                style={{ 
                  backgroundColor: `${theme.accent}14`, 
                  borderColor: `${theme.accent}40`,
                  color: theme.accent
                }}
              >
                <AlertCircle size={12} className="shrink-0" />
                <span>Unsaved changes. Ctrl+S to save code state.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-zinc-950/60 relative">
            <div className="absolute inset-0 bg-radial-[circle_400px_at_50%_50%,rgba(0,0,0,0.03),transparent]" />

            <div className="space-y-4 max-w-sm relative z-10 font-sans">
              <FileCode size={32} className="text-zinc-800 mx-auto animate-pulse" />
              <div>
                <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">
                  No Active File
                </h3>
                <p className="text-[11px] text-zinc-650 mt-2 font-mono leading-relaxed uppercase">
                  Select key scripts from the explorer on the left to start coding.
                </p>
              </div>

              <div className="border border-zinc-900 bg-zinc-950 p-3 rounded-lg text-left text-[10px] font-mono text-zinc-500 leading-relaxed max-w-xs mx-auto">
                <div className="text-zinc-400 font-bold border-b border-zinc-900 pb-1 mb-1.5 uppercase">Shortcuts Cheat-Sheet:</div>
                <div className="flex justify-between py-0.5"><span>Ctrl + P</span> <span style={{ color: theme.accent }}>Command Palette</span></div>
                <div className="flex justify-between py-0.5"><span>Ctrl + S</span> <span>Save Workspace logs</span></div>
                <div className="flex justify-between py-0.5"><span>Escape</span> <span>Exit floating consoles</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating right click TAB menu popover */}
      {activeTabMenu && (
        <div
          style={{
            top: `${activeTabMenu.y}px`,
            left: `${activeTabMenu.x}px`,
            backgroundColor: theme.sidebarBg,
            borderColor: theme.borderColor,
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
          }}
          className="fixed z-50 border rounded-lg py-1.5 w-44 font-sans text-xs flex flex-col pointer-events-auto bg-[#13141a]"
        >
          <button
            onClick={() => handleRename(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2"
          >
            <span>Rename File Tab</span>
          </button>

          <button
            onClick={() => handleTogglePin(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2"
          >
            <span>Pin Standard Anchor</span>
          </button>

          <button
            onClick={() => handleDuplicate(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2"
          >
            <span>Duplicate File</span>
          </button>

          <div className="h-[1px] bg-zinc-800 my-1" />

          <button
            onClick={() => handleCloseOthers(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2"
          >
            <span>Close Other Tabs</span>
          </button>

          <button
            onClick={() => handleCloseTab(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-rose-500 hover:bg-rose-500/10 transition flex items-center space-x-2 font-semibold"
          >
            <span>Close Active Tab</span>
          </button>
        </div>
      )}
      {/* Custom Rename Tab GUI modal */}
      {renameFileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 select-none">
          <div 
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.borderColor,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }} 
            className="w-full max-w-sm rounded-2xl border p-6 font-sans mx-4"
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-center space-x-2">
                <Sliders size={14} style={{ color: theme.accent }} />
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                  Rename Tab File
                </h4>
              </div>
              <button 
                onClick={() => setRenameFileId(null)}
                className="p-1 rounded-md hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition animate-none"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={submitTabRename} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label 
                  className="text-[9px] font-mono font-bold tracking-widest uppercase block"
                  style={{ color: theme.accent }}
                >
                  Filename:
                </label>
                <input
                  type="text"
                  value={renameInputValue}
                  onChange={(e) => setRenameInputValue(e.target.value)}
                  autoFocus
                  style={{ 
                    backgroundColor: theme.isLight ? 'rgb(244 244 245)' : 'rgb(9 9 11)', 
                    borderColor: theme.borderColor,
                    color: theme.textMain 
                  }}
                  className="w-full py-2.5 px-3 border rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
                {renameError && (
                  <div className="text-[10px] text-red-500 font-mono flex items-center space-x-1 mt-1">
                    <AlertTriangle size={10} />
                    <span>{renameError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: theme.borderColor }}>
                <button
                  type="button"
                  onClick={() => setRenameFileId(null)}
                  style={{ color: theme.textMuted }}
                  className="px-3.5 py-1.5 text-[10px] font-mono font-bold hover:opacity-80 uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[10px] font-mono font-bold rounded-lg uppercase transition hover:opacity-90 cursor-pointer"
                  style={{ 
                    backgroundColor: theme.accent, 
                    color: theme.isLight ? '#ffffff' : '#000000' 
                  }}
                >
                  Save Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error inside CodeEditor ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950 text-white font-sans h-full min-h-[400px]">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-sm font-bold font-mono text-rose-500 uppercase tracking-widest">
              Code Editor Recovery Active
            </h2>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              An unexpected rendering exception was intercepted inside the editor view. Your local script files are perfectly safe in cache.
            </p>
            {this.state.error && (
              <pre className="text-[10px] font-mono text-zinc-500 bg-black border border-zinc-900 p-3 rounded-lg overflow-x-auto text-left max-h-40 whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold tracking-wider rounded-xl hover:text-white transition cursor-pointer"
            >
              Attempt Hot-Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function CodeEditor(props: CodeEditorProps) {
  return (
    <ErrorBoundary>
      <CodeEditorInner {...props} />
    </ErrorBoundary>
  );
}
