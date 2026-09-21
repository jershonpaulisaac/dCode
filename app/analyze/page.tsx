'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { UploadZone } from '@/components/upload-zone';
import { LoadingState } from '@/components/loading-state';
import { Dashboard } from '@/components/dashboard';
import type { AnalysisData } from '@/lib/types';

type View = 'landing' | 'loading' | 'results';

export default function AnalyzePage() {
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
    <div className="min-h-screen bg-[#09090b] text-slate-100">
      <Navbar />

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-screen flex-col items-center justify-center px-6 pt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-10 text-center"
            >
              <h1 className="mb-3 font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Run an analysis
              </h1>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500">
                Upload a ZIP archive or paste a public GitHub URL. Results appear
                in seconds — no account required.
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

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 text-xs text-zinc-700"
            >
              Files are processed server-side and never stored permanently.
            </motion.p>
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
