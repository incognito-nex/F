import { FileNode } from '../types';

const now = new Date().toISOString();

export const defaultFiles: FileNode[] = [
  {
    id: 'folder-autoexec',
    name: 'AutoExec',
    type: 'folder',
    parentId: null,
    createdAt: now,
    updatedAt: now,
    size: 0
  },
  {
    id: 'folder-workspace',
    name: 'Workspace',
    type: 'folder',
    parentId: null,
    createdAt: now,
    updatedAt: now,
    size: 0
  },
  {
    id: 'folder-scripts',
    name: 'Scripts',
    type: 'folder',
    parentId: null,
    createdAt: now,
    updatedAt: now,
    size: 0
  },
  {
    id: 'welcome-lua',
    name: 'welcome.lua',
    type: 'file',
    parentId: 'folder-workspace',
    language: 'lua',
    createdAt: now,
    updatedAt: now,
    size: 58,
    content: `-- [
            Start your journey, 
           - Incognito Dev Team
-- ]
`
  }
];
