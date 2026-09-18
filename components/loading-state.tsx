'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Check } from 'lucide-react';

interface LoadingStateProps {
  fileName: string;
  onComplete: () => void;
  duration?: number;
}

const STATUS_MESSAGES = [
  'Uploading to Supabase...',
  'Authenticating IBM Bob...',
  'Agent analyzing architecture...',
  'Indexing dependencies and tech stack...',
  'Drafting summary...',
];

export function LoadingState({ fileName, onComplete, duration = 4500 }: LoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      const statusIndex = Math.min(
        Math.floor((pct / 100) * STATUS_MESSAGES.length),
        STATUS_MESSAGES.length - 1
      );
      setCurrentStatus(statusIndex);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-2xl flex-col items-center"
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10">
          <Terminal className="h-5 w-5 text-violet-400" />
          <motion.div
            className="absolute inset-0 rounded-xl border border-violet-500/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-zinc-200">IBM Bob is analyzing</p>
          <p className="text-xs text-zinc-500 truncate max-w-[200px]">{fileName}</p>
        </div>
      </div>

      <div className="w-full">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Processing</span>
          <span className="font-mono tabular-nums text-violet-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          >
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-violet-400/50 blur-sm" />
          </motion.div>
        </div>
      </div>

      <div className="mt-8 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 font-mono text-xs">
        <AnimatePresence mode="wait">
          {STATUS_MESSAGES.slice(0, currentStatus + 1).map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2.5 py-1.5"
            >
              {idx < currentStatus ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <motion.div
                  className="h-3.5 w-3.5 flex items-center justify-center"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                </motion.div>
              )}
              <span
                className={
                  idx < currentStatus ? 'text-zinc-600' : 'text-zinc-300'
                }
              >
                {msg}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
