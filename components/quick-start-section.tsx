'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Copy, Check, Zap, FileCode, ExternalLink } from 'lucide-react';
import type { SetupCommand, EntryPoint } from '@/lib/types';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="shrink-0 rounded p-1 text-slate-600 transition-colors hover:bg-slate-800 hover:text-slate-300"
      title="Copy command"
    >
      {copied
        ? <Check className="h-3 w-3 text-emerald-400" />
        : <Copy className="h-3 w-3" />
      }
    </button>
  );
}

interface QuickStartProps {
  setupCommands?: SetupCommand[];
  entryPoints?: EntryPoint[];
}

export function QuickStartSection({ setupCommands = [], entryPoints = [] }: QuickStartProps) {
  if (setupCommands.length === 0 && entryPoints.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-md">
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">Quick Start</p>
            <p className="text-xs text-slate-500">Detected setup commands and entry points</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Setup Commands */}
        {setupCommands.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Setup Commands
              </h3>
            </div>
            <div className="space-y-2">
              {setupCommands.map((cmd, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <code className="block font-mono text-xs text-emerald-300">{cmd.command}</code>
                    <p className="mt-1 text-[11px] text-slate-600">{cmd.description}</p>
                  </div>
                  <CopyButton text={cmd.command} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Entry Points */}
        {entryPoints.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FileCode className="h-3.5 w-3.5 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Entry Points
              </h3>
            </div>
            <div className="space-y-2">
              {entryPoints.map((ep, idx) => {
                const ext = ep.path.split('.').pop()?.toLowerCase() ?? '';
                const colorMap: Record<string, string> = {
                  tsx: '#3178c6', ts: '#3178c6',
                  jsx: '#f7df1e', js: '#f7df1e',
                  py: '#3776ab', go: '#00add8',
                };
                const color = colorMap[ext] ?? '#64748b';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  >
                    <span
                      className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <code className="block truncate font-mono text-xs text-slate-200">
                        {ep.path}
                      </code>
                      <p className="mt-1 text-[11px] text-slate-600">{ep.description}</p>
                    </div>
                    <CopyButton text={ep.path} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
