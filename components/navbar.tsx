'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function Navbar() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80 light:border-slate-200/80 light:bg-white/90"
      style={{
        borderBottomColor: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(226,232,240,0.8)',
        backgroundColor: isDark ? 'rgba(2,6,23,0.85)' : 'rgba(255,255,255,0.92)',
      }}
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
              backgroundImage: isDark
                ? 'linear-gradient(to right, #fff, #cbd5e1, #67e8f9)'
                : 'linear-gradient(to right, #0f172a, #334155, #0891b2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CodeLens AI
          </span>
        </a>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <span
            className="hidden items-center gap-1.5 text-xs sm:inline-flex"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
          >
            Powered by{' '}
            <span style={{ color: isDark ? '#cbd5e1' : '#475569', fontWeight: 500 }}>
              IBM Bob
            </span>
          </span>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative flex h-8 w-14 items-center rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            style={{
              borderColor: isDark ? '#334155' : '#cbd5e1',
              backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
            }}
          >
            {/* Track fill */}
            <span
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #0ea5e9 0%, #1e293b 100%)'
                  : 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)',
                opacity: 0.35,
              }}
            />
            {/* Thumb */}
            <motion.span
              layout
              animate={{ x: isDark ? 28 : 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-md"
              style={{ backgroundColor: isDark ? '#0ea5e9' : '#f59e0b' }}
            >
              {isDark
                ? <Moon className="h-3 w-3 text-white" />
                : <Sun className="h-3 w-3 text-white" />
              }
            </motion.span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
