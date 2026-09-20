'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Sparkles, TriangleAlert } from 'lucide-react';
import type { CodeMistake, SecurityVulnerability } from '@/lib/types';

interface AuditInfographicsProps {
  mistakes: CodeMistake[];
  antiPatterns: CodeMistake[];
  vulnerabilities: SecurityVulnerability[];
}

export function AuditInfographics({ mistakes, antiPatterns, vulnerabilities }: AuditInfographicsProps) {
  const cards = [
    { label: 'Code Mistakes', value: mistakes.length, icon: TriangleAlert, color: 'bg-amber-400', text: 'text-amber-300' },
    { label: 'Anti-patterns', value: antiPatterns.length, icon: Sparkles, color: 'bg-violet-400', text: 'text-violet-300' },
    { label: 'Security Risks', value: vulnerabilities.length, icon: ShieldAlert, color: 'bg-red-400', text: 'text-red-300' },
  ];
  const max = Math.max(...cards.map((card) => card.value), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-7 backdrop-blur-md">
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-300">Audit Infographics</p>
        <p className="mt-1 text-xs text-slate-500">Evidence-backed findings from the uploaded source</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color, text }) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-slate-400"><Icon className={`h-4 w-4 ${text}`} />{label}</span>
              <span className={`font-mono text-xl font-semibold ${text}`}>{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                className={`h-full rounded-full ${color}`}
                transition={{ duration: 0.7 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
