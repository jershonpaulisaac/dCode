'use client';

import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/85 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Brand */}
        <a href="/" className="group flex items-center gap-2.5">
          <span className="flex h-6 w-1.5 flex-col gap-0.5">
            <span className="flex-1 rounded-full bg-cyan-400" />
            <span className="flex-1 rounded-full bg-cyan-600" />
            <span className="h-1 rounded-full bg-cyan-800" />
          </span>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{
              backgroundImage: 'linear-gradient(to right, #fff, #cbd5e1, #67e8f9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CodeLens AI
          </span>
        </a>

        {/* IBM Bob badge */}
        <span className="hidden items-center gap-1.5 text-xs text-slate-600 sm:inline-flex">
          Powered by{' '}
          <span className="font-medium text-slate-400">IBM Bob</span>
        </span>
      </div>
    </motion.nav>
  );
}
