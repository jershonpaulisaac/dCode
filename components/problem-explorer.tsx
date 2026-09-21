'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Copy,
  Check,
  ShieldAlert,
  TriangleAlert,
  Sparkles,
  FileCode,
  X,
} from 'lucide-react';
import type { CodeMistake, SecurityVulnerability } from '@/lib/types';

type Severity = 'low' | 'medium' | 'high' | 'critical';

const SEVERITY_STYLES: Record<Severity, { badge: string; icon: string; border: string; bg: string }> = {
  critical: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: 'text-red-400',
    border: 'border-red-500/25',
    bg: 'bg-red-500/5',
  },
  high: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    icon: 'text-orange-400',
    border: 'border-orange-500/25',
    bg: 'bg-orange-500/5',
  },
  medium: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: 'text-amber-400',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/5',
  },
  low: {
    badge: 'bg-slate-600/20 text-slate-400 border-slate-600/30',
    icon: 'text-slate-400',
    border: 'border-slate-700/25',
    bg: 'bg-slate-800/20',
  },
};

const TYPE_META = {
  mistake: { icon: TriangleAlert, label: 'Code Mistake', color: 'text-amber-400' },
  vulnerability: { icon: ShieldAlert, label: 'Security Vulnerability', color: 'text-red-400' },
  antiPattern: { icon: Sparkles, label: 'Anti-Pattern', color: 'text-violet-400' },
};

interface Problem {
  id: string;
  type: keyof typeof TYPE_META;
  title: string;
  severity: Severity;
  description: string;
  file?: string;
  line?: number;
  recommendation?: string;
}

function buildRecommendation(p: Problem): string {
  if (p.recommendation) return p.recommendation;
  switch (p.type) {
    case 'vulnerability':
      return `Review all occurrences in ${p.file ?? 'the codebase'} and sanitize inputs, enforce proper authentication, and apply the principle of least privilege. Audit dependencies for known CVEs and update to patched versions.`;
    case 'mistake':
      return `Locate and fix this issue in ${p.file ?? 'the affected file'}${p.line ? ` around line ${p.line}` : ''}. Add unit tests covering the edge case described above to prevent regressions.`;
    case 'antiPattern':
      return `Refactor the code to follow established design principles (e.g., SOLID, DRY). Extract repeated logic into shared utilities and ensure clear separation of concerns.`;
    default:
      return 'Review and address the identified issue following your project coding standards.';
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/50 px-2.5 py-1.5 text-[11px] text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
      title="Copy recommendation"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy fix'}
    </button>
  );
}

function ProblemRow({ problem, index }: { problem: Problem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const styles = SEVERITY_STYLES[problem.severity];
  const meta = TYPE_META[problem.type];
  const Icon = meta.icon;
  const recommendation = buildRecommendation(problem);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`overflow-hidden rounded-xl border transition-all ${expanded ? styles.border + ' ' + styles.bg : 'border-slate-800 bg-slate-900/30'}`}
      >
        {/* Row Header */}
        <button
          className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-800/30"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-200">{problem.title}</span>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles.badge}`}>
                {problem.severity}
              </span>
              <span className={`text-[10px] uppercase tracking-wider ${meta.color}`}>
                {meta.label}
              </span>
            </div>
            {problem.file && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <FileCode className="h-3 w-3 text-slate-600" />
                <code className="font-mono text-[11px] text-slate-500">
                  {problem.file}{problem.line ? `:${problem.line}` : ''}
                </code>
              </div>
            )}
          </div>
          <div className="shrink-0 self-center">
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Expanded Detail */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-800/60 px-4 pb-5 pt-4">
                <p className="mb-4 text-xs leading-relaxed text-slate-400">{problem.description}</p>
                <div className="rounded-lg border border-slate-700/50 bg-slate-950/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Recommended Fix
                    </span>
                    <div className="flex items-center gap-2">
                      <CopyButton text={recommendation} />
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1.5 text-[11px] text-cyan-400 transition-colors hover:bg-cyan-500/10"
                      >
                        Full detail
                      </button>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{recommendation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Full Detail Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${styles.icon}`} />
                    <h3 className="text-sm font-semibold text-slate-100">{problem.title}</h3>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles.badge}`}>
                      {problem.severity}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                    {problem.file && (
                      <code className="font-mono text-[11px] text-slate-500">
                        {problem.file}{problem.line ? `:${problem.line}` : ''}
                      </code>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Why This Is an Issue
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-300">{problem.description}</p>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      How to Rectify It
                    </h4>
                    <CopyButton text={recommendation} />
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm leading-relaxed text-slate-200">{recommendation}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Quick checklist
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                      Identify all occurrences using your IDE or grep across the codebase
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                      Apply the fix in a dedicated branch and open a pull request for review
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                      Add or update unit/integration tests to cover the affected behaviour
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                      Run your linter and security scanner before merging
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface ProblemExplorerProps {
  mistakes: CodeMistake[];
  antiPatterns: CodeMistake[];
  vulnerabilities: SecurityVulnerability[];
}

export function ProblemExplorer({ mistakes, antiPatterns, vulnerabilities }: ProblemExplorerProps) {
  const [filter, setFilter] = useState<'all' | keyof typeof TYPE_META>('all');

  const allProblems: Problem[] = [
    ...vulnerabilities.map((v, i) => ({
      id: `vuln-${i}`,
      type: 'vulnerability' as const,
      title: v.title,
      severity: v.severity as Severity,
      description: v.description,
      file: v.file,
      line: v.line,
    })),
    ...mistakes.map((m, i) => ({
      id: `mistake-${i}`,
      type: 'mistake' as const,
      title: m.title,
      severity: m.severity as Severity,
      description: m.description,
      file: m.file,
      line: m.line,
    })),
    ...antiPatterns.map((a, i) => ({
      id: `anti-${i}`,
      type: 'antiPattern' as const,
      title: a.title,
      severity: a.severity as Severity,
      description: a.description,
      file: a.file,
      line: a.line,
    })),
  ].sort((a, b) => {
    const order: Severity[] = ['critical', 'high', 'medium', 'low'];
    return order.indexOf(a.severity) - order.indexOf(b.severity);
  });

  if (allProblems.length === 0) return null;

  const filtered = filter === 'all' ? allProblems : allProblems.filter((p) => p.type === filter);

  const counts = {
    all: allProblems.length,
    vulnerability: allProblems.filter((p) => p.type === 'vulnerability').length,
    mistake: allProblems.filter((p) => p.type === 'mistake').length,
    antiPattern: allProblems.filter((p) => p.type === 'antiPattern').length,
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-200">Problem Explorer</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Click any item to expand details and copy a recommended fix
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'vulnerability', 'mistake', 'antiPattern'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
                filter === f
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-700/40 text-slate-500 hover:text-slate-300'
              }`}
            >
              {f === 'all' ? 'All' : TYPE_META[f].label}
              <span className="ml-1 text-slate-600">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {filtered.map((problem, index) => (
          <ProblemRow key={problem.id} problem={problem} index={index} />
        ))}
      </div>
    </div>
  );
}
