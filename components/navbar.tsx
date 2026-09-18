'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="dCode" className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-6">
          <span className="hidden text-xs text-slate-500 sm:inline">
            Powered by{' '}
            <span className="font-medium text-slate-300">IBM Bob</span>
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
            <span className="text-[10px] font-medium text-slate-400">B</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
