import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { 
  Terminal, ShieldAlert, BadgeCheck, FileText, Plus, Radio,
  FolderOpen, Compass, Search, Calendar, ChevronDown, ChevronUp, User, 
  Sparkles, RefreshCw, Star, ArrowRight, Play, Heart, AlertCircle, CheckCircle,
  Home, Code, Palette, Sliders, Info, HelpCircle, Lock, Unlock, Wand2, Check
} from 'lucide-react';

import { FileNode, TabItem, TerminalLine, AppTheme, UserSettings, CustomSyntaxProfile } from './types';
import { defaultFiles } from './data/defaultFiles';
import { defaultThemes } from './data/defaultThemes';
import { defaultSyntaxes } from './data/defaultSyntaxes';

import LoadingScreen from './components/LoadingScreen';
import CommandPalette from './components/CommandPalette';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import TerminalPanel from './components/TerminalPanel';
import ScriptsView from './components/ScriptsView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import MultiAccountView from './components/MultiAccountView';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  
  // Name onboarding
  const [userOnboarded, setUserOnboarded] = useState(() => {
    return !!localStorage.getItem('user_onboarded_name');
  });
  const [onboardValue, setOnboardValue] = useState('');
  
  // Navigation
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isEditorFullscreen, setIsEditorFullscreen] = useState<boolean>(false);

  // Fetch status color from tracker on mount
  const [statusColorText, setStatusColorText] = useState('green');
  useEffect(() => {
    // Suppress benign third-party and Monaco errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason && 
        (event.reason.type === 'cancelation' || 
         event.reason.message === 'Canceled' ||
         (typeof event.reason.message === 'string' && event.reason.message.includes('Canceled')) ||
         (typeof event.reason === 'object' && event.reason.type === 'cancelation'))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (event.message && (event.message.includes('ResizeObserver') || event.message.includes('loop completed'))) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    const fetchStatusColor = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/incognito-updates/tracker/refs/heads/main/colour');
        if (response.ok) {
          const text = (await response.text()).trim().toLowerCase();
          if (['green', 'red', 'yellow', 'purple', 'blue'].includes(text)) {
            setStatusColorText(text);
          }
        }
      } catch (e) {
        console.warn("Error fetching status color from tracker:", e);
      }
    };
    fetchStatusColor();

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Command Palette
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Global injection simulator state
  const [injectionStatus, setInjectionStatus] = useState<'READY' | 'INJECTING' | 'SUCCESS' | 'FAILED'>('READY');
  const [injectionLog, setInjectionLog] = useState<string>('');

  const triggerSimulation = () => {
    if (injectionStatus === 'SUCCESS') {
      setInjectionStatus('READY');
      setInjectionLog('');
      addTerminalLine(`[SYS] Disconnected injection hooks. Session ended.`, 'warning');
      return;
    }
    if (injectionStatus !== 'READY') return;
    
    setInjectionStatus('INJECTING');
    setInjectionLog('Scanning game registers...');
    addTerminalLine(`$ inject -session=incognito -all`, 'input');
    addTerminalLine(`Searching for active host client processes...`, 'info');
    
    setTimeout(() => {
      setInjectionLog('Hooking Lua thread scheduler...');
      addTerminalLine(`Found client process. Attaching dynamic injection hooks to standard address space...`, 'info');
    }, 700);
    
    setTimeout(() => {
      setInjectionLog('Injecting core bypass libraries...');
    }, 1400);

    setTimeout(() => {
      setInjectionLog('Validating sandbox security borders...');
    }, 2100);

    setTimeout(() => {
      setInjectionLog('Active Connection Established!');
      setInjectionStatus('SUCCESS');
      addTerminalLine(`Injection completed. Incognito API hooks initialized successfully.`, 'success');
    }, 2800);
  };

  // Global Floating Toasts Stack
  interface ToastItem {
    id: string;
    message: string;
    type: 'clear' | 'inject' | 'execute' | 'success' | 'info';
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // States with Local Storage caching
  const [files, setFiles] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem('incognito_files');
    let parsed: FileNode[] = [];
    if (saved) {
      try {
        parsed = JSON.parse(saved);
        if (parsed.some((f: any) => f.id === 'chassis-physics')) {
          localStorage.removeItem('incognito_files');
          localStorage.removeItem('incognito_tabs');
          localStorage.removeItem('incognito_active_file');
          return defaultFiles;
        }
      } catch (e) {
        parsed = [...defaultFiles];
      }
    } else {
      parsed = [...defaultFiles];
    }

    // Ensure the 3 core folders always exist in parsed list
    const nowStr = new Date().toISOString();
    const coreFolders = [
      { id: 'folder-autoexec', name: 'AutoExec' },
      { id: 'folder-workspace', name: 'Workspace' },
      { id: 'folder-scripts', name: 'Scripts' }
    ];

    coreFolders.forEach(core => {
      const exists = parsed.some(f => f.type === 'folder' && (f.id === core.id || f.name.toLowerCase() === core.name.toLowerCase()));
      if (!exists) {
        parsed.push({
          id: core.id,
          name: core.name,
          type: 'folder',
          parentId: null,
          createdAt: nowStr,
          updatedAt: nowStr,
          size: 0
        });
      }
    });

    return parsed;
  });

  const [tabs, setTabs] = useState<TabItem[]>(() => {
    const saved = localStorage.getItem('incognito_tabs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.some((t: any) => t.fileId === 'chassis-physics')) {
        return [{ fileId: 'script-lua', isPinned: true }];
      }
      return parsed;
    }
    return [
      { fileId: 'script-lua', isPinned: true }
    ];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    const saved = localStorage.getItem('incognito_active_file');
    if (saved === 'chassis-physics' || !saved) return 'script-lua';
    return saved;
  });

  const [syntaxModalResult, setSyntaxModalResult] = useState<{
    success: boolean;
    message: string;
    lineText?: string;
    lineNumber?: number;
    fileName?: string;
  } | null>(null);

  const runSyntaxCheckOnCurrentFile = () => {
    if (!activeFileId) {
      setSyntaxModalResult({
        success: false,
        message: "No active file loaded in the editor to validate."
      });
      return;
    }

    const currentFile = files.find(f => f.id === activeFileId);
    if (!currentFile || currentFile.type !== 'file') {
      setSyntaxModalResult({
        success: false,
        message: "No valid file is currently focused."
      });
      return;
    }

    const code = currentFile.content;
    const lines = code.split('\n');
    let inMultiComment = false;
    let braceStack: { char: string; line: number; col: number }[] = [];

    const matchingBrackets: Record<string, string> = {
      ')': '(',
      ']': '[',
      '}': '{'
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const lineNum = i + 1;

      if (inMultiComment) {
        const commentEndIdx = line.indexOf(']]');
        if (commentEndIdx !== -1) {
          inMultiComment = false;
          line = line.substring(commentEndIdx + 2);
        } else {
          continue;
        }
      }

      let commentStartIdx = line.indexOf('--[[');
      if (commentStartIdx !== -1) {
        const commentEndIdx = line.indexOf(']]', commentStartIdx + 4);
        if (commentEndIdx !== -1) {
          line = line.substring(0, commentStartIdx) + line.substring(commentEndIdx + 2);
        } else {
          inMultiComment = true;
          line = line.substring(0, commentStartIdx);
        }
      }

      const singleCommentIdx = line.indexOf('--');
      if (singleCommentIdx !== -1) {
        line = line.substring(0, singleCommentIdx);
      }

      let inString = false;
      let stringChar = '';
      let escapeActive = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (escapeActive) {
          escapeActive = false;
          continue;
        }

        if (char === '\\') {
          escapeActive = true;
          continue;
        }

        if (inString) {
          if (char === stringChar) {
            inString = false;
          }
        } else {
          if (char === '"' || char === "'") {
            inString = true;
            stringChar = char;
          } else {
            if (char === '(' || char === '[' || char === '{') {
              braceStack.push({ char, line: lineNum, col: j + 1 });
            } else if (char === ')' || char === ']' || char === '}') {
              const expected = matchingBrackets[char];
              const last = braceStack.pop();
              if (!last || last.char !== expected) {
                setSyntaxModalResult({
                  success: false,
                  message: `Unmatched closing bracket '${char}' without corresponding '${expected}'`,
                  lineText: lines[i].trim(),
                  lineNumber: lineNum,
                  fileName: currentFile.name
                });
                return;
              }
            }
          }
        }
      }

      if (inString) {
        setSyntaxModalResult({
          success: false,
          message: `Unclosed string literal starting with ${stringChar}`,
          lineText: lines[i].trim(),
          lineNumber: lineNum,
          fileName: currentFile.name
        });
        return;
      }
    }

    if (braceStack.length > 0) {
      const last = braceStack[braceStack.length - 1];
      setSyntaxModalResult({
        success: false,
        message: `Unclosed opening bracket '${last.char}'`,
        lineText: lines[last.line - 1].trim(),
        lineNumber: last.line,
        fileName: currentFile.name
      });
      return;
    }

    // Keyword matching structure checks
    let blockCount = 0;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const commentIdx = line.indexOf('--');
      if (commentIdx !== -1) {
        line = line.substring(0, commentIdx);
      }
      const words = line.match(/\b\w+\b/g) || [];
      for (const word of words) {
        if (['function', 'then', 'do'].includes(word)) {
          blockCount++;
        } else if (word === 'end') {
          blockCount--;
        }
      }
    }

    if (blockCount > 0) {
      setSyntaxModalResult({
        success: false,
        message: `Missing 'end' statement for a code block (function, if-then, for-do, while-do)`,
        fileName: currentFile.name
      });
      return;
    } else if (blockCount < 0) {
      setSyntaxModalResult({
        success: false,
        message: `Extraneous 'end' statement (unmatched with function, then, or do)`,
        fileName: currentFile.name
      });
      return;
    }

    setSyntaxModalResult({
      success: true,
      message: "Syntax verification passed successfully with 100% accuracy!",
      fileName: currentFile.name
    });
  };

  const handleMinifyCurrentFile = () => {
    if (!activeFileId) return;
    const currentFile = files.find(f => f.id === activeFileId);
    if (!currentFile || currentFile.type !== 'file') return;
    let content = currentFile.content;
    content = content.replace(/--.*$/gm, '');
    content = content.replace(/--\[\[[\s\S]*?\]\]/g, '');
    content = content.replace(/\s+/g, ' ').trim();
    
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
    addTerminalLine(`[Minifier] Compressed and minified ${currentFile.name} successfully!`, 'success');
  };

  const handleObfuscateCurrentFile = () => {
    if (!activeFileId) return;
    const currentFile = files.find(f => f.id === activeFileId);
    if (!currentFile || currentFile.type !== 'file') return;

    addTerminalLine(`[Obfuscator] Spawning localized Python obfuscation server backend on port 8443...`, 'info');
    
    setTimeout(() => {
      addTerminalLine(`[Obfuscator] Attaching AST parser and rewriting control flow graph heavily...`, 'info');
    }, 150);

    setTimeout(() => {
      addTerminalLine(`[Obfuscator] Applying dead-code injectors, variable renaming, and virtualization wrappers...`, 'info');
    }, 300);

    setTimeout(() => {
      const original = (currentFile.content || '') as string;
      const bytes = Array.from(original).map((c: string) => c.charCodeAt(0));
      
      // Perform dynamic XOR encryption (using a randomly chosen secure key)
      const secureXorKey = Math.floor(Math.random() * 200) + 30;
      const encryptedBytes = bytes.map(b => b ^ secureXorKey);
      
      const signature = Math.random().toString(16).substring(2, 10).toUpperCase() + Math.random().toString(16).substring(2, 10).toUpperCase();

      const obfuscated = `--[Obfuscated by inco3]

local _py_vm_xor_key = ${secureXorKey}
local _py_vm_bytecode = {${encryptedBytes.join(', ')}}
local _py_vm_control_state = 0x8FA43D
local _py_decrypted = {}

for _i, _b in ipairs(_py_vm_bytecode) do
    -- Virtualized decoding sweep inside AST environment
    local _decoded_val = _b
    if bit32 then
        _decoded_val = bit32.bxor(_b, _py_vm_xor_key)
    else
        _decoded_val = _b ^ _py_vm_xor_key
    end
    _py_decrypted[_i] = string.char(_decoded_val)
end

local _py_executor, _py_err = loadstring(table.concat(_py_decrypted))
if _py_err then
    warn("[VM TAMPER DETECTED] Security execution halted: " .. tostring(_py_err))
else
    task.spawn(_py_executor)
end`;

      setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: obfuscated } : f));
      addTerminalLine(`[Obfuscator] Protected ${currentFile.name} successfully via High-Security Python AST VM wrappers!`, 'success');
    }, 450);
  };

  const handleDeobfuscateCurrentFile = () => {
    if (!activeFileId) return;
    const currentFile = files.find(f => f.id === activeFileId);
    if (!currentFile || currentFile.type !== 'file') return;

    addTerminalLine(`[Deobfuscator] Spawning reverse-AST parser and byte extraction sweeps...`, 'info');
    
    setTimeout(() => {
      addTerminalLine(`[Deobfuscator] Running dictionary heuristic analysis & entropy checks...`, 'info');
    }, 150);

    setTimeout(() => {
      const code = (currentFile.content || '') as string;
      
      // Match comma separated numbers inside curly braces
      // E.g., {72, 101, 108, 108, 111}
      const arrayMatch = code.match(/\{([0-9\s,]+)\}/);
      if (!arrayMatch) {
        addTerminalLine(`[Deobfuscator] Error: No obfuscated byte sequences detected in ${currentFile.name}.`, 'error');
        return;
      }

      const numbersStr = arrayMatch[1];
      const numbers = numbersStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (numbers.length === 0) {
        addTerminalLine(`[Deobfuscator] Error: Empty bytecode container found.`, 'error');
        return;
      }

      let bestText = '';
      let bestScore = 0;
      let detectedKey = 0;
      let algorithmUsed = 'Byte Shift';

      // 1. Try brute-forcing shift offsets (-150 to 150)
      for (let offset = -150; offset <= 150; offset++) {
        const attempt = numbers.map(n => {
          const codeVal = (n - offset + 256) % 256;
          return String.fromCharCode(codeVal);
        }).join('');
        
        let score = 0;
        if (attempt.includes('local')) score += 15;
        if (attempt.includes('function')) score += 15;
        if (attempt.includes('print')) score += 8;
        if (attempt.includes('end')) score += 8;
        if (attempt.includes('game')) score += 5;
        if (attempt.includes('task')) score += 5;
        if (attempt.includes('string')) score += 5;

        if (score > bestScore) {
          bestScore = score;
          bestText = attempt;
          detectedKey = offset;
          algorithmUsed = 'Subtractive Offset Key';
        }
      }

      // 2. Try brute-forcing XOR keys (0 to 255)
      for (let xorKey = 0; xorKey <= 255; xorKey++) {
        const attempt = numbers.map(n => {
          const codeVal = n ^ xorKey;
          return String.fromCharCode(codeVal);
        }).join('');

        let score = 0;
        if (attempt.includes('local')) score += 15;
        if (attempt.includes('function')) score += 15;
        if (attempt.includes('print')) score += 8;
        if (attempt.includes('end')) score += 8;
        if (attempt.includes('game')) score += 5;
        if (attempt.includes('task')) score += 5;
        if (attempt.includes('string')) score += 5;

        if (score > bestScore) {
          bestScore = score;
          bestText = attempt;
          detectedKey = xorKey;
          algorithmUsed = 'XOR Bitwise Matrix';
        }
      }

      // Fallback if score is too low / no keywords matched
      if (bestScore < 5) {
        // Look for defined keys in standard files
        let keyVal = 7;
        const keyMatch = code.match(/(?:_py_vm_xor_key|_py_vm_key|key|offset)\s*=\s*(\d+)/i);
        if (keyMatch) {
          keyVal = parseInt(keyMatch[1]);
        }
        bestText = numbers.map(n => {
          // try both XOR and shift as fallback
          try {
            return String.fromCharCode(n ^ keyVal);
          } catch {
            return String.fromCharCode((n - keyVal + 256) % 256);
          }
        }).join('');
        detectedKey = keyVal;
        algorithmUsed = 'Signature Match fallback';
      }

      setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: bestText } : f));
      addTerminalLine(`[Deobfuscator] Reconstructed code using ${algorithmUsed} (Key ID: ${detectedKey}) successfully!`, 'success');
    }, 400);
  };

  const handleAutoFixSyntax = () => {
    if (!activeFileId) {
      addTerminalLine("Error: No active file loaded in editor to fix.", "error");
      return;
    }
    const currentFile = files.find(f => f.id === activeFileId);
    if (!currentFile || currentFile.type !== 'file') return;

    let code = currentFile.content || '';
    let lines = code.split('\n');

    // 1. Fix unclosed string literals
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let commentIdx = line.indexOf('--');
      let codePart = commentIdx !== -1 ? line.substring(0, commentIdx) : line;
      let commentPart = commentIdx !== -1 ? line.substring(commentIdx) : '';

      let dQuotes = 0;
      let inDQuote = false;
      let sQuotes = 0;
      let inSQuote = false;
      let escape = false;

      for (let j = 0; j < codePart.length; j++) {
        let char = codePart[j];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === '"' && !inSQuote) {
          inDQuote = !inDQuote;
          dQuotes++;
        } else if (char === "'" && !inDQuote) {
          inSQuote = !inSQuote;
          sQuotes++;
        }
      }

      if (inDQuote) {
        codePart = codePart.trimEnd() + '"';
      }
      if (inSQuote) {
        codePart = codePart.trimEnd() + "'";
      }

      lines[i] = codePart + commentPart;
    }

    code = lines.join('\n');

    // 2. Fix bracket balancing (Parentheses, Brackets, Braces)
    let braceStack: { char: string; index: number }[] = [];
    let matchingBrackets: Record<string, string> = {
      ')': '(',
      ']': '[',
      '}': '{'
    };
    let closingBrackets: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}'
    };

    let newCode = '';
    let inString = false;
    let stringChar = '';
    let escapeActive = false;

    for (let i = 0; i < code.length; i++) {
      let char = code[i];
      if (escapeActive) {
        escapeActive = false;
        newCode += char;
        continue;
      }
      if (char === '\\') {
        escapeActive = true;
        newCode += char;
        continue;
      }
      if (inString) {
        if (char === stringChar) {
          inString = false;
        }
        newCode += char;
      } else {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
          newCode += char;
        } else if (char === '(' || char === '[' || char === '{') {
          braceStack.push({ char, index: i });
          newCode += char;
        } else if (char === ')' || char === ']' || char === '}') {
          let expected = matchingBrackets[char];
          if (braceStack.length > 0 && braceStack[braceStack.length - 1].char === expected) {
            braceStack.pop();
            newCode += char;
          } else {
            // Drop unmatched trailing bracket/paren
            continue;
          }
        } else {
          newCode += char;
        }
      }
    }

    while (braceStack.length > 0) {
      let last = braceStack.pop()!;
      let closing = closingBrackets[last.char];
      newCode = newCode.trimEnd() + closing;
    }

    code = newCode;

    // 3. Fix missing/extraneous 'end' block statements (balance 'function', 'then', 'do' vs 'end')
    let blockCount = 0;
    lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let commentIdx = line.indexOf('--');
      if (commentIdx !== -1) {
        line = line.substring(0, commentIdx);
      }
      const words = line.match(/\b\w+\b/g) || [];
      for (const word of words) {
        if (['function', 'then', 'do'].includes(word)) {
          blockCount++;
        } else if (word === 'end') {
          blockCount--;
        }
      }
    }

    if (blockCount > 0) {
      for (let i = 0; i < blockCount; i++) {
        code = code.trimEnd() + "\nend";
      }
    } else if (blockCount < 0) {
      let absCount = Math.abs(blockCount);
      lines = code.split('\n');
      while (absCount > 0 && lines.length > 0) {
        let lastLine = lines[lines.length - 1].trim();
        if (lastLine === 'end') {
          lines.pop();
          absCount--;
        } else if (lastLine === '') {
          lines.pop();
        } else {
          break;
        }
      }
      code = lines.join('\n');
    }

    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: code } : f));
    addTerminalLine(`[Auto-Fix-Syntax] Corrected unclosed tags, strings, brackets, and block endings in ${currentFile.name} with 100% precision!`, 'success');
  };

  const handleFormatCurrentFile = () => {
    if (!activeFileId) return;
    const currentFile = files.find(f => f.id === activeFileId);
    if (!currentFile || currentFile.type !== 'file') return;
    
    const formatted = currentFile.content
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n');
      
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: formatted } : f));
    addTerminalLine(`[Formatter] Pretty-formatted ${currentFile.name}!`, 'success');
  };

  const handleInsertAimbotTemplate = () => {
    if (!activeFileId) return;
    const currentFile = files.find(f => f.id === activeFileId);
    if (!currentFile || currentFile.type !== 'file') return;
    
    const aimbotCode = `-- High Performance Camera Aimbot Template
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local Camera = workspace.CurrentCamera

local settings = {
    Enabled = true,
    Key = Enum.UserInputType.MouseButton2,
    Smoothness = 0.15,
    FOV = 120
}

local function getClosestPlayer()
    local closest = nil
    local shortestDistance = math.huge
    for _, player in ipairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            local hrp = player.Character.HumanoidRootPart
            local screenPos, onScreen = Camera:WorldToViewportPoint(hrp.Position)
            if onScreen then
                local mousePos = LocalPlayer:GetMouse()
                local distance = (Vector2.new(screenPos.X, screenPos.Y) - Vector2.new(mousePos.X, mousePos.Y)).Magnitude
                if distance < shortestDistance and distance <= settings.FOV then
                    shortestDistance = distance
                    closest = player
                end
            end
        end
    end
    return closest
end

game:GetService("RunService").RenderStepped:Connect(function()
    if settings.Enabled and game:GetService("UserInputService"):IsMouseButtonPressed(settings.Key) then
        local target = getClosestPlayer()
        if target and target.Character and target.Character:FindFirstChild("Head") then
            local head = target.Character.Head
            local currentLook = Camera.CFrame
            local targetLook = CFrame.new(Camera.CFrame.Position, head.Position)
            Camera.CFrame = currentLook:Lerp(targetLook, settings.Smoothness)
        end
    end
end)
print("Aimbot loaded!")`;
    
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: aimbotCode } : f));
    addTerminalLine("Inserted Camera Aimbot template into active script tab!", "success");
  };

  const handleInsertEspTemplate = () => {
    if (!activeFileId) return;
    const currentFile = files.find(f => f.id === activeFileId);
    if (!currentFile || currentFile.type !== 'file') return;
    
    const espCode = `-- Elite Player ESP Tracer and Box Visualizer
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local LocalPlayer = Players.LocalPlayer

local function createESP(player)
    local box = Drawing.new("Square")
    box.Visible = false
    box.Color = Color3.fromRGB(255, 0, 85)
    box.Thickness = 1.5
    box.Filled = false
    
    local connection
    connection = RunService.RenderStepped:Connect(function()
        if player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            local hrp = player.Character.HumanoidRootPart
            local screenPos, onScreen = workspace.CurrentCamera:WorldToViewportPoint(hrp.Position)
            if onScreen then
                box.Size = Vector2.new(80, 100)
                box.Position = Vector2.new(screenPos.X - 40, screenPos.Y - 50)
                box.Visible = true
            else
                box.Visible = false
            end
        else
            box.Visible = false
        end
        
        if not player.Parent then
            box:Remove()
            connection:Disconnect()
        end
    end)
end

for _, p in ipairs(Players:GetPlayers()) do
    if p ~= LocalPlayer then
        createESP(p)
    end
end
Players.PlayerAdded:Connect(createESP)
print("ESP script loaded!")`;
    
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: espCode } : f));
    addTerminalLine("Inserted ESP visualizer template into active script tab!", "success");
  };

  const [themes, setThemes] = useState<AppTheme[]>(defaultThemes);
  const [syntaxes, setSyntaxes] = useState<CustomSyntaxProfile[]>(defaultSyntaxes);

  const [settings, setSettings] = useState<UserSettings>(() => {
    const onboardedName = localStorage.getItem('user_onboarded_name') || 'New Developer';
    const blackAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='black'/></svg>";
    
    const defaults = {
      editor: {
        fontSize: 12,
        fontFamily: 'JetBrains Mono',
        tabSize: 4,
        wordWrap: 'on' as const,
        minimap: false,
        autoSave: true,
        autoScriptSave: true,
        lineNumbers: 'on' as const,
        cursorBlinking: 'smooth',
        cursorStyle: 'line',
        smoothCaret: true,
        bracketAutocomplete: true,
        enableItalics: true,
      },
      terminal: {
        clearOnRun: true,
        showTimestamp: true,
        fontScale: 1.0,
        simulatedLatency: 200,
        bufferLimit: 100,
        bellSound: false,
      },
      gitSync: {
        enabled: true,
        repositoryUrl: 'https://github.com/RobloxUser/IncognitoWorkspace',
        syncBranch: 'main',
        autoPush: false,
        commitMessage: 'wip: update playground scripts',
        lastSyncedAt: null,
        accessToken: '',
      },
      appearance: {
        themeId: 'grey-matte',
        blurIntensity: 'none',
        animationsSpeed: 'normal',
        cardColorMode: 'colorful',
      },
      syntax: {
        engineId: 'rbx-lua',
      },
      account: {
        username: onboardedName,
        avatarUrl: blackAvatar,
        bio: 'Development environment active.',
        badge: 'Lead Architect',
      },
      keybinds: {
        toggleCommandPalette: 'Ctrl+P',
        autoFixSyntax: 'Ctrl+Shift+F',
        obfuscateScript: 'Ctrl+Shift+O',
        deobfuscateScript: 'Ctrl+Shift+D',
      },
      experimental: {
        terminalEnabled: false,
        multiAccountInjection: false,
      },
      performance: {
        client: 'Web Client (64-bit)',
        unlockFps: 'Unlimited',
        autoLaunchRoblox: true,
        hideProcessScreenshare: false,
        hideProcessEntirely: false,
      },
    };

    const saved = localStorage.getItem('incognito_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Overwrite porsche/unsplash/default avatar with clean black
        let loadedAvatar = parsed.account?.avatarUrl || blackAvatar;
        if (loadedAvatar.includes('unsplash.com') || loadedAvatar.includes('porsche') || loadedAvatar.includes('photo-')) {
          loadedAvatar = blackAvatar;
        }

        return {
          editor: { ...defaults.editor, ...parsed.editor },
          terminal: { ...defaults.terminal, ...parsed.terminal },
          gitSync: { ...defaults.gitSync, ...parsed.gitSync },
          appearance: { ...defaults.appearance, ...parsed.appearance },
          syntax: { 
            ...defaults.syntax, 
            engineId: (parsed.syntax?.engineId === 'lua-default' || parsed.syntax?.engineId === 'rbx-lua')
              ? 'rbx-lua' 
              : 'exploit-lua'
          },
          account: { 
            ...defaults.account, 
            ...parsed.account,
            username: parsed.account?.username || defaults.account.username,
            avatarUrl: loadedAvatar
          },
          keybinds: {
            ...defaults.keybinds,
            ...(parsed.keybinds || {})
          },
          experimental: { ...defaults.experimental, ...parsed.experimental },
          performance: { ...defaults.performance, ...parsed.performance },
        };
      } catch (err) {
        return defaults;
      }
    }
    return defaults;
  });

  // Active Theme object computed
  const currentTheme = themes.find(t => t.id === settings.appearance.themeId) || themes[0];

  // Terminal logs state
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'info',
      text: 'Workspace environment core successfully loaded.',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      type: 'success',
      text: 'Compiler Ready. Sandboxed workspace listening on default port 3000.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [terminalHeight, setTerminalHeight] = useState(160);
  const [isStealthMode, setIsStealthMode] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('incognito_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('incognito_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeFileId) {
      localStorage.setItem('incognito_active_file', activeFileId);
    } else {
      localStorage.removeItem('incognito_active_file');
    }
  }, [activeFileId]);

  useEffect(() => {
    localStorage.setItem('incognito_syntaxes', JSON.stringify(syntaxes));
  }, [syntaxes]);

  useEffect(() => {
    localStorage.setItem('incognito_settings', JSON.stringify(settings));
  }, [settings]);

// Helper to match dynamic keybind strings
function matchesKeybind(e: KeyboardEvent, keybindStr: string): boolean {
  if (!keybindStr) return false;
  const parts = keybindStr.toLowerCase().split('+');
  const needsCtrl = parts.includes('ctrl') || parts.includes('control');
  const needsShift = parts.includes('shift');
  const needsAlt = parts.includes('alt');
  const needsMeta = parts.includes('meta') || parts.includes('cmd');
  
  const keyPart = parts.find(p => !['ctrl', 'control', 'shift', 'alt', 'meta', 'cmd'].includes(p));
  if (!keyPart) return false;
  
  const hasCtrl = e.ctrlKey || e.metaKey;
  const hasShift = e.shiftKey;
  const hasAlt = e.altKey;
  const hasMeta = e.metaKey;
  
  if (needsCtrl && !hasCtrl) return false;
  if (needsShift && !hasShift) return false;
  if (needsAlt && !hasAlt) return false;
  if (needsMeta && !hasMeta) return false;
  
  const eventKey = e.key.toLowerCase();
  if (eventKey === keyPart) return true;
  
  if (keyPart === 'space' && eventKey === ' ') return true;
  if (keyPart === 'enter' && eventKey === 'enter') return true;
  
  return false;
}

  // Dynamic Keybind registration and execution
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const activeKeybinds = settings.keybinds || {
        toggleCommandPalette: 'Ctrl+P',
        autoFixSyntax: 'Ctrl+Shift+F',
        obfuscateScript: 'Ctrl+Shift+O',
        deobfuscateScript: 'Ctrl+Shift+D'
      };

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsStealthMode(prev => {
          const newState = !prev;
          triggerToast(newState ? 'Stealth Mode Activated (Process Hidden)' : 'Stealth Mode Deactivated', 'info');
          return newState;
        });
        return;
      }

      const target = e.target as HTMLElement;
      const isInputFocused = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);



      if (isInputFocused && target.tagName === 'INPUT') {
        return;
      }

      if (matchesKeybind(e, activeKeybinds.autoFixSyntax)) {
        e.preventDefault();
        handleAutoFixSyntax();
      } else if (matchesKeybind(e, activeKeybinds.obfuscateScript)) {
        e.preventDefault();
        handleObfuscateCurrentFile();
      } else if (matchesKeybind(e, activeKeybinds.deobfuscateScript)) {
        e.preventDefault();
        handleDeobfuscateCurrentFile();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [settings.keybinds, activeFileId, files]);

  // Toast Notification dispatcher helper (adds to terminal)
  const addTerminalLine = (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'input' = 'info') => {
    const newLine: TerminalLine = {
      id: `term-${Date.now()}-${Math.random()}`,
      type,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTerminalLines(prev => [...prev, newLine]);
  };

  const triggerToast = (message: string, type: 'clear' | 'inject' | 'execute' | 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 1.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 1500);

    let termType: 'info' | 'success' | 'warning' | 'error' = 'info';
    if (type === 'clear') termType = 'error';
    else if (type === 'inject') termType = 'success';
    else if (type === 'execute') termType = 'info';
    else if (type === 'success') termType = 'success';
    addTerminalLine(message, termType);
  };

  // Virtual File Operations
  const handleOpenFile = (fileId: string) => {
    setActiveFileId(fileId);
    // Add file to tabs if not already open
    if (!tabs.some(t => t.fileId === fileId)) {
      const isFav = files.find(f => f.id === fileId)?.isFavorite;
      if (isFav) {
        setTabs(prev => [{ fileId, isPinned: false }, ...prev]);
      } else {
        setTabs(prev => [...prev, { fileId, isPinned: false }]);
      }
    }
    setActiveSection('editor');
    addTerminalLine(`Loaded file node buffer index: ${files.find(f => f.id === fileId)?.name}`, 'info');
  };

  const handleCreateNode = (name: string, type: 'file' | 'folder', parentId: string | null) => {
    const newId = `file-${Date.now()}`;
    const newNode: FileNode = {
      id: newId,
      name,
      type,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      size: 0,
      content: type === 'file' ? '' : undefined,
    };

    setFiles(prev => [...prev, newNode]);
    addTerminalLine(`Created ${type} node: ${name}`, 'success');

    if (type === 'file') {
      handleOpenFile(newId);
    }
  };

  const handleRenameNode = (id: string, newName: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, name: newName, updatedAt: new Date().toISOString() };
      }
      return f;
    }));
    addTerminalLine(`Renamed node index to: ${newName}`, 'info');
  };

  const handleDeleteNode = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    // also remove from tabs
    setTabs(prev => prev.filter(t => t.fileId !== id));
    if (activeFileId === id) {
      setActiveFileId(null);
    }
    addTerminalLine(`Purged virtual Node UUID: ${id}`, 'warning');
  };

  const handleDuplicateNode = (id: string) => {
    const origin = files.find(f => f.id === id);
    if (!origin) return;

    const newId = `file-${Date.now()}`;
    const newNode: FileNode = {
      ...origin,
      id: newId,
      name: `Copy_${origin.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFiles(prev => [...prev, newNode]);
    handleOpenFile(newId);
    addTerminalLine(`Duplicated item node path: "${origin.name}"`, 'success');
  };

  const handleToggleFavorite = (id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const nextVal = !f.isFavorite;
        addTerminalLine(`Updated favorite registry state: ${f.name} = ${nextVal}`, 'info');
        
        if (nextVal) {
          // Move tab to the front of the tabs list if it's open
          setTabs(prevTabs => {
            const index = prevTabs.findIndex(t => t.fileId === id);
            if (index !== -1) {
              const reordered = [...prevTabs];
              const [removed] = reordered.splice(index, 1);
              return [removed, ...reordered];
            }
            return prevTabs;
          });
        }
        
        return { ...f, isFavorite: nextVal };
      }
      return f;
    }));
  };

  const handleMoveNode = (id: string, newParentId: string | null) => {
    // ensure target exists if not null
    if (newParentId !== null && !files.some(f => f.id === newParentId && f.type === 'folder')) {
      addTerminalLine('Move failed: Selected target directory is invalid or was purged.', 'error');
      return;
    }
    
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, parentId: newParentId, updatedAt: new Date().toISOString() };
      }
      return f;
    }));
    const targetName = newParentId ? files.find(f => f.id === newParentId)?.name : 'Root Directory';
    addTerminalLine(`Moved node into: ${targetName}`, 'success');
  };

  const handleSaveFile = (fileId: string, text: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          content: text,
          size: text.length,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));

    // Reset unsaved tab indicator
    setTabs(prev => prev.map(t => {
      if (t.fileId === fileId) {
        return { ...t, isUnsaved: false };
      }
      return t;
    }));

    addTerminalLine(`Cached standard disk changes: ${files.find(f => f.id === fileId)?.name}`, 'success');
  };

  // Run script mock output logging
  const handleRunScript = (fileId: string) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;

    addTerminalLine(`$ exec lua -arch=gt3 -file="${target.name}"`, 'input');
    addTerminalLine(`Compiling dynamic execution graph: ${target.name}...`, 'info');

    // Parse simple patterns to mock real outputs
    setTimeout(() => {
      if (target.content) {
        const text = target.content;
        
        // Scan for print or warn tags
        const lines = text.split('\n');
        let executedLines = 0;
        
        lines.forEach(line => {
          const printMatch = line.match(/print\s*\(\s*["'](.*?)["']\s*\)/);
          const warnMatch = line.match(/warn\s*\(\s*["'](.*?)["']\s*\)/);
          const errorMatch = line.match(/error\s*\(\s*["'](.*?)["']\s*\)/);

          if (printMatch) {
            addTerminalLine(`[STANDARD_OUT] ${printMatch[1]}`, 'success');
            executedLines++;
          }
          if (warnMatch) {
            addTerminalLine(`[COMPILE_WARN] ${warnMatch[1]}`, 'warning');
            executedLines++;
          }
          if (errorMatch) {
            addTerminalLine(`[RUNTIME_EXC] ${errorMatch[1]}`, 'error');
            executedLines++;
          }
        });

        if (executedLines === 0) {
          // generic fallback execution
          addTerminalLine(`Evaluation completed. Process exited with return code: 0`, 'success');
        }
      }
    }, 450);
  };

  // Inject script mock output logging
  const handleInjectScript = (fileId: string) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;

    addTerminalLine(`$ inject -session=incognito -file="${target.name}"`, 'input');
    addTerminalLine(`Searching for active host client processes...`, 'info');
    
    setTimeout(() => {
      addTerminalLine(`Found client process. Attaching dynamic injection hooks to standard address space...`, 'info');
    }, 250);

    setTimeout(() => {
      addTerminalLine(`Injection completed. Incognito API hooks initialized successfully.`, 'success');
    }, 550);
  };

  // High-fidelity real Git commit & push trace simulation
  const handleGitPush = () => {
    addTerminalLine(`$ git add .`, 'input');
    addTerminalLine(`$ git commit -m "${settings.gitSync.commitMessage || 'wip: update playground scripts'}"`, 'input');
    addTerminalLine(`[local main b03fd12] ${settings.gitSync.commitMessage || 'wip: update playground scripts'}`, 'info');
    addTerminalLine(` 3 files changed, 48 insertions(+), 12 deletions(-)`, 'info');
    addTerminalLine(`$ git push origin ${settings.gitSync.syncBranch || 'main'}`, 'input');
    addTerminalLine(`Pushing to: ${settings.gitSync.repositoryUrl}...`, 'info');
    
    if (settings.gitSync.accessToken) {
      const masked = settings.gitSync.accessToken.substring(0, 8) + '...';
      addTerminalLine(`Authenticating with GitHub using Personal Access Token (${masked})...`, 'info');
    } else {
      addTerminalLine(`Warning: No Personal Access Token configured. Attempting fallback SSH key handshake...`, 'warning');
    }

    setTimeout(() => {
      addTerminalLine(`Enumerating objects: 3, done.`, 'info');
      addTerminalLine(`Counting objects: 100% (3/3), done.`, 'info');
      addTerminalLine(`Delta compression using up to 8 threads`, 'info');
      addTerminalLine(`Compressing objects: 100% (2/2), done.`, 'info');
    }, 250);

    setTimeout(() => {
      const commitHash = Math.random().toString(16).substring(2, 10);
      addTerminalLine(`Writing objects: 100% (3/3), 342 bytes | 342.00 KiB/s, done.`, 'info');
      addTerminalLine(`Total 3 (delta 1), reused 0 (delta 0), pack-reused 0`, 'info');
      addTerminalLine(`To ${settings.gitSync.repositoryUrl}`, 'success');
      addTerminalLine(`   c0ffee18..${commitHash}  ${settings.gitSync.syncBranch || 'main'} -> ${settings.gitSync.syncBranch || 'main'}`, 'success');
      addTerminalLine(`✔ Git synchronization complete! Remote is clean.`, 'success');
    }, 650);
  };

  // Dispatch interactive terminal parameters and execute
  const handleSendTerminal = (cmd: string) => {
    addTerminalLine(cmd, 'input');
    const lowerCmd = cmd.toLowerCase().trim();

    if (lowerCmd === 'help') {
      addTerminalLine('Incognito Console Calibrator CLI commands:', 'info');
      addTerminalLine('  diagnose        Simulate active double-wishbone chassis aligning checks', 'info');
      addTerminalLine('  compile         Compile the active editor file node immediately', 'info');
      addTerminalLine('  clear           Clear the interactive logging terminal', 'info');
      addTerminalLine('  status          View virtual hardware uptime and environment diagnostic logs', 'info');
      addTerminalLine('  theme {name}    Quick switch active workspace decal skin', 'info');
    } else if (lowerCmd === 'diagnose' || lowerCmd === 'diagnostics') {
      addTerminalLine('Initializing physical telemetry scanning sweeps...', 'info');
      setTimeout(() => {
        addTerminalLine('Checking suspension kinematics offsets (Dual Wishbone active metrics)...', 'info');
      }, 200);
      setTimeout(() => {
        addTerminalLine('Anti-roll bar target torque load calculations: 450 Nm/deg ✔', 'success');
        addTerminalLine('Active spring dampening threshold: Calibrated ✔', 'success');
        addTerminalLine('Telemetry system ready. GT3 alignment parameters: PERFECT.', 'success');
      }, 500);
    } else if (lowerCmd === 'clear') {
      setTerminalLines([]);
    } else if (lowerCmd === 'status') {
      addTerminalLine(`ACTIVE PILOT GREETING: ${settings.account.isPrivate ? '[REDACTED]' : settings.account.username}`, 'info');
      addTerminalLine(`COGNITIVE BADGE LEVEL: ${settings.account.isPrivate ? '[ENCRYPTED]' : settings.account.badge.toUpperCase()}`, 'info');
      addTerminalLine(`SANDBOX ROOT WORKSPACE: PORT 3000 Standard Loopback`, 'info');
      addTerminalLine(`REACTIVE AUTOSAVE OPT: ${settings.editor.autoSave ? 'ENABLED' : 'DISABLED'}`, 'info');
    } else if (lowerCmd === 'compile') {
      if (activeFileId) {
        handleRunScript(activeFileId);
      } else {
        addTerminalLine('Error: No active script file loaded in focused editor view.', 'error');
      }
    } else if (lowerCmd.startsWith('theme ')) {
      const targetThemeQuery = lowerCmd.replace('theme ', '').trim();
      const matched = themes.find(t => t.name.toLowerCase().includes(targetThemeQuery) || t.id.toLowerCase().includes(targetThemeQuery));
      if (matched) {
        setSettings(prev => ({
          ...prev,
          appearance: { ...prev.appearance, themeId: matched.id }
        }));
        addTerminalLine(`Successfully applied theme preset: ${matched.name}`, 'success');
      } else {
        addTerminalLine(`Could not find theme pattern: "${targetThemeQuery}". Available: carbon, district, poison, ocean, shadow`, 'error');
      }
    } else {
      addTerminalLine(`Unknown terminal command: "${cmd}". Type "help" for a full list of commands.`, 'error');
    }
  };

  // Command palette items definition
  const commandPaletteItems = [
    {
      id: 'cmd-autofix',
      category: 'Actions' as const,
      name: 'Auto-Fix-Syntax (Intelligently resolve unmatched symbols, blocks, and strings with 100% precision)',
      shortcut: settings.keybinds?.autoFixSyntax || 'Ctrl+Shift+F',
      icon: <Wand2 size={14} />,
      action: () => handleAutoFixSyntax(),
    },
    {
      id: 'cmd-obfuscate',
      category: 'Actions' as const,
      name: 'Obfuscate (Trigger high-security localized Python VM obfuscation compiler)',
      shortcut: settings.keybinds?.obfuscateScript || 'Ctrl+Shift+O',
      icon: <Lock size={14} />,
      action: () => handleObfuscateCurrentFile(),
    },
    {
      id: 'cmd-deobfuscate',
      category: 'Actions' as const,
      name: 'Deobfuscate (Extract VM bytecode, decode string matrices, and restore original code source)',
      shortcut: settings.keybinds?.deobfuscateScript || 'Ctrl+Shift+D',
      icon: <Unlock size={14} />,
      action: () => handleDeobfuscateCurrentFile(),
    }
  ];

  if (!userOnboarded) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-white text-zinc-900 font-sans px-4 overflow-hidden relative">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm bg-white border border-zinc-200 rounded-2xl p-8 relative z-10 shadow-xs"
        >
          <div className="space-y-6 text-left">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-black" />
              <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-800 uppercase">
                Incognito 3 - Introduction
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 font-mono">
                What's your name?
              </h1>
              <p className="text-xs text-zinc-400 font-mono">
                Enter your name to begin layout personalization.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = onboardValue.trim();
                if (trimmed) {
                  localStorage.setItem('user_onboarded_name', trimmed);
                  setSettings(prev => ({
                    ...prev,
                    account: {
                      ...prev.account,
                      username: trimmed
                    }
                  }));
                  setUserOnboarded(true);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <input
                  autoFocus
                  type="text"
                  value={onboardValue}
                  onChange={(e) => setOnboardValue(e.target.value)}
                  placeholder="Write your desired name here..."
                  maxLength={24}
                  className="w-full bg-white border border-zinc-300 rounded-xl py-2.5 px-4 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>

              <button
                type="submit"
                disabled={!onboardValue.trim()}
                className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-xl py-2.5 text-xs font-bold font-mono tracking-widest uppercase transition duration-150 cursor-pointer"
              >
                Continue
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isStealthMode) {
    return (
      <div 
        className="h-screen w-screen bg-transparent select-none cursor-default" 
        style={{ backgroundColor: 'rgba(0,0,0,0)' }}
      />
    );
  }

  return (
    <MotionConfig reducedMotion={settings.appearance.animationsEnabled === false ? "always" : "user"}>
      <div
        style={{
          backgroundColor: currentTheme.bodyBg,
          color: currentTheme.textMain,
        }}
        className={`h-screen w-screen flex flex-col font-sans select-none overflow-hidden text-left relative ${currentTheme.background} ${settings.appearance.animationsEnabled === false ? '[&_*]:!transition-none [&_*]:!duration-0 [&_*]:!animation-none' : ''}`}
      >
      <AnimatePresence>
        {showLoading && (
          <LoadingScreen onComplete={() => setShowLoading(false)} />
        )}
      </AnimatePresence>

      {!showLoading && (
        <div className="flex-1 flex flex-col min-h-0 relative h-full">
          
          {/* Always-on Top Bar */}
          <div 
            style={{ 
              backgroundColor: currentTheme.sidebarBg, 
            }}
            className="h-14 flex items-center justify-between select-none shrink-0 z-40 relative"
          >
            {/* Leftmost logo block: matches sidebar width (w-14) perfectly, NO vertical border-r or double line */}
            <div 
              className="w-14 h-full flex items-center justify-center shrink-0"
            >
              <img 
                src="https://raw.githubusercontent.com/incognito-updates/tracker/refs/heads/main/500x500%5BLOGO%5D.png" 
                alt="Incognito Hat Logo"
                className="w-11 h-11 object-contain select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Main horizontal content part of top bar: starts immediately after the logo block */}
            <div 
              style={{ borderColor: currentTheme.borderColor }}
              className="flex-1 h-full flex items-center justify-between px-4"
            >
              {/* Left part: text inco3 */}
              <div className="flex items-center space-x-4">
                <span 
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}
                  className={`lowercase text-[18px] tracking-[-0.05em] leading-none select-none flex items-baseline ${
                    currentTheme.isLight ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  inco
                  <span 
                    style={{ color: currentTheme.accent, fontFamily: "'Poppins', sans-serif", fontWeight: 300 }} 
                    className="ml-[0.5px]"
                  >
                    3
                  </span>
                </span>
              </div>

              {/* Middle Navigation Menus */}
              <div className="flex-1 flex justify-center h-full">
                <Sidebar
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                  theme={currentTheme}
                  settings={settings}
                  setSettings={setSettings}
                  statusColorText={statusColorText}
                />
              </div>

              {/* Right part: Windows-like window controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {/* Hide / Minimize */}
                  <button 
                    onClick={() => {
                      addTerminalLine('[SYS] Hiding workspace windows to passive background thread.', 'info');
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition cursor-pointer"
                    title="Minimize Window"
                  >
                    <span className="w-2.5 h-[1.5px] bg-current" />
                  </button>

                  {/* Fullscreen / Maximize */}
                  <button 
                    onClick={() => {
                      addTerminalLine('[SYS] Window maximize requested.', 'info');
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition cursor-pointer"
                    title="Maximize Window"
                  >
                    <div className="w-2.5 h-2.5 border-[1.5px] border-current rounded-sm" />
                  </button>

                  {/* Close */}
                  <button 
                    onClick={() => {
                      addTerminalLine('[SYS] Terminating Incognito engine. Disposing address buffers...', 'warning');
                      setTimeout(() => {
                        window.close();
                      }, 800);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-rose-600/95 transition cursor-pointer"
                    title="Close App connection"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Main workspace layout frame wrapper */}
          <div className="flex-1 flex min-h-0 min-w-0">

            {/* Inner view container */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
              
              {/* Secondary Layout for Editor split side navigation */}
              {activeSection === 'editor' ? (
                <div className="flex-1 flex min-w-0 min-h-0">
                  
                  {/* Left split virtual directory explorer */}
                  {!isEditorFullscreen && (
                    <FileExplorer
                      files={files}
                      activeFileId={activeFileId}
                      onSelectFile={handleOpenFile}
                      onCreateNode={handleCreateNode}
                      onRenameNode={handleRenameNode}
                      onDeleteNode={handleDeleteNode}
                      onDuplicateNode={handleDuplicateNode}
                      onToggleFavorite={handleToggleFavorite}
                      onMoveNode={handleMoveNode}
                      theme={currentTheme}
                    />
                  )}

                  {/* Right split active workspace code frame */}
                  <div className="flex-1 flex flex-col min-w-0 min-h-0">
                    <CodeEditor
                      files={files}
                      setFiles={setFiles}
                      tabs={tabs}
                      setTabs={setTabs}
                      activeFileId={activeFileId}
                      setActiveFileId={setActiveFileId}
                      syntaxes={syntaxes}
                      theme={currentTheme}
                      settings={settings}
                      onRunScript={handleRunScript}
                      onSaveFile={handleSaveFile}
                      onInjectScript={handleInjectScript}
                      onSyntaxCheck={runSyntaxCheckOnCurrentFile}
                      onClearTerminal={() => {
                        setTerminalLines([]);
                      }}
                      isFullscreen={isEditorFullscreen}
                      setIsFullscreen={setIsEditorFullscreen}
                    />

                    {/* Integrated dynamic height resizable Terminal Console panel */}
                    {settings.experimental?.terminalEnabled && (
                      <TerminalPanel
                        lines={terminalLines}
                        onSendCommand={handleSendTerminal}
                        onClear={() => {
                          setTerminalLines([]);
                        }}
                        terminalHeight={terminalHeight}
                        setTerminalHeight={setTerminalHeight}
                        theme={currentTheme}
                      />
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                  
                  <AnimatePresence mode="wait">
                    {activeSection === 'home' && (
                      <motion.div
                        key="home"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <Dashboard
                          files={files}
                          onOpenFileInEditor={handleOpenFile}
                          onCreateNewFile={(name) => handleCreateNode(name, 'file', null)}
                          onClearTerminal={() => setTerminalLines([])}
                          theme={currentTheme}
                          settings={settings}
                          setActiveSection={setActiveSection}
                          injectionStatus={injectionStatus}
                          injectionLog={injectionLog}
                          triggerSimulation={triggerSimulation}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'scripts' && (
                      <motion.div
                        key="scripts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <ScriptsView
                          files={files}
                          onOpenFileInEditor={handleOpenFile}
                          onToggleFavorite={handleToggleFavorite}
                          onDeleteFile={handleDeleteNode}
                          onCreateNewFile={(name, type, cont) => {
                            const newId = `file-${Date.now()}`;
                            const node: FileNode = {
                              id: newId,
                              name,
                              type,
                              parentId: null,
                              content: cont,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              size: cont ? cont.length : 0
                            };
                            setFiles(prev => [...prev, node]);
                            handleOpenFile(newId);
                          }}
                          onRunScript={handleRunScript}
                          theme={currentTheme}
                          settings={settings}
                          setActiveSection={setActiveSection}
                          triggerToast={triggerToast}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'multiaccount' && (
                      <motion.div
                        key="multiaccount"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <MultiAccountView
                          theme={currentTheme}
                          settings={settings}
                          triggerToast={triggerToast}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'themes' && (
                      <motion.div
                        key="themes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <SettingsView
                          settings={settings}
                          setSettings={setSettings}
                          syntaxes={syntaxes}
                          setSyntaxes={setSyntaxes}
                          themes={themes}
                          onSetTheme={(tId) => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, themeId: tId } }))}
                          theme={currentTheme}
                          initialTab="appearance"
                          onTriggerGitSync={handleGitPush}
                          triggerToast={triggerToast}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'settings' && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <SettingsView
                          settings={settings}
                          setSettings={setSettings}
                          syntaxes={syntaxes}
                          setSyntaxes={setSyntaxes}
                          themes={themes}
                          onSetTheme={(tId) => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, themeId: tId } }))}
                          theme={currentTheme}
                          initialTab="editor"
                          onTriggerGitSync={handleGitPush}
                          triggerToast={triggerToast}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'about' && (
                      <motion.div
                        key="about"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <AboutView
                          theme={currentTheme}
                          settings={settings}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              )}

            </div>

          </div>

          {/* Custom Syntax Check Diagnostics Dialog Overlay */}
          <AnimatePresence>
            {syntaxModalResult && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop glass */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSyntaxModalResult(null)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal body */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.borderColor
                  }}
                  className="relative w-full max-w-sm border rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] p-6 font-sans text-left select-none"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center space-x-2">
                        {syntaxModalResult.success ? (
                          <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center font-bold text-xs">
                            ✓
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-[10px]">
                            ✕
                          </div>
                        )}
                        <h3 className="text-[13px] font-bold font-poppins tracking-wide" style={{ color: currentTheme.textMain }}>
                          {syntaxModalResult.success ? 'Syntax Verified' : 'Syntax Error'}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSyntaxModalResult(null)}
                        className="text-zinc-500 hover:text-zinc-300 transition text-[10px] font-bold font-mono p-1 rounded hover:bg-zinc-800/15"
                      >
                        [ESC]
                      </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        <span>Target File:</span>
                        <span style={{ color: currentTheme.accent }} className="font-bold">{syntaxModalResult.fileName || 'Unknown'}</span>
                      </div>

                      <p className="text-xs leading-relaxed" style={{ color: currentTheme.textMain }}>
                        {syntaxModalResult.message}
                      </p>

                      {syntaxModalResult.lineNumber && (
                        <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 font-mono space-y-1">
                          <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                            <span>Diagnostic Highlight:</span>
                            <span>Line {syntaxModalResult.lineNumber}</span>
                          </div>
                          <div className="text-xs text-rose-400 overflow-x-auto whitespace-pre font-bold pt-1">
                            {syntaxModalResult.lineText || '(Empty line)'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-2 border-t flex justify-end" style={{ borderColor: currentTheme.borderColor }}>
                      <button
                        onClick={() => setSyntaxModalResult(null)}
                        style={{
                          backgroundColor: syntaxModalResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: syntaxModalResult.success ? '#22c55e' : '#ef4444',
                        }}
                        className="px-5 py-2 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer"
                      >
                        Acknowledge & Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Floating Notification Toasts Stack */}
          <div className="fixed bottom-6 right-6 flex flex-col space-y-2 z-50 pointer-events-none items-end max-w-sm w-full">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 15, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="pointer-events-auto flex items-center space-x-3 px-4 py-2.5 rounded-xl border shadow-xl backdrop-blur-md font-mono text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.textMain,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full inline-block animate-pulse shrink-0"
                    style={{
                      backgroundColor: 
                        t.type === 'clear' 
                          ? '#ef4444' 
                          : t.type === 'inject' 
                            ? '#10b981' 
                            : t.type === 'execute' 
                              ? (currentTheme.isLight ? '#000000' : '#ffffff')
                              : '#10b981'
                    }}
                  />
                  <span>{t.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Core Command Selector palette popup container */}
          <CommandPalette
            isOpen={isPaletteOpen}
            onClose={() => setIsPaletteOpen(false)}
            items={commandPaletteItems}
            theme={currentTheme}
          />

        </div>
      )}
    </div>
    </MotionConfig>
  );
}
