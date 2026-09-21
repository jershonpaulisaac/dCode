'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { UploadZone } from '@/components/upload-zone';
import { LoadingState } from '@/components/loading-state';
import { Dashboard } from '@/components/dashboard';
import { useTheme } from '@/lib/theme-context';
import type { AnalysisData } from '@/lib/types';

type View = 'landing' | 'loading' | 'results';

export default function Home() {
  const { theme } = useTheme();
  const [view, setView] = useState<View>('landing');
  const [fileName, setFileName] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (fetchFn: () => Promise<Response>, label: string) => {
    setFileName(label);
    setError(null);
    setView('loading');
    try {
      const response = await fetchFn();
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `Analysis failed (${response.status})`);
      }
      const data: AnalysisData = await response.json();
      setAnalysisData(data);
      setView('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed.');
      setView('landing');
    }
  };

  const handleFileSelected = (file: File) => {
    runAnalysis(() => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch('/api/analyze', { method: 'POST', body: formData });
    }, file.name);
  };

  const handleGithubUrl = (url: string) => {
    const label = url.replace('https://github.com/', '');
    runAnalysis(
      () => fetch('/api/github-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }),
      label,
    );
  };

  const handleReset = () => {
    setView('landing');
    setFileName('');
    setAnalysisData(null);
    setError(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
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
              <h1 className={`mb-4 font-sans text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                Understand Any Codebase.
                <br />
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Meet </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>CodeLens AI</span>
              </h1>
              <p className={`mx-auto max-w-xl text-base leading-relaxed ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                Upload a ZIP archive or paste a public GitHub URL to generate a
                deep-dive analysis of architecture, tech stack, security
                posture, and project intent in seconds.
              </p>
            </motion.div>

            <UploadZone
              onFileSelected={handleFileSelected}
              onGithubUrl={handleGithubUrl}
            />
            {error && (
              <p className="mt-5 max-w-2xl text-center text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className={`mt-16 flex items-center gap-6 text-xs ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}
            >
              <span>ZIP archives</span>
              <span className={`h-3 w-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <span>GitHub URLs</span>
              <span className={`h-3 w-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <span>Config files</span>
            </motion.div>
          </motion.main>
        )}

        {view === 'loading' && (
          <motion.main
            key="loading"
            className="flex min-h-screen flex-col items-center justify-center px-6 pt-20"
          >
            <LoadingState fileName={fileName} />
          </motion.main>
        )}

        {view === 'results' && analysisData && (
          <motion.main key="results" className="min-h-screen">
            <Dashboard data={analysisData} onReset={handleReset} />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
