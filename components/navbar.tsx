'use client';

import { motion } from 'framer-motion';
import { ScanEye } from 'lucide-react';

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
            <ScanEye className="h-4 w-4 text-violet-400" />
          </div>
          <span className="font-sans text-sm font-medium tracking-tight text-zinc-100">
            CodeLens <span className="text-violet-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden text-xs text-zinc-500 sm:inline">
            Powered by{' '}
            <span className="font-medium text-zinc-300">IBM Bob</span>
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
            <span className="text-[10px] font-medium text-zinc-400">B</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
