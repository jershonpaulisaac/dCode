'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CloudUpload as UploadCloud, FileArchive, Package, FileJson } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED_TYPES = '.zip,.json,.ts,.tsx,.js,.jsx,.css,.md,.sql,.py,.go,.java,application/zip,application/x-zip-compressed,text/plain,application/json';
const MAX_SIZE = 50 * 1024 * 1024;

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="w-full max-w-2xl"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          group relative cursor-pointer rounded-2xl border-2 border-dashed
          p-12 text-center transition-all duration-300
          ${
            isDragging
              ? 'border-slate-500 bg-slate-800/10 scale-[1.01]'
              : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
          }
        `}
      >
        <div
          className={`
            mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl
            border transition-all duration-300
            ${
              isDragging
                ? 'border-slate-600 bg-slate-800/30'
                : 'border-slate-800 bg-slate-900 group-hover:border-slate-700'
            }
          `}
        >
          <UploadCloud
            className={`h-7 w-7 transition-colors duration-300 ${
              isDragging ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
            }`}
          />
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

      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}

      <p className="mt-4 text-center text-xs text-slate-600">
        Files are processed securely. Maximum size 50MB.
      </p>
    </motion.div>
  );
}
