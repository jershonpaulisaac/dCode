'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { UploadZone } from '@/components/upload-zone';
import { LoadingState } from '@/components/loading-state';
import { Dashboard } from '@/components/dashboard';
import type { AnalysisData } from '@/lib/types';

type View = 'landing' | 'loading' | 'results';

export default function Home() {
  const [view, setView] = useState<View>('landing');
  const [fileName, setFileName] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setFileName(file.name);
    setError(null);
    setView('loading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `Live analysis failed (${response.status})`);
      }

      const data: AnalysisData = await response.json();
      setAnalysisData(data);
      setView('results');
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Live analysis failed.');
      setView('landing');
    }
  };

  const handleReset = () => {
    setView('landing');
    setFileName('');
    setAnalysisData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-screen flex-col items-center justify-center px-6 pt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-12 text-center"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3.5 py-1.5 text-xs text-slate-400">
                <Sparkles className="h-3 w-3 text-slate-300" />
                Enterprise AI Code Intelligence
              </div>
              <h1 className="mb-4 font-sans text-4xl font-medium tracking-tight text-slate-100 sm:text-5xl md:text-6xl">
                Understand Any Codebase.
                <br />
                <span className="text-slate-400">Meet </span>
                <span className="font-semibold text-slate-200">CodeLens AI</span>
              </h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-500">
                Upload your project and let our enterprise AI agent generate a
                deep-dive analysis of architecture, tech stack, security
                posture, and project intent in seconds.
              </p>
            </motion.div>

            <UploadZone onFileSelected={handleFileSelected} />
            {error && (
              <p className="mt-5 max-w-2xl text-center text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-16 flex items-center gap-6 text-xs text-slate-600"
            >
              <span>Supports ZIP archives</span>
              <span className="h-3 w-px bg-slate-800" />
              <span>package.json parsing</span>
              <span className="h-3 w-px bg-slate-800" />
              <span>Config file analysis</span>
            </motion.div>
          </motion.main>
        )}

        {view === 'loading' && (
          <motion.main
            key="loading"
            className="flex min-h-screen flex-col items-center justify-center px-6 pt-20"
          >
            <LoadingState
              fileName={fileName}
            />
          </motion.main>
        )}

        {view === 'results' && analysisData && (
          <motion.main key="results" className="min-h-screen">
            <Dashboard data={analysisData} onReset={handleReset} />
          </motion.main>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-800/40 bg-slate-950/60 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-slate-600">
          <span>CodeLens AI</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Powered by IBM Bob
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
