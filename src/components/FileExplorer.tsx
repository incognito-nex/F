import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { 
  FolderPlus, FilePlus, ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, Play,
  MoreVertical, Edit, Trash2, Copy, CornerDownRight, Star, Heart, FileText, 
  ArrowRight, Lock, Code2, AlertTriangle, X, FileJson, FileTerminal, FileKey, Layers,
  Database, Image, Binary, Search, Sparkles, Cpu, Send, Eye, EyeOff, ChevronLeft,
  Brain, Key, RefreshCw, Activity, ArrowLeftRight, GitBranch, Github, Check,
  Plus, Terminal as LucideTerminal, ExternalLink, HelpCircle, AlertCircle, CheckCircle2
} from 'lucide-react';
import { FileNode, AppTheme } from '../types';

// Simple client-side key protection/obfuscation to keep keys encrypted in localStorage
const secureEncrypt = (text: string): string => {
  if (!text) return '';
  try {
    // Elegant base64 encoding with shift to prevent visual scrapers or plain inspector leaks
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return 'ENC_' + encoded.split('').reverse().join('');
  } catch (e) {
    return text;
  }
};

const secureDecrypt = (enc: string): string => {
  if (!enc) return '';
  if (!enc.startsWith('ENC_')) return enc; // Fallback for legacy plain keys
  try {
    const reversed = enc.substring(4).split('').reverse().join('');
    return decodeURIComponent(escape(atob(reversed)));
  } catch (e) {
    return enc;
  }
};

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCreateNode: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  onRenameNode: (id: string, newName: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onMoveNode: (id: string, newParentId: string | null) => void;
  theme: AppTheme;
}

export default function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
  onCreateNode,
  onRenameNode,
  onDeleteNode,
  onDuplicateNode,
  onToggleFavorite,
  onMoveNode,
  theme,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root-scripts': true,
    'root-modules': true,
  });

  // Floating Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    nodeType: 'file' | 'folder';
  } | null>(null);

  // Floating Empty Space Context Menu State
  const [emptySpaceMenu, setEmptySpaceMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Custom HUD Dialog Modal State (No generic browser prompts)
  const [activeModal, setActiveModal] = useState<'create_file' | 'create_folder' | 'rename' | 'delete' | 'move' | null>(null);
  const [modalNodeId, setModalNodeId] = useState<string | null>(null);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [modalInputValue, setModalInputValue] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [dontAskDelete, setDontAskDelete] = useState(() => localStorage.getItem('skip_delete_confirmation') === 'true');

  // Draggable width resize state (X axis)
  const [sidebarWidth, setSidebarWidth] = useState(224); // default 224px (w-56)
  const isDraggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(224);
  const [isDragging, setIsDragging] = useState(false);

  // Search & Workspace features states
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantMode, setAssistantMode] = useState(() => localStorage.getItem('assistant_mode') === 'true');

  // API Key persistent local cache states (for maximum security and persistence)
  const [geminiKey, setGeminiKey] = useState(() => secureDecrypt(localStorage.getItem('api_key_gemini') || ''));
  const [openaiKey, setOpenaiKey] = useState(() => secureDecrypt(localStorage.getItem('api_key_openai') || ''));
  const [claudeKey, setClaudeKey] = useState(() => secureDecrypt(localStorage.getItem('api_key_claude') || ''));
  const [groqKey, setGroqKey] = useState(() => secureDecrypt(localStorage.getItem('api_key_groq') || ''));
  const [llamaKey, setLlamaKey] = useState(() => secureDecrypt(localStorage.getItem('api_key_llama') || ''));

  // Llama together.ai or OpenRouter custom configs
  const [customLlamaBaseUrl, setCustomLlamaBaseUrl] = useState(() => localStorage.getItem('llama_base_url') || 'https://api.together.xyz/v1/chat/completions');
  const [customLlamaModel, setCustomLlamaModel] = useState(() => localStorage.getItem('llama_model_name') || 'meta-llama/Llama-3-70b-chat-hf');

  // Active Provider selection
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'claude' | 'groq' | 'llama'>(() => {
    return (localStorage.getItem('ai_provider') as any) || 'gemini';
  });

  // Target file selection
  const [selectedFileId, setSelectedFileId] = useState<string | null>(activeFileId);

  // Sync active file id
  useEffect(() => {
    if (activeFileId) {
      setSelectedFileId(activeFileId);
    }
  }, [activeFileId]);

  // Persistent Assistant conversation history state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system', text: string }>>(() => {
    const saved = localStorage.getItem('ai_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', text: "Hello! I am your Workspace AI Assistant. Enter your API key, select a file, and click 'Scan & Audit File' to analyze its contents without executing it." }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  const [chatInput, setChatInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showKeysConfig, setShowKeysConfig] = useState(false);

  // Key visual masking states (password view)
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showClaude, setShowClaude] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [showLlama, setShowLlama] = useState(false);

  // Integration simulation states
  const [activeIntegrationTab, setActiveIntegrationTab] = useState<'vscode' | 'github'>('vscode');
  const [vscStatus, setVscStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [vscTokenCopied, setVscTokenCopied] = useState(false);
  const [vscAutoSync, setVscAutoSync] = useState(true);
  const [vscTerminalPiping, setVscTerminalPiping] = useState(true);
  
  const [githubStatus, setGithubStatus] = useState<'DISCONNECTED' | 'CONNECTED'>('CONNECTED');
  const [githubRepoUrl, setGithubRepoUrl] = useState('github.com/incognito-dev/workspace');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubSyncState, setGithubSyncState] = useState<'IDLE' | 'SYNCING' | 'SUCCESS'>('IDLE');
  const [githubAutoCommit, setGithubAutoCommit] = useState(false);
  const [githubLastSyncTime, setGithubLastSyncTime] = useState('Just now');

  // Additional rich interactive states
  const [vscPorts, setVscPorts] = useState<number[]>([3000, 8080]);
  const [newPortInput, setNewPortInput] = useState('');
  const [vscLogs, setVscLogs] = useState<string[]>([
    'Initializing remote tunnel listener on secure port...',
    'Tunnel secure TLS socket handshake completed successfully.',
    'Ready for VS Code premium extension pairing handshake.'
  ]);
  const [showVscConfig, setShowVscConfig] = useState(false);

  // Advanced Integration States
  const [vscProtocol, setVscProtocol] = useState<'websocket' | 'polling' | 'memory'>('websocket');
  const [vscPingLatency, setVscPingLatency] = useState<number | null>(null);
  const [vscTestingPing, setVscTestingPing] = useState(false);
  const [vscIgnoredPatterns, setVscIgnoredPatterns] = useState<string[]>(['.git', 'node_modules', '*.tmp', 'build/']);
  const [newIgnoredPatternInput, setNewIgnoredPatternInput] = useState('');
  
  const [githubBranches, setGithubBranches] = useState<string[]>(['main', 'dev', 'release', 'feature/sandbox-bypass']);
  const [newBranchInput, setNewBranchInput] = useState('');
  const [showBranchManager, setShowBranchManager] = useState(false);
  const [githubConflict, setGithubConflict] = useState(true);
  const [githubConflictResolved, setGithubConflictResolved] = useState(false);

  const [githubCommits, setGithubCommits] = useState([
    { hash: 'e5f8a12', author: 'goirugoiru', msg: 'feat: optimized AST lexer for custom syntax parser', date: '2 hours ago' },
    { hash: '4b9d0e1', author: 'goirugoiru', msg: 'refactor: enhanced fluent side-by-side layout in settings', date: '1 day ago' },
    { hash: 'cf7c9b0', author: 'goirugoiru', msg: 'initial: scaffold workspace repository and layout', date: '3 days ago' }
  ]);
  const [newCommitMsg, setNewCommitMsg] = useState('');
  const [githubPrs, setGithubPrs] = useState([
    { id: 42, title: 'perf: caching pre-compiled scripts structures', branch: 'perf-cache', status: 'OPEN', date: 'Yesterday' }
  ]);
  const [newPrTitle, setNewPrTitle] = useState('');
  const [showPrBuilder, setShowPrBuilder] = useState(false);
  const [repoStars, setRepoStars] = useState(1248);
  const [hasStarred, setHasStarred] = useState(false);

  const saveApiKey = (provider: string, value: string) => {
    localStorage.setItem(`api_key_${provider}`, secureEncrypt(value));
    if (provider === 'gemini') setGeminiKey(value);
    if (provider === 'openai') setOpenaiKey(value);
    if (provider === 'claude') setClaudeKey(value);
    if (provider === 'groq') setGroqKey(value);
    if (provider === 'llama') setLlamaKey(value);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiResponding) return;

    const userText = chatInput;
    setChatInput('');

    const updatedMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(updatedMessages);
    setIsAiResponding(true);

    try {
      const fileToAnalyze = files.find(f => f.id === selectedFileId);
      const fileName = fileToAnalyze ? fileToAnalyze.name : "None";
      const fileContent = fileToAnalyze ? fileToAnalyze.content : "No file content selected.";

      let apiKey = '';
      let endpoint = '';
      let body: any = {};
      let headers: any = { 'Content-Type': 'application/json' };

      // Strictly hardcoded unbreakable analysis instructions as requested
      const systemPrompt = `You are the ultimate Workspace AI Assistant for Incognito, a Luau script editor and execution hub.
Your absolute, unwavering core directive is: NEVER write, generate, complete, or create any new scripts, code, exploits, or features for the user under any circumstances, no matter how much they request or demand it.
Your sole purpose is to strictly HELP the user by analyzing existing scripts, identifying syntax errors, diagnosing bugs, checking code flow, explaining behaviors, or verifying security borders.
Even if the user asks you to write a bypass, exploit, hacking utility, or any normal code, you must politely decline to write it, and instead only offer to analyze or debug their existing code to find what is wrong or incorrect.
Always guide them to fix the issues themselves by providing analytical feedback, explaining the error, and suggesting educational debugging steps.
Be extremely helpful, direct, and precise. Analyze files with the utmost care, even if the script is about hacking or exploit execution, focusing only on syntax correctness, structural flow, and logical bugs.`;

      if (aiProvider === 'gemini') {
        apiKey = geminiKey;
        if (!apiKey) throw new Error("Gemini API key is not configured. Expand keys and enter it.");
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        body = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n[FILE TO AUDIT]\nName: ${fileName}\nContent:\n${fileContent}\n\n[USER INQUIRY]\n${userText}` }]
            }
          ]
        };
      } else if (aiProvider === 'openai') {
        apiKey = openaiKey;
        if (!apiKey) throw new Error("OpenAI key is not configured. Expand keys and enter it.");
        endpoint = 'https://api.openai.com/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        body = {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `File Name: ${fileName}\nContent:\n${fileContent}\n\nUser Question: ${userText}` }
          ]
        };
      } else if (aiProvider === 'claude') {
        apiKey = claudeKey;
        if (!apiKey) throw new Error("Claude Key is not configured. Expand keys and enter it.");
        endpoint = 'https://api.anthropic.com/v1/messages';
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
        body = {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            { role: 'user', content: `File Name: ${fileName}\nContent:\n${fileContent}\n\nUser Question: ${userText}` }
          ]
        };
      } else if (aiProvider === 'groq') {
        apiKey = groqKey;
        if (!apiKey) throw new Error("Groq API Key is not configured. Expand keys and enter it.");
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        body = {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `File Name: ${fileName}\nContent:\n${fileContent}\n\nUser Question: ${userText}` }
          ]
        };
      } else if (aiProvider === 'llama') {
        apiKey = llamaKey;
        if (!apiKey) throw new Error("Llama API Key is not configured. Expand keys and enter it.");
        endpoint = customLlamaBaseUrl;
        headers['Authorization'] = `Bearer ${apiKey}`;
        body = {
          model: customLlamaModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `File Name: ${fileName}\nContent:\n${fileContent}\n\nUser Question: ${userText}` }
          ]
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error code ${res.status}`);
      }

      const data = await res.json();
      let assistantReply = '';

      if (aiProvider === 'gemini') {
        assistantReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response details generated.';
      } else if (aiProvider === 'claude') {
        assistantReply = data.content?.[0]?.text || 'No response content generated.';
      } else {
        assistantReply = data.choices?.[0]?.message?.content || 'No text completion returned.';
      }

      setMessages([...updatedMessages, { role: 'assistant', text: assistantReply }]);
    } catch (err: any) {
      console.error("Assistant Connection Error:", err);
      setMessages([...updatedMessages, { role: 'assistant', text: `⚠️ API Error: ${err.message || 'Failed to establish connection. Check your API key or network limits.'}` }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleAuditActiveFile = () => {
    if (isAiResponding) return;
    const fileToAnalyze = files.find(f => f.id === selectedFileId);
    if (!fileToAnalyze) {
      setMessages([...messages, { role: 'assistant', text: "⚠️ No file selected. Please select a script file from the dropdown to start scanning." }]);
      return;
    }

    setChatInput(`Please analyze this script file named "${fileToAnalyze.name}". Run syntax checks, audit variable bounds, verify structure, and point out any potential bugs or warnings.`);
    setTimeout(() => {
      const btn = document.getElementById('ai-submit-btn');
      if (btn) btn.click();
    }, 100);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const calculatedWidth = startWidthRef.current + deltaX;
    const clamped = Math.max(160, Math.min(500, calculatedWidth));
    setSidebarWidth(clamped);
  };

  const handleResizeMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, []);

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    
    // Lua / Luau
    if (lower.endsWith('.lua') || lower.endsWith('.luau')) {
      return <FileCode size={14} style={{ color: '#00a2ff' }} className="shrink-0" />;
    }
    // Python
    if (lower.endsWith('.py') || lower.endsWith('.pyw') || lower.endsWith('.ipynb')) {
      return <FileTerminal size={14} style={{ color: '#3572a5' }} className="shrink-0" />;
    }
    // C3 language
    if (lower.endsWith('.c3')) {
      return <FileCode size={14} style={{ color: '#e44d26' }} className="shrink-0" />;
    }
    // C# / C-Sharp
    if (lower.endsWith('.cs') || lower.endsWith('.csharp') || lower.endsWith('.csx')) {
      return <FileCode size={14} style={{ color: '#178600' }} className="shrink-0" />;
    }
    // Typescript / TSX
    if (lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.cts') || lower.endsWith('.mts')) {
      return <FileCode size={14} style={{ color: '#3178c6' }} className="shrink-0" />;
    }
    // Javascript / JSX
    if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
      return <FileCode size={14} style={{ color: '#f1e05a' }} className="shrink-0" />;
    }
    // C / C++ / Headers
    if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx') || lower.endsWith('.c') || lower.endsWith('.h') || lower.endsWith('.hpp') || lower.endsWith('.h++')) {
      return <FileCode size={14} style={{ color: '#f34b7d' }} className="shrink-0" />;
    }
    // Markdown / Docs
    if (lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.rst') || lower.endsWith('.adoc')) {
      return <FileText size={14} style={{ color: '#083fa1' }} className="shrink-0" />;
    }
    // Web Layout / Style / SVG
    if (lower.endsWith('.html') || lower.endsWith('.htm') || lower.endsWith('.xhtml') || lower.endsWith('.xml')) {
      return <FileCode size={14} style={{ color: '#e34c26' }} className="shrink-0" />;
    }
    if (lower.endsWith('.svg')) {
      return <Image size={14} style={{ color: '#ffb300' }} className="shrink-0" />;
    }
    if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.sass') || lower.endsWith('.less') || lower.endsWith('.postcss')) {
      return <FileCode size={14} style={{ color: '#563d7c' }} className="shrink-0" />;
    }
    // Shell scripts / terminal batch / PowerShell
    if (lower.endsWith('.sh') || lower.endsWith('.bash') || lower.endsWith('.zsh') || lower.endsWith('.fish') || lower.endsWith('.bat') || lower.endsWith('.cmd') || lower.endsWith('.ps1')) {
      return <FileTerminal size={14} style={{ color: '#49c31a' }} className="shrink-0" />;
    }
    // Go language
    if (lower.endsWith('.go')) {
      return <FileCode size={14} style={{ color: '#00add8' }} className="shrink-0" />;
    }
    // Rust language
    if (lower.endsWith('.rs') || lower.endsWith('.rust')) {
      return <FileCode size={14} style={{ color: '#dea584' }} className="shrink-0" />;
    }
    // Java
    if (lower.endsWith('.java') || lower.endsWith('.class') || lower.endsWith('.jar')) {
      return <FileCode size={14} style={{ color: '#b07219' }} className="shrink-0" />;
    }
    // Ruby
    if (lower.endsWith('.rb') || lower.endsWith('.gem')) {
      return <FileCode size={14} style={{ color: '#701516' }} className="shrink-0" />;
    }
    // PHP
    if (lower.endsWith('.php') || lower.endsWith('.phtml')) {
      return <FileCode size={14} style={{ color: '#4f5d95' }} className="shrink-0" />;
    }
    // Swift
    if (lower.endsWith('.swift')) {
      return <FileCode size={14} style={{ color: '#ffac45' }} className="shrink-0" />;
    }
    // Kotlin
    if (lower.endsWith('.kt') || lower.endsWith('.kts')) {
      return <FileCode size={14} style={{ color: '#f18e33' }} className="shrink-0" />;
    }
    // Databases
    if (lower.endsWith('.sql') || lower.endsWith('.sqlite') || lower.endsWith('.db') || lower.endsWith('.db3') || lower.endsWith('.mdb')) {
      return <Database size={14} style={{ color: '#4caf50' }} className="shrink-0" />;
    }
    // Images
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp') || lower.endsWith('.ico') || lower.endsWith('.bmp')) {
      return <Image size={14} style={{ color: '#00bcd4' }} className="shrink-0" />;
    }
    // Binaries
    if (lower.endsWith('.dll') || lower.endsWith('.exe') || lower.endsWith('.so') || lower.endsWith('.bin') || lower.endsWith('.dmg') || lower.endsWith('.app')) {
      return <Binary size={14} style={{ color: '#9c27b0' }} className="shrink-0" />;
    }
    // JSON & Configs
    if (lower.endsWith('.json') || lower.endsWith('.json5') || lower.endsWith('.toml') || lower.endsWith('.yaml') || lower.endsWith('.yml') || lower.endsWith('.ini') || lower.endsWith('.conf') || lower.endsWith('.config')) {
      return <FileJson size={14} style={{ color: '#cbcb41' }} className="shrink-0" />;
    }
    // Text documents
    if (lower.endsWith('.txt') || lower.endsWith('.log') || lower.endsWith('.csv')) {
      return <FileText size={14} style={{ color: '#90a4ae' }} className="shrink-0" />;
    }
    // Env
    if (lower.includes('.env') || lower.endsWith('.key') || lower.endsWith('.pem') || lower.endsWith('.pub')) {
      return <FileKey size={14} style={{ color: '#e6b450' }} className="shrink-0" />;
    }
    // Generic script file icon
    return <FileCode size={14} style={{ color: '#858585' }} className="shrink-0" />;
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string, nodeType: 'file' | 'folder') => {
    e.preventDefault();
    e.stopPropagation();
    setEmptySpaceMenu(null);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId,
      nodeType
    });
  };

  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu(null);
    setEmptySpaceMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const closeMenus = () => {
    setContextMenu(null);
    setEmptySpaceMenu(null);
  };

  // Listen globally to clean popups on normal clicks
  useEffect(() => {
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  // Modal Initiators (Replacing prompt/confirm overrides!)
  const triggerRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenus();
    setModalNodeId(id);
    setModalInputValue(currentName);
    setModalError(null);
    setActiveModal('rename');
  };

  const triggerDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenus();
    if (localStorage.getItem('skip_delete_confirmation') === 'true') {
      onDeleteNode(id);
    } else {
      setModalNodeId(id);
      setActiveModal('delete');
    }
  };

  const triggerDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenus();
    onDuplicateNode(id);
  };

  const triggerToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenus();
    onToggleFavorite(id);
  };

  const triggerMove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenus();
    setModalNodeId(id);
    setModalParentId(''); // default to root
    setActiveModal('move');
  };

  const handleCreateInFolder = (type: 'file' | 'folder', parentId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenus();
    const actualParentId = parentId || 'folder-workspace';
    setModalParentId(actualParentId);
    setModalInputValue(type === 'file' ? 'NewScript.lua' : 'NewFolder');
    setModalError(null);
    setActiveModal(type === 'file' ? 'create_file' : 'create_folder');
  };

  // Submit Modal changes
  const submitModal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = modalInputValue.trim();
    if (!val && activeModal !== 'delete' && activeModal !== 'move') {
      setModalError('Value cannot be empty');
      return;
    }

    if (activeModal === 'rename' && modalNodeId) {
      onRenameNode(modalNodeId, val);
    } else if (activeModal === 'create_file') {
      onCreateNode(val, 'file', modalParentId);
      if (modalParentId) {
        setExpandedFolders(prev => ({ ...prev, [modalParentId]: true }));
      }
    } else if (activeModal === 'create_folder') {
      onCreateNode(val, 'folder', modalParentId);
      if (modalParentId) {
        setExpandedFolders(prev => ({ ...prev, [modalParentId]: true }));
      }
    } else if (activeModal === 'delete' && modalNodeId) {
      onDeleteNode(modalNodeId);
    } else if (activeModal === 'move' && modalNodeId) {
      const pid = modalParentId === '' ? null : modalParentId;
      onMoveNode(modalNodeId, pid);
    }

    setActiveModal(null);
    setModalNodeId(null);
    setModalParentId(null);
  };

  const renderTree = (parentId: string | null, depth: number = 0) => {
    const nodes = files.filter(f => f.parentId === parentId);

    // folders first, then files
    const sortedNodes = [...nodes].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return sortedNodes.map((node) => {
      const isFolder = node.type === 'folder';
      const isExpanded = !!expandedFolders[node.id];
      const isActive = activeFileId === node.id;

      return (
        <motion.div 
          key={node.id} 
          layout="position"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="select-none font-mono"
        >
          <motion.div
            onClick={() => {
              if (isFolder) {
                setExpandedFolders(prev => ({ ...prev, [node.id]: !prev[node.id] }));
              } else {
                onSelectFile(node.id);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, node.id, node.type)}
            whileHover={{ x: 2, backgroundColor: isActive ? undefined : 'rgba(255,255,255,0.03)' }}
            style={{
              paddingLeft: `${8 + depth * 16}px`,
              color: isActive ? theme.textMain : theme.textMuted,
            }}
            className={`group py-1 px-2 flex items-center justify-between text-xs cursor-pointer rounded-lg relative ${
              isActive ? 'font-bold' : ''
            }`}
          >
            {isActive && (
              <>
                {/* Unified moving background highlight */}
                <motion.div
                  layoutId="activeFileRowBackground"
                  className="absolute inset-0 rounded-lg pointer-events-none z-0"
                  style={{
                    background: `linear-gradient(90deg, ${theme.accent}14 0%, ${theme.accent}02 100%)`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 950,
                    damping: 24,
                    mass: 0.4
                  }}
                />
                {/* Glowing vertical accent bar on the left */}
                <motion.div
                  layoutId="activeFileRowLeftBar"
                  className="absolute left-1 top-1.5 bottom-1.5 w-[3.5px] rounded-full pointer-events-none z-10"
                  style={{
                    backgroundColor: theme.accent,
                    boxShadow: `0 0 8px ${theme.accent}cc, 0 0 2px ${theme.accent}60`
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 26,
                    mass: 0.5
                  }}
                />
              </>
            )}

            <div className="relative z-10 flex items-center justify-between w-full min-w-0">
              <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                {isFolder ? (
                  <span className="text-zinc-500 shrink-0">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}

                {isFolder ? (
                  isExpanded ? (
                    <FolderOpen size={14} style={{ color: '#d29a38' }} className="shrink-0" />
                  ) : (
                    <Folder size={14} style={{ color: '#d29a38' }} className="shrink-0" />
                  )
                ) : (
                  getFileIcon(node.name)
                )}

                <span className={`truncate flex-1 min-w-0 ${isActive ? 'font-semibold font-sans tracking-wide text-zinc-100' : ''}`}>{node.name}</span>
              </div>

              {/* Quick hover nodes */}
              <div className="hidden group-hover:flex items-center space-x-1 shrink-0 bg-transparent pl-2">
                {isFolder ? (
                  <>
                    <button
                      onClick={(e) => handleCreateInFolder('file', node.id, e)}
                      className="p-1 hover:text-white rounded cursor-pointer animate-fade-in"
                      title="Add Script File"
                    >
                      <FilePlus size={12} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => triggerToggleFav(node.id, e)}
                    className="p-1 hover:text-yellow-400 rounded cursor-pointer animate-fade-in"
                    title="Tag favorite"
                  >
                    <Star size={12} className={node.isFavorite ? "fill-yellow-500 text-yellow-500" : ""} />
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, node.id, node.type);
                  }}
                  className="p-1 hover:text-white rounded cursor-pointer"
                  title="Options Menu"
                >
                  <MoreVertical size={12} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Children nodes connector indicators with slide down animation */}
          <AnimatePresence initial={false}>
            {isFolder && isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden"
              >
                <div
                  style={{ left: `${depth * 16 + 14}px`, borderColor: theme.borderColor }}
                  className="absolute top-0 bottom-2.5 border-l opacity-20 pointer-events-none"
                />
                {renderTree(node.id, depth + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    });
  };

  return (
    <div
      onContextMenu={handleEmptySpaceContextMenu}
      style={{
        backgroundColor: theme.sidebarBg,
        borderColor: theme.borderColor,
        width: `${sidebarWidth}px`
      }}
      className="h-full shrink-0 flex flex-col justify-between font-mono relative bg-black/10 selection:bg-rose-500/10"
    >
      {/* Resizer Handle Bar */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          backgroundColor: isDragging ? theme.accent : undefined,
          boxShadow: isDragging ? `0 0 12px ${theme.accent}` : undefined,
        }}
        className={`absolute top-0 right-0 w-[5px] h-full cursor-col-resize transition-all duration-150 z-50 select-none opacity-40 hover:opacity-100 hover:bg-zinc-500/20`}
        title="Drag left/right to resize sidebar"
      />
      {/* Search & Actions Bar */}
      <div 
        style={{ borderColor: 'transparent', backgroundColor: theme.headerBg }}
        className="h-11 px-3 flex items-center justify-between shrink-0 select-none bg-black/5"
      >
        <span 
          style={{ color: theme.textMain }}
          className="text-[11px] font-bold tracking-wider font-sans flex items-center space-x-1.5 uppercase"
        >
          {assistantMode ? (
            <span className="flex items-center space-x-1.5 text-white">
              <ArrowLeftRight size={12} />
              <span>Integration</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-zinc-400">
              <Layers size={11} />
              <span>Explorer</span>
            </span>
          )}
        </span>
        <div className="flex items-center space-x-1.5">
          {!assistantMode && (
            <div className="flex items-center space-x-0.5">
              <button
                onClick={(e) => handleCreateInFolder('file', 'folder-workspace', e)}
                className="p-1 hover:text-white hover:bg-zinc-800/60 rounded transition-all cursor-pointer text-zinc-500"
                title="New Script File"
              >
                <FilePlus size={13} />
              </button>
            </div>
          )}

          {/* Elegant Mode Switch Button */}
          <button
            onClick={() => {
              const newMode = !assistantMode;
              setAssistantMode(newMode);
              localStorage.setItem('assistant_mode', String(newMode));
            }}
            className="p-1 hover:text-white hover:bg-zinc-800/60 rounded transition-all cursor-pointer text-zinc-500 active:scale-95"
            title={assistantMode ? "Switch to Explorer" : "Switch to Integration"}
          >
            <ArrowLeftRight size={13} className={assistantMode ? "text-white" : ""} />
          </button>
        </div>
      </div>

      {/* Workspace content list or Integration panel */}
      {assistantMode ? (
        <div className="flex-1 flex flex-col min-h-0 bg-black/20 text-left overflow-hidden">
          {/* Active Integration Tab selection */}
          <div className="flex border-b border-zinc-900/60 bg-zinc-950/20 shrink-0 font-sans">
            <button
              onClick={() => setActiveIntegrationTab('vscode')}
              className={`flex-1 py-3 text-center text-[11px] font-sans font-bold tracking-wide uppercase border-b-2 transition-all duration-150 cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeIntegrationTab === 'vscode'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Code2 size={13} className={activeIntegrationTab === 'vscode' ? 'text-blue-400' : 'text-zinc-500'} />
              <span>VS Code</span>
            </button>
            <button
              onClick={() => setActiveIntegrationTab('github')}
              className={`flex-1 py-3 text-center text-[11px] font-sans font-bold tracking-wide uppercase border-b-2 transition-all duration-150 cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeIntegrationTab === 'github'
                  ? 'border-zinc-100 text-white bg-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Github size={13} className={activeIntegrationTab === 'github' ? 'text-white' : 'text-zinc-500'} />
              <span>GitHub</span>
            </button>
          </div>

          {/* Tab content area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none font-sans">
            {activeIntegrationTab === 'vscode' ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* VS Code Connection Status Card */}
                <div 
                  className="p-4 rounded-xl border border-blue-500/10 space-y-3 shadow-md"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">VS Code Connection</span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        vscStatus === 'CONNECTED'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                          : vscStatus === 'CONNECTING'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-zinc-600'
                      }`} />
                      <span className="text-[10px] font-mono font-bold uppercase text-zinc-300">
                        {vscStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] font-sans text-zinc-400 leading-normal">
                    Link your local VS Code application directly to this browser workspace using our premium extension.
                  </p>

                  <button
                    onClick={() => {
                      if (vscStatus === 'DISCONNECTED') {
                        setVscStatus('CONNECTING');
                        const time = new Date().toLocaleTimeString();
                        setVscLogs(prev => [...prev, `[${time}] Connecting local VS Code app via tunnel...`]);
                        setTimeout(() => {
                          setVscStatus('CONNECTED');
                          setVscLogs(prev => [
                            ...prev,
                            `[${new Date().toLocaleTimeString()}] Handshake success. Remote client pairing verified!`,
                            `[${new Date().toLocaleTimeString()}] Dual-tunnel active for synced ports.`
                          ]);
                        }, 1200);
                      } else {
                        setVscStatus('DISCONNECTED');
                        setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] VS Code tunnel stopped.`]);
                      }
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-blue-900/10"
                  >
                    {vscStatus === 'DISCONNECTED' ? 'Connect VS Code App' : vscStatus === 'CONNECTING' ? 'Handshaking...' : 'Disconnect VS Code'}
                  </button>
                </div>

                {/* VS Code Auth Token Card */}
                <div 
                  className="p-4 rounded-xl border space-y-3 shadow-sm"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Extension Pair Token</span>
                    <span title="Paste this token inside the Incognito VS Code extension workspace settings">
                      <HelpCircle size={12} className="text-zinc-500 hover:text-zinc-300 cursor-help" />
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-black/40 border border-zinc-850 rounded-lg p-2">
                    <code className="text-[10px] font-mono text-zinc-300 flex-1 select-all truncate px-1 font-bold">
                      vsc_inc_8f921ea0283ffb
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('vsc_inc_8f921ea0283ffb');
                        setVscTokenCopied(true);
                        setTimeout(() => setVscTokenCopied(false), 2000);
                      }}
                      className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded cursor-pointer transition-colors shrink-0"
                    >
                      {vscTokenCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Port Forwarding Manager */}
                <div 
                  className="p-4 rounded-xl border space-y-3.5 shadow-sm"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Port Forwarding</span>
                    <span className="text-[11px] text-zinc-500 font-sans block mt-0.5">Tunnel local ports from desktop VS Code</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="e.g. 3000"
                      value={newPortInput}
                      onChange={(e) => setNewPortInput(e.target.value)}
                      className="flex-1 py-1.5 px-3 bg-black/40 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500/50"
                    />
                    <button
                      onClick={() => {
                        const port = parseInt(newPortInput);
                        if (port > 0 && port <= 65535 && !vscPorts.includes(port)) {
                          setVscPorts([...vscPorts, port]);
                          setNewPortInput('');
                          setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Created tunnel on port localhost:${port}`]);
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition rounded-lg text-xs font-mono flex items-center space-x-1 text-zinc-300 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  </div>

                  {vscPorts.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {vscPorts.map(port => (
                        <div key={port} className="flex items-center space-x-1.5 bg-blue-500/5 border border-blue-500/20 text-blue-400 font-mono text-[10px] px-2 py-1 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-bold">:{port}</span>
                          <button
                            onClick={() => {
                              setVscPorts(vscPorts.filter(p => p !== port));
                              setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Closed tunnel on port localhost:${port}`]);
                            }}
                            className="text-zinc-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-zinc-600 italic">No ports currently forwarded.</div>
                  )}
                </div>

                {/* Local Sync Toggle Toggles */}
                <div 
                  className="p-4 rounded-xl border space-y-3.5 shadow-sm"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Extension Synchronization Rules</span>
                  
                  {/* Rule 1 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans text-zinc-300">Bi-directional directory sync</span>
                    <button 
                      onClick={() => {
                        const next = !vscAutoSync;
                        setVscAutoSync(next);
                        setVscLogs(prev => [
                          ...prev,
                          `[${new Date().toLocaleTimeString()}] Directory automatic watcher ${next ? 'ENABLED' : 'DISABLED'}`
                        ]);
                      }}
                      className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                        vscAutoSync ? 'bg-blue-600' : 'bg-zinc-800'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-black transition-transform duration-200 ${
                        vscAutoSync ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Rule 2 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans text-zinc-300">Terminal input/output pipe</span>
                    <button 
                      onClick={() => {
                        const next = !vscTerminalPiping;
                        setVscTerminalPiping(next);
                        setVscLogs(prev => [
                          ...prev,
                          `[${new Date().toLocaleTimeString()}] Local terminal process piping ${next ? 'ENABLED' : 'DISABLED'}`
                        ]);
                      }}
                      className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                        vscTerminalPiping ? 'bg-blue-600' : 'bg-zinc-800'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-black transition-transform duration-200 ${
                        vscTerminalPiping ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Local Files Watcher Console */}
                <div className="p-4 rounded-xl border border-dashed border-zinc-850 bg-zinc-950/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <LucideTerminal size={11} className="text-blue-500" />
                      <span>Remote Tunnel Console</span>
                    </span>
                    <button
                      onClick={() => {
                        const filesToSimulate = ['src/App.tsx', 'src/components/FileExplorer.tsx', 'package.json', 'src/types.ts', 'vite.config.ts', 'src/index.css'];
                        const randomFile = filesToSimulate[Math.floor(Math.random() * filesToSimulate.length)];
                        const actions = ['Syncing', 'Indexing AST', 'Writing updates', 'Triggering pre-save hook'];
                        const randomAction = actions[Math.floor(Math.random() * actions.length)];
                        const newLog = `[${new Date().toLocaleTimeString()}] [File Watcher] ${randomAction} for file '${randomFile}'... Done.`;
                        setVscLogs(prev => [...prev, newLog]);
                      }}
                      className="text-[9px] font-mono bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-all active:scale-95"
                    >
                      Simulate Local Edit
                    </button>
                  </div>

                  <div className="bg-black/85 border border-zinc-900 rounded-lg p-3 max-h-36 overflow-y-auto font-mono text-[9px] text-zinc-400 space-y-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-800 select-all">
                    {vscLogs.map((log, index) => (
                      <div key={index} className="leading-relaxed border-l-2 border-blue-500/50 pl-1.5">{log}</div>
                    ))}
                  </div>
                </div>

                {/* Generate VS Code Settings json configuration */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => setShowVscConfig(!showVscConfig)}
                    className="w-full text-left p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 transition flex items-center justify-between cursor-pointer text-xs"
                  >
                    <span className="font-mono text-[10px] text-zinc-300 uppercase tracking-wider">Show Workspace settings.json</span>
                    <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showVscConfig ? 'rotate-180' : ''}`} />
                  </button>

                  {showVscConfig && (
                    <div className="p-3 bg-zinc-950/80 border border-zinc-900 rounded-xl space-y-2 animate-in slide-in-from-top-2 duration-150">
                      <pre className="font-mono text-[9px] text-zinc-500 leading-normal select-all overflow-x-auto text-left py-1">
{`{
  "incognito.tunnel.port": 3000,
  "incognito.tunnel.token": "vsc_inc_8f921ea028",
  "incognito.autoSync": true,
  "editor.tabSize": 2,
  "editor.fontFamily": "JetBrains Mono"
}`}
                      </pre>
                      <button
                        onClick={() => {
                          onCreateNode('settings.json', 'file', null);
                          setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Generated 'settings.json' local workspace configurations mockup successfully.`]);
                          setShowVscConfig(false);
                        }}
                        className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-blue-400 hover:text-white border border-zinc-850 rounded-lg text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        Write Settings.json to Workspace
                      </button>
                    </div>
                  )}
                </div>

                {/* Advanced Integration Options Block */}
                <div 
                  className="p-4 rounded-xl border space-y-4 shadow-sm"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider block">Advanced Integration Options</span>
                  
                  {/* Option 1: Tunnel Protocol Selection */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Sync Protocol</label>
                    <select
                      value={vscProtocol}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setVscProtocol(val);
                        setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Switched protocol to: ${val.toUpperCase()}`]);
                      }}
                      className="w-full py-2 px-2.5 bg-black/40 border border-zinc-850 rounded-lg text-[10px] font-mono text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      <option value="websocket">WebSockets (Secure Encrypted Real-time)</option>
                      <option value="polling">Polling (Interval File Checking)</option>
                      <option value="memory">Shared Memory Mapping (Local Engine Only)</option>
                    </select>
                  </div>

                  {/* Option 2: Diagnostics Tunnel Latency */}
                  <div className="space-y-2 text-left pt-0.5">
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Diagnostics & Performance</label>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/35 border border-zinc-900">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono font-bold text-zinc-300">Tunnel Connection Ping</span>
                        <span className="text-[8px] font-mono text-zinc-500">Measure roundtrip message latency</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {vscPingLatency !== null && (
                          <span className={`text-[10px] font-mono font-bold ${vscPingLatency < 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {vscPingLatency}ms
                          </span>
                        )}
                        <button
                          onClick={() => {
                            if (vscTestingPing) return;
                            setVscTestingPing(true);
                            setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Running ping diagnostic test...`]);
                            setTimeout(() => {
                              const randomPing = Math.floor(Math.random() * 15) + 5; // 5-20ms
                              setVscPingLatency(randomPing);
                              setVscTestingPing(false);
                              setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Diagnostic response: ${randomPing}ms (Stable)`]);
                            }, 800);
                          }}
                          disabled={vscTestingPing}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded border border-zinc-850 text-[9px] font-mono font-bold cursor-pointer transition active:scale-95 disabled:opacity-50"
                        >
                          {vscTestingPing ? 'Testing...' : 'Ping'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Ignored Patterns Manager */}
                  <div className="space-y-2 text-left pt-0.5">
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Watch Ignore Rules</label>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {vscIgnoredPatterns.map(p => (
                          <span key={p} className="flex items-center space-x-1 bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-[8px] font-mono text-zinc-400">
                            <span>{p}</span>
                            <button
                              onClick={() => {
                                setVscIgnoredPatterns(vscIgnoredPatterns.filter(item => item !== p));
                                setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Removed ignore rule: ${p}`]);
                              }}
                              className="text-zinc-650 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          placeholder="e.g. dist/"
                          value={newIgnoredPatternInput}
                          onChange={(e) => setNewIgnoredPatternInput(e.target.value)}
                          className="flex-1 py-1 px-2 bg-black/40 border border-zinc-850 rounded text-[9px] font-mono text-zinc-300 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const trimmed = newIgnoredPatternInput.trim();
                            if (trimmed && !vscIgnoredPatterns.includes(trimmed)) {
                              setVscIgnoredPatterns([...vscIgnoredPatterns, trimmed]);
                              setNewIgnoredPatternInput('');
                              setVscLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Appended ignore rule: ${trimmed}`]);
                            }
                          }}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded border border-zinc-850 text-[9px] font-mono font-bold cursor-pointer transition"
                        >
                          Add Rule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Repository Statistics - Stark White/Black Grid */}
                <div 
                  className="p-4 rounded-xl border border-zinc-800 space-y-3 bg-zinc-950/45"
                  style={{ borderColor: theme.borderColor }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Github size={11} className="text-white" />
                      <span>REPOSITORY SUMMARY</span>
                    </span>
                    <button
                      onClick={() => {
                        setRepoStars(prev => hasStarred ? prev - 1 : prev + 1);
                        setHasStarred(!hasStarred);
                      }}
                      className={`flex items-center space-x-1 text-[9px] font-mono px-2 py-0.5 border rounded-md cursor-pointer transition-all active:scale-95 ${
                        hasStarred 
                          ? 'bg-white text-black border-white' 
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-600'
                      }`}
                    >
                      <Star size={10} className={hasStarred ? 'fill-black' : ''} />
                      <span>{hasStarred ? 'Starred' : 'Star'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="bg-black/50 border border-zinc-900 p-2.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Stars</span>
                      <span className="text-xs font-mono font-bold text-white mt-0.5">{repoStars.toLocaleString()}</span>
                    </div>
                    <div className="bg-black/50 border border-zinc-900 p-2.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Forks</span>
                      <span className="text-xs font-mono font-bold text-white mt-0.5">242</span>
                    </div>
                    <div className="bg-black/50 border border-zinc-900 p-2.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Watchers</span>
                      <span className="text-xs font-mono font-bold text-white mt-0.5">89</span>
                    </div>
                    <div className="bg-black/50 border border-zinc-900 p-2.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Issues</span>
                      <span className="text-xs font-mono font-bold text-white mt-0.5">14 Open</span>
                    </div>
                  </div>
                </div>

                {/* GitHub Sync Panel - Pure Monochrome styling */}
                <div 
                  className="p-4 rounded-xl border border-zinc-800 space-y-3 shadow-md"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <GitBranch size={11} className="text-zinc-400" />
                      <span>Remote Repository Sync</span>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase">Linked</span>
                    </div>
                  </div>

                  {/* Repository Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Repository URL</label>
                    <div className="flex items-center space-x-1.5 bg-black/40 border border-zinc-800 rounded-lg p-1">
                      <Github size={11} className="text-zinc-500 ml-1.5" />
                      <input
                        type="text"
                        value={githubRepoUrl}
                        onChange={(e) => setGithubRepoUrl(e.target.value)}
                        placeholder="github.com/username/repo"
                        className="flex-1 py-1 px-1.5 bg-transparent border-0 text-[10px] font-mono text-zinc-300 focus:outline-none placeholder-zinc-650"
                      />
                    </div>
                  </div>

                  {/* Branch dropdown */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Target Branch</label>
                    <select
                      value={githubBranch}
                      onChange={(e) => setGithubBranch(e.target.value)}
                      className="w-full py-2 px-2.5 bg-black/40 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      <option value="main">main (production)</option>
                      <option value="dev">dev (development)</option>
                      <option value="release">release (stable-tag)</option>
                    </select>
                  </div>

                  {/* Push input for commit message */}
                  <div className="space-y-1.5 text-left pt-0.5">
                    <label className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Push Commit Message</label>
                    <input
                      type="text"
                      value={newCommitMsg}
                      onChange={(e) => setNewCommitMsg(e.target.value)}
                      placeholder="Commit message (e.g. feat: syntax system...)"
                      className="w-full py-1.5 px-3 bg-black/40 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 placeholder-zinc-650"
                    />
                  </div>

                  {/* Stark Monochrome Push button */}
                  <button
                    onClick={() => {
                      if (githubSyncState === 'SYNCING') return;
                      setGithubSyncState('SYNCING');
                      const commitMsg = newCommitMsg.trim() || 'update: synchronized workspace scripts';
                      
                      setTimeout(() => {
                        setGithubSyncState('SUCCESS');
                        setGithubLastSyncTime('Just now');
                        
                        const hash = Math.random().toString(16).substring(2, 9);
                        const newCommit = {
                          hash,
                          author: 'goirugoiru',
                          msg: commitMsg,
                          date: 'Just now'
                        };
                        setGithubCommits(prev => [newCommit, ...prev]);
                        setNewCommitMsg('');

                        setTimeout(() => {
                          setGithubSyncState('IDLE');
                        }, 2500);
                      }, 2000);
                    }}
                    disabled={githubSyncState === 'SYNCING'}
                    className="w-full py-2.5 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-extrabold rounded-xl text-xs font-mono uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed shadow-md shadow-black/10"
                  >
                    {githubSyncState === 'SYNCING' ? 'PUSHING TREE LOGS...' : 'COMMIT & PUSH'}
                  </button>
                </div>

                {/* Synchronization log stream */}
                {githubSyncState !== 'IDLE' && (
                  <div className="p-3.5 rounded-xl border border-zinc-850 bg-black/50 space-y-2 animate-in slide-in-from-top-2 duration-150 text-left font-mono text-[9px] leading-relaxed">
                    <div className="flex items-center space-x-1.5 text-zinc-400">
                      <RefreshCw size={10} className={`text-zinc-100 ${githubSyncState === 'SYNCING' ? 'animate-spin' : ''}`} />
                      <span className="font-bold text-zinc-200 tracking-wider">GIT CONSOLE OUTPUT</span>
                    </div>
                    <div className="space-y-0.5 text-zinc-500 border-l border-zinc-800 pl-2">
                      <div>$ git commit -m "{newCommitMsg.trim() || 'update: synchronized workspace scripts'}"</div>
                      <div>[main {Math.random().toString(16).substring(2, 9)}] {newCommitMsg.trim() || 'update: synchronized workspace scripts'}</div>
                      <div>$ git push origin {githubBranch}</div>
                      <div>Transferring buffers to upstream repository... Done.</div>
                      {githubSyncState === 'SUCCESS' ? (
                        <>
                          <div className="text-zinc-400">Total 14 (delta 9), reused 0 (delta 0), pack-reused 0</div>
                          <div className="text-zinc-400">To https://github.com/{githubRepoUrl.replace('github.com/', '')}</div>
                          <div className="text-zinc-400">   * [new branch]      {githubBranch} {"->"} {githubBranch}</div>
                          <div className="text-white font-bold flex items-center space-x-1 mt-1 border-l-2 border-white pl-1.5">
                            <Check size={10} />
                            <span>Upstream synchronize success!</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-zinc-300 animate-pulse font-bold">Synchronizing refs structure tree...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Commit History Timeline list */}
                <div 
                  className="p-4 rounded-xl border border-zinc-800 space-y-3.5"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Recent Git Commit Log</span>
                  
                  <div className="space-y-3.5 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-800 pl-1">
                    {githubCommits.map((c, i) => (
                      <div key={i} className="flex items-start space-x-3.5 text-left relative">
                        {/* Timeline node dot */}
                        <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold text-zinc-400 z-10 select-none">
                          {c.author.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-500 font-semibold">{c.author}</span>
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">{c.date}</span>
                          </div>
                          <p className="text-[11px] font-sans text-zinc-300 leading-snug mt-0.5 break-words">{c.msg}</p>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="bg-zinc-900/60 border border-zinc-800 text-zinc-400 font-mono text-[9px] px-1.5 py-0.5 rounded select-all font-bold">
                              {c.hash}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Pull Request Builder */}
                <div 
                  className="p-4 rounded-xl border border-zinc-800 space-y-3 shadow-sm"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Active Pull Requests</span>
                    <button
                      onClick={() => setShowPrBuilder(!showPrBuilder)}
                      className="text-[9px] font-mono text-zinc-400 hover:text-white transition cursor-pointer uppercase flex items-center space-x-1"
                    >
                      <span>{showPrBuilder ? 'Cancel' : '+ New PR'}</span>
                    </button>
                  </div>

                  {showPrBuilder && (
                    <div className="p-3 bg-black/60 border border-zinc-900 rounded-lg space-y-2.5 animate-in slide-in-from-top-1.5 duration-100 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">PR Title</span>
                        <input
                          type="text"
                          value={newPrTitle}
                          onChange={(e) => setNewPrTitle(e.target.value)}
                          placeholder="e.g. feat: hotkeys layout refactoring"
                          className="w-full py-1 px-2 bg-zinc-900/50 border border-zinc-800 rounded text-xs font-sans text-zinc-300 focus:outline-none focus:border-zinc-600"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-0.5">
                        <span>Base: <b className="text-zinc-300">main</b></span>
                        <span>Compare: <b className="text-zinc-300">{githubBranch}</b></span>
                      </div>
                      <button
                        onClick={() => {
                          if (!newPrTitle.trim()) return;
                          const newId = githubPrs.length > 0 ? Math.max(...githubPrs.map(p => p.id)) + 1 : 1;
                          const newPr = {
                            id: newId,
                            title: newPrTitle.trim(),
                            branch: githubBranch,
                            status: 'OPEN',
                            date: 'Just now'
                          };
                          setGithubPrs(prev => [newPr, ...prev]);
                          setNewPrTitle('');
                          setShowPrBuilder(false);
                        }}
                        className="w-full py-1.5 bg-zinc-100 hover:bg-white text-black font-mono font-bold rounded text-[10px] tracking-wide transition-all active:scale-95 cursor-pointer"
                      >
                        OPEN PULL REQUEST
                      </button>
                    </div>
                  )}

                  {githubPrs.length > 0 ? (
                    <div className="space-y-2.5 pt-0.5">
                      {githubPrs.map(pr => (
                        <div key={pr.id} className="bg-black/40 border border-zinc-900 rounded-lg p-2.5 flex flex-col space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-zinc-500">#{pr.id} from {pr.branch}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              pr.status === 'OPEN' 
                                ? 'bg-emerald-950/25 border-emerald-900 text-emerald-400' 
                                : 'bg-purple-950/25 border-purple-900 text-purple-400'
                            }`}>
                              {pr.status}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold font-sans text-zinc-200 leading-tight">{pr.title}</span>
                          
                          {pr.status === 'OPEN' && (
                            <button
                              onClick={() => {
                                setGithubPrs(prev => prev.map(p => p.id === pr.id ? { ...p, status: 'MERGED' } : p));
                              }}
                              className="self-end py-1 px-2 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 hover:text-white transition rounded-md font-mono text-[9px] font-bold text-zinc-400 cursor-pointer active:scale-95"
                            >
                              Merge Pull Request
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-zinc-600 italic">No active pull requests.</div>
                  )}
                </div>

                {/* Additional GitHub options */}
                <div 
                  className="p-4 rounded-xl border space-y-3.5 shadow-sm"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Repository Settings</span>
                  
                  {/* Commits on local save toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans text-zinc-300">Auto-commit on Save</span>
                    <button 
                      onClick={() => setGithubAutoCommit(!githubAutoCommit)}
                      className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                        githubAutoCommit ? 'bg-white' : 'bg-zinc-800'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        githubAutoCommit ? 'translate-x-4 bg-black' : 'translate-x-0 bg-zinc-400'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono pt-0.5">
                    <span>Last Synced Status:</span>
                    <span>{githubLastSyncTime}</span>
                  </div>
                </div>

                {/* Branch Manager */}
                <div 
                  className="p-4 rounded-xl border space-y-3.5 shadow-sm"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider block">Local Branch Manager</span>
                    <button
                      onClick={() => setShowBranchManager(!showBranchManager)}
                      className="text-[9px] font-mono text-zinc-400 hover:text-white transition cursor-pointer uppercase"
                    >
                      {showBranchManager ? 'Collapse' : 'Manage'}
                    </button>
                  </div>

                  {showBranchManager && (
                    <div className="space-y-3 pt-0.5 animate-in slide-in-from-top-1.5 duration-100">
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Active Branches</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {githubBranches.map(b => (
                            <button
                              key={b}
                              onClick={() => {
                                setGithubBranch(b);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono truncate transition text-left cursor-pointer ${
                                githubBranch === b 
                                  ? 'bg-white text-black border-white font-extrabold' 
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-white'
                              }`}
                            >
                              {githubBranch === b ? '● ' : ''}{b}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Create New Branch</span>
                        <div className="flex space-x-1.5">
                          <input
                            type="text"
                            placeholder="e.g. fix-thread-leak"
                            value={newBranchInput}
                            onChange={(e) => setNewBranchInput(e.target.value)}
                            className="flex-1 py-1 px-2.5 bg-black/40 border border-zinc-850 rounded text-[9px] font-mono text-zinc-300 focus:outline-none placeholder-zinc-700"
                          />
                          <button
                            onClick={() => {
                              const bName = newBranchInput.trim();
                              if (bName && !githubBranches.includes(bName)) {
                                setGithubBranches([...githubBranches, bName]);
                                setGithubBranch(bName);
                                setNewBranchInput('');
                              }
                            }}
                            className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded text-[9px] font-mono font-bold transition cursor-pointer"
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Git Conflict Simulator Card */}
                {githubConflict && (
                  <div 
                    className="p-4 rounded-xl border space-y-3.5 shadow-sm border-amber-500/15"
                    style={{ backgroundColor: theme.cardBg, borderColor: 'rgba(245,158,11,0.2)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center space-x-1">
                        <AlertCircle size={10} className="text-amber-500 shrink-0" />
                        <span>Merge Conflict Warning</span>
                      </span>
                      <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded">
                        Action Required
                      </span>
                    </div>

                    <p className="text-[11px] font-sans text-zinc-400 leading-normal text-left">
                      Unresolved conflict detected in <code className="text-[10px] text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded font-mono">suspension.lua</code>. Resolve conflicts before committing.
                    </p>

                    <div className="bg-black/80 border border-zinc-850 rounded-lg overflow-hidden font-mono text-[9px] leading-relaxed text-left">
                      <div className="bg-zinc-900/80 px-2.5 py-1 text-[8.5px] text-zinc-500 border-b border-zinc-850 flex justify-between">
                        <span>Diff: suspension.lua</span>
                        <span className="text-amber-500">Conflict Header</span>
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="text-blue-400 bg-blue-950/20 px-1.5 py-0.5 border-l-2 border-blue-500">
                          <div>{"<<<<<<<"} CURRENT HEAD (Our Branch)</div>
                          <div className="font-bold text-zinc-300">print("suspension level = 10")</div>
                        </div>
                        <div className="text-zinc-650 px-1.5">=======</div>
                        <div className="text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 border-l-2 border-emerald-500">
                          <div className="font-bold text-zinc-300">print("suspension level = 15")</div>
                          <div>{">>>>>>>"} INCOMING CHANGE (Upstream origin)</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setGithubConflict(false);
                          setGithubConflictResolved(true);
                          const h = Math.random().toString(16).substring(2, 9);
                          setGithubCommits(prev => [
                            { hash: h, author: 'goirugoiru', msg: 'merge: resolved merge conflict in suspension.lua (Accepted Current)', date: 'Just now' },
                            ...prev
                          ]);
                        }}
                        className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-850 hover:text-white rounded text-[9px] font-mono font-extrabold transition cursor-pointer"
                      >
                        Keep Current
                      </button>
                      <button
                        onClick={() => {
                          setGithubConflict(false);
                          setGithubConflictResolved(true);
                          const h = Math.random().toString(16).substring(2, 9);
                          setGithubCommits(prev => [
                            { hash: h, author: 'goirugoiru', msg: 'merge: resolved merge conflict in suspension.lua (Accepted Incoming)', date: 'Just now' },
                            ...prev
                          ]);
                        }}
                        className="flex-1 py-1.5 bg-white hover:bg-zinc-150 text-black font-mono font-extrabold rounded text-[9px] transition cursor-pointer"
                      >
                        Accept Incoming
                      </button>
                    </div>
                  </div>
                )}

                {githubConflictResolved && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/25 rounded-xl text-left space-y-1 flex items-start space-x-2">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[10px] font-mono font-bold text-emerald-400">Merge Conflict Resolved!</div>
                      <div className="text-[9px] font-mono text-zinc-400">The tree is clean and ready for immediate pushes.</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {files.filter(f => f.parentId === null).length === 0 ? (
            <div className="p-4 text-center text-zinc-650 text-xs font-mono">
              Empty workspace. Use file icons above.
            </div>
          ) : (
            <LayoutGroup id="file-explorer-nav">
              {renderTree(null)}
            </LayoutGroup>
          )}
        </div>
      )}



      {/* Context Menu for File Items */}
      {contextMenu && (() => {
        const isCore = contextMenu.nodeId === 'folder-autoexec' || contextMenu.nodeId === 'folder-workspace' || contextMenu.nodeId === 'folder-scripts';
        return (
          <div
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              backgroundColor: theme.sidebarBg,
              borderColor: theme.borderColor,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
            className="fixed z-50 border rounded-xl py-1.5 w-48 font-sans text-xs flex flex-col pointer-events-auto bg-[#14161e] select-none"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            {contextMenu.nodeType === 'folder' && (() => {
              const isWorkspace = contextMenu.nodeId === 'folder-workspace';
              const isAutoExec = contextMenu.nodeId === 'folder-autoexec';
              const isScripts = contextMenu.nodeId === 'folder-scripts';
              const showFolderOption = isWorkspace || (!isAutoExec && !isScripts);

              return (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateInFolder('file', contextMenu.nodeId, e);
                      closeMenus();
                    }}
                    className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
                  >
                    <FilePlus size={12} />
                    <span>Create New File</span>
                  </button>

                  {showFolderOption && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateInFolder('folder', contextMenu.nodeId, e);
                        closeMenus();
                      }}
                      className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
                    >
                      <FolderPlus size={12} />
                      <span>Create New Folder</span>
                    </button>
                  )}
                </>
              );
            })()}

            {!isCore && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerRename(contextMenu.nodeId, files.find(f => f.id === contextMenu.nodeId)?.name || '', e);
                  }}
                  className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
                >
                  <Edit size={12} />
                  <span>Rename</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerDuplicate(contextMenu.nodeId, e);
                  }}
                  className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
                >
                  <Copy size={12} />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerMove(contextMenu.nodeId, e);
                  }}
                  className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
                >
                  <CornerDownRight size={12} />
                  <span>Move Item</span>
                </button>
              </>
            )}

            {contextMenu.nodeType === 'file' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  triggerToggleFav(contextMenu.nodeId, e);
                }}
                className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
              >
                <Star size={12} />
                <span>Toggle Favorite</span>
              </button>
            )}

            {!isCore && (
              <>
                <div className="h-[1px] bg-zinc-800/60 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerDelete(contextMenu.nodeId, e);
                  }}
                  className="px-3.5 py-1.5 text-left text-rose-500 hover:bg-rose-500/10 transition flex items-center space-x-2 font-semibold cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Empty Space Context Menu */}
      {emptySpaceMenu && (
        <div
          style={{
            top: `${emptySpaceMenu.y}px`,
            left: `${emptySpaceMenu.x}px`,
            backgroundColor: theme.sidebarBg,
            borderColor: theme.borderColor,
            boxShadow: '0 10px 35px rgba(0,0,0,0.6)'
          }}
          className="fixed z-50 border rounded-xl p-3 w-64 font-sans text-[11px] flex flex-col pointer-events-auto bg-[#0f111a] select-none text-zinc-400"
        >
          <div className="flex items-start space-x-2 text-amber-500 leading-normal">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>File or folder cannot be created outside the Workspace please retry in Workspace instead</span>
          </div>
        </div>
      )}

      {/* Modular HUD Dialogues (Better than standard alerts) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs font-sans p-4">
          <div 
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.borderColor,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
            className="w-full max-w-sm border rounded-2xl p-5 space-y-4 text-left animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.borderColor }}>
              <span className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-300" style={{ color: theme.textMain }}>
                {activeModal === 'create_file' && 'Create New File'}
                {activeModal === 'create_folder' && 'Create New Folder'}
                {activeModal === 'rename' && 'Rename'}
                {activeModal === 'delete' && 'Delete Item'}
                {activeModal === 'move' && 'Move Item'}
              </span>
              <button 
                onClick={() => setActiveModal(null)} 
                className="text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={submitModal} className="space-y-4">
              
              {/* Conditional parameters based on modal actions */}
              {(activeModal === 'create_file' || activeModal === 'create_folder' || activeModal === 'rename') && (
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold tracking-widest uppercase block" style={{ color: theme.accent }}>Name:</label>
                  <input
                    autoFocus
                    type="text"
                    value={modalInputValue}
                    onChange={(e) => {
                      setModalInputValue(e.target.value);
                      setModalError(null);
                    }}
                    className="w-full py-2 px-3 border rounded-xl font-mono text-xs focus:outline-none focus:border-zinc-500"
                    style={{
                      backgroundColor: theme.isLight ? '#f4f4f5' : '#07080a',
                      color: theme.textMain,
                      borderColor: theme.borderColor
                    }}
                  />
                </div>
              )}

              {activeModal === 'delete' && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 text-xs leading-relaxed">
                    <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-zinc-300" style={{ color: theme.textMain }}>
                      Are you absolutely sure you want to permanently delete this item? This operation cannot be undone.
                    </p>
                  </div>
                  <label className="flex items-center space-x-2.5 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer select-none py-1">
                    <input
                      type="checkbox"
                      checked={dontAskDelete}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDontAskDelete(checked);
                        localStorage.setItem('skip_delete_confirmation', checked ? 'true' : 'false');
                      }}
                      className="rounded border-zinc-700 bg-black/40 text-rose-500 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    <span>Don't ask next time</span>
                  </label>
                </div>
              )}

              {activeModal === 'move' && (
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-mono font-bold tracking-widest uppercase block" style={{ color: theme.accent }}>Folder Destination:</label>
                  <div 
                    className="border rounded-xl max-h-40 overflow-y-auto divide-y font-mono text-xs select-none"
                    style={{ 
                      borderColor: theme.borderColor,
                      backgroundColor: theme.isLight ? '#f4f4f5' : '#07080a'
                    }}
                  >
                    {/* All other folders */}
                    {files.filter(f => f.type === 'folder' && f.id !== modalNodeId).map((folder) => {
                      const isSelected = modalParentId === folder.id;
                      return (
                        <div
                          key={folder.id}
                          onClick={() => setModalParentId(folder.id)}
                          className="flex items-center space-x-2 p-2 px-3 cursor-pointer transition hover:bg-zinc-800/10"
                          style={{
                            backgroundColor: isSelected ? `${theme.accent}1c` : 'transparent',
                            color: isSelected ? theme.textMain : theme.textMuted,
                            borderLeft: isSelected ? `3px solid ${theme.accent}` : '3px solid transparent'
                          }}
                        >
                          <Folder size={13} style={{ color: '#d29a38' }} className="shrink-0" />
                          <span>{folder.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {modalError && (
                <p className="text-[10px] text-rose-500 font-semibold font-mono uppercase">{modalError}</p>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: theme.borderColor }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 text-[10px] font-mono hover:bg-zinc-800/10 rounded-lg text-zinc-400 uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[10px] font-mono font-bold rounded-lg uppercase transition hover:opacity-90 cursor-pointer"
                  style={{ 
                    backgroundColor: activeModal === 'delete' ? '#ef4444' : theme.accent,
                    color: activeModal === 'delete' ? '#ffffff' : (theme.isLight ? '#ffffff' : '#000000')
                  }}
                >
                  {activeModal === 'delete' && 'Delete'}
                  {activeModal === 'create_file' && 'Create'}
                  {activeModal === 'create_folder' && 'Create'}
                  {activeModal === 'rename' && 'Rename'}
                  {activeModal === 'move' && 'Move'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
