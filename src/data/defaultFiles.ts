import { FileNode } from '../types';

export const defaultFiles: FileNode[] = [
  {
    id: 'script-lua',
    name: 'script.lua',
    type: 'file',
    parentId: null,
    language: 'luau',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    size: 58,
    content: `-- [
            Start your journey, 
           - Incognito Dev Team
-- ]
`
  }
];
