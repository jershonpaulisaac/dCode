'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, File, Folder } from 'lucide-react';

interface ProjectExplorerProps {
  fileTree: string;
}

interface TreeEntry {
  name: string;
  path: string;
  depth: number;
  isFolder: boolean;
}

function parseTree(fileTree: string): TreeEntry[] {
  return fileTree
    .split('\n')
    .map((line) => line.replace(/^[\s│├└─]+/, '').trim())
    .filter(Boolean)
    .map((name, index, entries) => {
      const original = fileTree.split('\n')[index] || '';
      const depth = Math.max(0, Math.floor((original.search(/[^\s│├└─]/) - 1) / 4));
      const isFolder = name.endsWith('/') || entries[index + 1]?.startsWith(`${name}/`);
      return { name: name.replace(/\/$/, ''), path: name.replace(/\/$/, ''), depth, isFolder };
    });
}

export function ProjectExplorer({ fileTree }: ProjectExplorerProps) {
  const entries = useMemo(() => parseTree(fileTree), [fileTree]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-xs font-medium text-slate-300">Project Explorer</p>
          <p className="mt-0.5 text-[10px] text-slate-600">VS Code-style local file map</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-600">Explorer</span>
      </div>
      <div className="max-h-80 overflow-auto py-2 font-mono text-xs">
        {entries.map((entry, index) => {
          const hidden = entries.slice(0, index).some(
            (parent) => parent.isFolder && entry.depth > parent.depth && collapsed.has(parent.path)
          );
          if (hidden) return null;
          const Icon = entry.isFolder ? Folder : File;
          return (
            <div
              key={`${entry.path}-${index}`}
              className="group flex items-center gap-1.5 px-3 py-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-200"
              style={{ paddingLeft: `${12 + entry.depth * 16}px` }}
            >
              {entry.isFolder ? (
                <button onClick={() => toggleFolder(entry.path)} aria-label={`Toggle ${entry.name}`}>
                  {collapsed.has(entry.path) ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              ) : <span className="w-3.5" />}
              <Icon className={`h-3.5 w-3.5 ${entry.isFolder ? 'text-cyan-400' : 'text-slate-600'}`} />
              <span className="truncate">{entry.name}</span>
              {!entry.isFolder && (
                <a
                  href={`vscode://file/${encodeURIComponent(entry.path).replace(/%2F/g, '/')}`}
                  className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                  title="Open in Editor"
                  aria-label={`Open ${entry.name} in Editor`}
                >
                  <span className="inline-flex items-center gap-1 rounded border border-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-400">
                    <ExternalLink className="h-3 w-3" />
                    Open in Editor
                  </span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
