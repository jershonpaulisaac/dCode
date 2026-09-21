'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Copy,
  Check,
  X,
  FileCode,
  Search,
} from 'lucide-react';

// ─── File extension → language + color ───────────────────────────────────────
const EXT_META: Record<string, { lang: string; color: string }> = {
  ts:   { lang: 'typescript', color: '#3178c6' },
  tsx:  { lang: 'typescript', color: '#3178c6' },
  js:   { lang: 'javascript', color: '#f7df1e' },
  jsx:  { lang: 'javascript', color: '#f7df1e' },
  json: { lang: 'json',       color: '#fbbf24' },
  css:  { lang: 'css',        color: '#38bdf8' },
  md:   { lang: 'markdown',   color: '#94a3b8' },
  sql:  { lang: 'sql',        color: '#34d399' },
  py:   { lang: 'python',     color: '#3776ab' },
  go:   { lang: 'go',         color: '#00add8' },
  java: { lang: 'java',       color: '#ed8b00' },
  yaml: { lang: 'yaml',       color: '#f472b6' },
  yml:  { lang: 'yaml',       color: '#f472b6' },
  toml: { lang: 'toml',       color: '#94a3b8' },
  sh:   { lang: 'bash',       color: '#a3e635' },
  html: { lang: 'html',       color: '#f97316' },
  env:  { lang: 'plaintext',  color: '#64748b' },
};

function getExtMeta(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_META[ext] ?? { lang: 'plaintext', color: '#64748b' };
}

// ─── Minimal syntax highlighter (no external deps) ───────────────────────────
const TOKEN_PATTERNS: [RegExp, string][] = [
  // Strings
  [/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, 'text-emerald-300'],
  // Line comments
  [/\/\/.*$/gm, 'text-slate-500'],
  // Block comments
  [/\/\*[\s\S]*?\*\//g, 'text-slate-500'],
  // Numbers
  [/\b\d+\.?\d*\b/g, 'text-amber-300'],
  // Keywords
  [/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements|async|await|try|catch|throw|new|null|undefined|true|false|default|case|switch|break|continue|void|typeof|instanceof|in|of|delete|yield|static|public|private|protected|readonly|enum|namespace|module|declare|abstract|override|as|is)\b/g, 'text-violet-400'],
  // JSX/HTML tags
  [/<\/?[A-Z][A-Za-z0-9]*/g, 'text-cyan-400'],
  // Decorators
  [/@\w+/g, 'text-pink-400'],
];

function highlightCode(code: string): React.ReactNode[] {
  // Simple line-by-line output; we do character-level coloring via spans
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    // Apply token patterns in order, track covered ranges
    interface Span { start: number; end: number; cls: string }
    const spans: Span[] = [];

    for (const [pattern, cls] of TOKEN_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        // Only add if no overlap
        const overlaps = spans.some(s => s.start < end && s.end > start);
        if (!overlaps) spans.push({ start, end, cls });
      }
    }
    spans.sort((a, b) => a.start - b.start);

    // Build result segments
    const segments: React.ReactNode[] = [];
    let cursor = 0;
    for (const span of spans) {
      if (span.start > cursor) {
        segments.push(<span key={`plain-${cursor}`} className="text-slate-300">{line.slice(cursor, span.start)}</span>);
      }
      segments.push(<span key={`tok-${span.start}`} className={span.cls}>{line.slice(span.start, span.end)}</span>);
      cursor = span.end;
    }
    if (cursor < line.length) {
      segments.push(<span key={`end-${cursor}`} className="text-slate-300">{line.slice(cursor)}</span>);
    }
    if (segments.length === 0) {
      segments.push(<span key="empty" className="text-slate-300">{' '}</span>);
    }

    return (
      <div key={lineIdx} className="flex min-w-0">
        <span className="mr-4 w-8 shrink-0 select-none text-right font-mono text-[10px] text-slate-700 leading-5">
          {lineIdx + 1}
        </span>
        <span className="min-w-0 font-mono text-[11px] leading-5 break-all">{segments}</span>
      </div>
    );
  });
}

// ─── Tree parsing ─────────────────────────────────────────────────────────────
interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  depth: number;
}

function buildTree(paths: string[]): TreeNode[] {
  const root: Record<string, TreeNode> = {};

  for (const fullPath of paths) {
    const parts = fullPath.replace(/^\//, '').split('/');
    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = i === parts.length - 1;

      if (!root[currentPath]) {
        root[currentPath] = {
          name: part,
          path: fullPath,
          isFolder: !isLast,
          children: [],
          depth: i,
        };
        if (parentPath && root[parentPath]) {
          root[parentPath].children.push(root[currentPath]);
          root[parentPath].isFolder = true;
        }
      }
    }
  }

  // Return top-level nodes sorted: folders first then files
  return Object.values(root)
    .filter(n => n.depth === 0)
    .sort((a, b) => {
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

function sortChildren(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// ─── Tree row ─────────────────────────────────────────────────────────────────
function TreeRow({
  node,
  selected,
  hasContent,
  onSelect,
}: {
  node: TreeNode;
  selected: string | null;
  hasContent: boolean;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = !node.isFolder && selected === node.path;
  const ext = getExtMeta(node.name);

  return (
    <>
      <div
        className={`group flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
          isSelected
            ? 'bg-slate-800 text-slate-100'
            : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
        } ${node.isFolder ? 'cursor-pointer' : hasContent ? 'cursor-pointer' : 'cursor-default opacity-40'}`}
        style={{ paddingLeft: `${8 + node.depth * 14}px` }}
        onClick={() => {
          if (node.isFolder) setOpen(o => !o);
          else if (hasContent) onSelect(node.path);
        }}
      >
        {node.isFolder ? (
          open
            ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
            : <Folder className="h-3.5 w-3.5 shrink-0 text-cyan-400/50" />
        ) : (
          <FileCode
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: ext.color + 'cc' }}
          />
        )}
        <span className="truncate text-xs">{node.name}</span>
        {!node.isFolder && hasContent && (
          <span
            className="ml-auto shrink-0 rounded px-1 py-0.5 text-[9px] uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100"
            style={{ background: ext.color + '22', color: ext.color }}
          >
            {ext.lang}
          </span>
        )}
      </div>
      {node.isFolder && open && (
        <div>
          {sortChildren(node.children).map(child => (
            <TreeRow
              key={child.path + child.name}
              node={child}
              selected={selected}
              hasContent={hasContent}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Code viewer ──────────────────────────────────────────────────────────────
function CodeViewer({
  path,
  content,
  onClose,
}: {
  path: string;
  content: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const ext = getExtMeta(path);
  const lineCount = content.split('\n').length;
  const highlighted = useMemo(() => highlightCode(content), [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="h-3.5 w-3.5 shrink-0" style={{ color: ext.color }} />
          <span className="truncate font-mono text-xs text-slate-300">{path.split('/').slice(-2).join('/')}</span>
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
            style={{ background: ext.color + '22', color: ext.color }}
          >
            {ext.lang}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">{lineCount} lines</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800/50 px-2 py-1 text-[10px] text-slate-400 transition-colors hover:text-slate-200"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-800 hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto bg-[#0a0f1a] p-4">
        <div className="space-y-0">{highlighted}</div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface LiveFileExplorerProps {
  fileTree: string;
  fileContents?: Record<string, string>;
}

export function LiveFileExplorer({ fileTree, fileContents = {} }: LiveFileExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const allPaths = useMemo(
    () => fileTree.split('\n').map(l => l.trim()).filter(Boolean),
    [fileTree]
  );

  const filteredPaths = useMemo(() => {
    if (!search.trim()) return allPaths;
    const q = search.toLowerCase();
    return allPaths.filter(p => p.toLowerCase().includes(q));
  }, [allPaths, search]);

  const treeNodes = useMemo(() => buildTree(filteredPaths), [filteredPaths]);

  const selectedContent = selectedFile ? (fileContents[selectedFile] ?? null) : null;

  const handleSelect = useCallback((path: string) => {
    if (fileContents[path] !== undefined) setSelectedFile(path);
  }, [fileContents]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-slate-200">Live File Explorer</p>
          <p className="mt-0.5 text-[10px] text-slate-600">
            {allPaths.length} files · click to inspect source
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-700">Explorer</span>
      </div>

      <div className="flex" style={{ height: 420 }}>
        {/* Sidebar */}
        <div className="flex w-56 shrink-0 flex-col border-r border-slate-800">
          {/* Search */}
          <div className="border-b border-slate-800 px-2 py-2">
            <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1.5">
              <Search className="h-3 w-3 shrink-0 text-slate-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter files…"
                className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="shrink-0 text-slate-600 hover:text-slate-400">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto py-1">
            {treeNodes.map(node => (
              <TreeRow
                key={node.path + node.name}
                node={node}
                selected={selectedFile}
                hasContent={Object.keys(fileContents).length > 0}
                onSelect={handleSelect}
              />
            ))}
            {treeNodes.length === 0 && (
              <p className="px-4 py-6 text-center text-[11px] text-slate-700">No files match</p>
            )}
          </div>
        </div>

        {/* Code panel */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedContent !== null ? (
              <motion.div
                key={selectedFile}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <CodeViewer
                  path={selectedFile!}
                  content={selectedContent}
                  onClose={() => setSelectedFile(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full flex-col items-center justify-center gap-3 text-center"
              >
                <FileCode className="h-8 w-8 text-slate-800" />
                <p className="text-xs text-slate-700">
                  {Object.keys(fileContents).length > 0
                    ? 'Select a file to view its source'
                    : 'Upload a ZIP to enable code preview'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
