import { CustomSyntaxProfile } from '../types';

const allExploitKeywords = [
  'getgenv', 'getrenv', 'getfenv', 'setfenv', 'getmetatable', 'setmetatable',
  'getrawmetatable', 'setrawmetatable', 'setreadonly', 'make_writeable',
  'make_writable', 'make_readonly', 'isreadonly', 'hookfunction',
  'hookmetamethod', 'restorefunction', 'restorehook', 'newcclosure',
  'checkcaller', 'getgc', 'getobjects', 'getnilinstances', 'getinstances',
  'getinfo', 'debug.getinfo', 'debug.getupvalue', 'debug.getupvalues',
  'debug.setupvalue', 'getupvalue', 'getupvalues', 'setupvalue',
  'getconstants', 'getconstant', 'setconstant', 'getproto', 'getprotos',
  'iscclosure', 'islclosure', 'isexecutorclosure', 'checkclosure',
  'identifyexecutor', 'getexecutorname', 'getexecutorversion', 'request',
  'http_request', 'http.request', 'syn.request', 'writefile', 'readfile',
  'appendfile', 'delfile', 'isfile', 'listfiles', 'makefolder', 'isfolder',
  'delfolder', 'loadfile', 'dofile', 'queue_on_teleport', 'queueonteleport',
  'setclipboard', 'toclipboard', 'getclipboard', 'fireclickdetector',
  'fireproximityprompt', 'firetouchinterest', 'firetouchtransmitter',
  'mouse1click', 'mouse1press', 'mouse1release', 'mouse2click',
  'mouse2press', 'mouse2release', 'mousemoveabs', 'mousemoverel',
  'keypress', 'keyrelease', 'iskeypressed', 'Drawing.new', 'Drawing.Fonts',
  'Drawing.clear', 'Drawing.remove', 'loadstring', 'getscripthash',
  'getscriptbytecode', 'decompile', 'dumpstring', 'gethui', 'protectgui',
  'gethiddenproperty', 'sethiddenproperty', 'getproperties', 'getcustomasset',
  'getsynasset', 'isnetworkowner', 'setsimulationradius', 'rconsoleprint',
  'rconsolewarn', 'rconsoleerr', 'rconsoleinput', 'rconsoleclear',
  'rconsolename', 'messagebox', 'setfpscap', 'getfpscap', 'cloneref',
  'compareinstances', 'typeof', 'newproxy', 'getcallingscript',
  'getnamecallmethod', 'namecall', '__namecall', '__index', '__newindex',
  'rawget', 'rawset', 'rawget', 'rawset'
];

export const defaultSyntaxes: CustomSyntaxProfile[] = [
  {
    id: 'rbx-luau',
    name: 'Normal Luau',
    keywords: [
      'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
      'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
      'until', 'while', 'self', 'type', 'export', 'continue'
    ],
    functions: [
      'print', 'warn', 'error', 'assert', 'pairs', 'ipairs', 'next', 'select', 
      'pcall', 'xpcall', 'require', 'wait', 'delay', 'tick', 'spawn', 'task',
      'Workspace', 'game', 'script', 'Instance', 'Vector3', 'CFrame', 'UDim2', 'Color3',
      'Enum', 'Players', 'ReplicatedStorage', 'ServerScriptService', 'HttpService',
      'TweenService', 'RunService', 'Debris', 'UserInputService',
      ...allExploitKeywords
    ],
    colors: {
      background: '#0a0b10', // Modern soft space midnight
      keywords: '#f43f5e', // Vibrant rose red
      functions: '#38bdf8', // High-contrast sky blue (super legible)
      strings: '#34d399', // Clean emerald mint
      numbers: '#fbbf24', // Amber gold
      comments: '#64748b', // Soft slate gray
      operators: '#cbd5e1', // Light slate
      accent: '#38bdf8'
    }
  },
  {
    id: 'exploit-luau',
    name: 'Custom Luau',
    keywords: [
      'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
      'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
      'until', 'while', 'self', 'type', 'export', 'continue'
    ],
    functions: [
      'print', 'warn', 'error', 'assert', 'pairs', 'ipairs', 'next', 'select', 
      'pcall', 'xpcall', 'require', 'wait', 'delay', 'tick', 'spawn',
      ...allExploitKeywords
    ],
    colors: {
      background: '#09090b', // Deep carbon black
      keywords: '#c084fc', // Elegant lavender purple
      functions: '#4ade80', // Vibrant emerald green
      strings: '#fb923c', // Pastel soft orange
      numbers: '#facc15', // Sunflower bright yellow
      comments: '#71717a', // Balanced zinc comment gray
      operators: '#e4e4e7', // High contrast silver white
      accent: '#c084fc'
    }
  }
];

