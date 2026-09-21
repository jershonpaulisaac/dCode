'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload as UploadCloud, FileArchive, Package, FileJson, Github, ArrowRight, X } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onGithubUrl?: (url: string) => void;
}

const ACCEPTED_TYPES = '.zip,.json,.ts,.tsx,.js,.jsx,.css,.md,.sql,.py,.go,.java,application/zip,application/x-zip-compressed,text/plain,application/json';
const MAX_SIZE = 50 * 1024 * 1024;
const GITHUB_URL_RE = /^https?:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/i;

export function UploadZone({ onFileSelected, onGithubUrl }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'github'>('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > MAX_SIZE) {
        setError('File exceeds 50MB limit.');
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleGithubSubmit = useCallback(() => {
    const url = githubUrl.trim();
    if (!GITHUB_URL_RE.test(url)) {
      setError('Please enter a valid public GitHub repository URL (e.g. https://github.com/owner/repo)');
      return;
    }
    setError(null);
    onGithubUrl?.(url);
  }, [githubUrl, onGithubUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="w-full max-w-2xl"
    >
      {/* Tab switcher */}
      <div className="mb-3 flex items-center rounded-xl border border-slate-800 bg-slate-900/40 p-1">
        <button
          onClick={() => { setActiveTab('upload'); setError(null); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-all ${
            activeTab === 'upload'
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Upload File
        </button>
        <button
          onClick={() => { setActiveTab('github'); setError(null); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-all ${
            activeTab === 'github'
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Github className="h-3.5 w-3.5" />
          GitHub URL
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'upload' ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onClick={() => inputRef.current?.click()}
              className={`
                group relative cursor-pointer rounded-2xl border-2 border-dashed
                p-12 text-center transition-all duration-300
                ${isDragging
                  ? 'border-slate-500 bg-slate-800/10 scale-[1.01]'
                  : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                }
              `}
            >
              <div className={`
                mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl
                border transition-all duration-300
                ${isDragging
                  ? 'border-slate-600 bg-slate-800/30'
                  : 'border-slate-800 bg-slate-900 group-hover:border-slate-700'
                }
              `}>
                <UploadCloud className={`h-7 w-7 transition-colors duration-300 ${
                  isDragging ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
                }`} />
              </div>

              <p className="mb-1.5 font-sans text-base font-medium tracking-tight text-slate-100">
                {isDragging ? 'Drop your file here' : 'Drag & drop your codebase'}
              </p>
              <p className="mb-6 text-sm text-slate-500">
                or click to browse — ZIP, package.json, or config files
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {[
                  { icon: FileArchive, label: 'ZIP' },
                  { icon: Package, label: 'package.json' },
                  { icon: FileJson, label: 'Config' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-xs text-slate-400"
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="github"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 p-10"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
              <Github className="h-7 w-7 text-slate-400" />
            </div>

            <p className="mb-2 text-center text-base font-medium tracking-tight text-slate-100">
              Analyze a GitHub Repository
            </p>
            <p className="mb-6 text-center text-sm text-slate-500">
              Paste a public repository URL to ingest and analyze it instantly
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => { setGithubUrl(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleGithubSubmit()}
                  placeholder="https://github.com/owner/repository"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 pr-10 font-mono text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-slate-500"
                  spellCheck={false}
                />
                {githubUrl && (
                  <button
                    onClick={() => setGithubUrl('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={handleGithubSubmit}
                disabled={!githubUrl.trim()}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-900 transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyze
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-600">
              Only public repositories are supported · max 50MB default branch
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}

      <p className="mt-4 text-center text-xs text-slate-600">
        Files processed locally. Maximum size 50MB.
      </p>
    </motion.div>
  );
}
