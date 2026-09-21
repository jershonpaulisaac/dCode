'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Sparkles, TriangleAlert, AlertCircle } from 'lucide-react';
import type { CodeMistake, SecurityVulnerability } from '@/lib/types';

interface AuditInfographicsProps {
  mistakes: CodeMistake[];
  antiPatterns: CodeMistake[];
  vulnerabilities: SecurityVulnerability[];
}

type Severity = 'critical' | 'high' | 'medium' | 'low';

const SEV_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

const SEV_STYLES: Record<Severity, { bar: string; text: string; dot: string }> = {
  critical: { bar: 'bg-red-500', text: 'text-red-400', dot: 'bg-red-500' },
  high: { bar: 'bg-orange-500', text: 'text-orange-400', dot: 'bg-orange-500' },
  medium: { bar: 'bg-amber-500', text: 'text-amber-400', dot: 'bg-amber-500' },
  low: { bar: 'bg-slate-500', text: 'text-slate-400', dot: 'bg-slate-500' },
};

function severityCounts(items: { severity: string }[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const item of items) {
    const s = item.severity as Severity;
    if (s in counts) counts[s]++;
  }
  return counts;
}

function SeverityBreakdown({
  counts,
  total,
  delay = 0,
}: {
  counts: Record<Severity, number>;
  total: number;
  delay?: number;
}) {
  if (total === 0) return <p className="text-xs text-slate-600 italic">None detected</p>;
  return (
    <div className="space-y-2 pt-1">
      {SEV_ORDER.filter((s) => counts[s] > 0).map((sev, i) => {
        const pct = (counts[sev] / total) * 100;
        return (
          <div key={sev} className="flex items-center gap-2">
            <span className={`w-14 shrink-0 text-[10px] font-medium uppercase tracking-wider ${SEV_STYLES[sev].text}`}>
              {sev}
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: delay + i * 0.07, ease: 'easeOut' }}
                className={`absolute left-0 top-0 h-full rounded-full ${SEV_STYLES[sev].bar}`}
              />
            </div>
            <span className={`w-5 shrink-0 text-right font-mono text-[11px] tabular-nums ${SEV_STYLES[sev].text}`}>
              {counts[sev]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  segments,
  size = 64,
  delay = 0,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  delay?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = (size / 2) * 0.72;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  let cumulativeOffset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e293b" strokeWidth={size * 0.13} />
      {segments
        .filter((s) => s.value > 0)
        .map((seg, i) => {
          const dash = (seg.value / total) * circumference;
          const gap = circumference - dash;
          const offset = -cumulativeOffset;
          cumulativeOffset += dash;
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={size * 0.13}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + i * 0.08 }}
            />
          );
        })}
    </svg>
  );
}

const DONUT_COLORS: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#64748b',
};

export function AuditInfographics({ mistakes, antiPatterns, vulnerabilities }: AuditInfographicsProps) {
  const mistakeCounts = severityCounts(mistakes);
  const antiCounts = severityCounts(antiPatterns);
  const vulnCounts = severityCounts(vulnerabilities);

  const cards = [
    {
      label: 'Code Mistakes',
      icon: TriangleAlert,
      iconColor: 'text-amber-300',
      total: mistakes.length,
      counts: mistakeCounts,
      accentBar: 'bg-amber-400',
      donutDelay: 0.1,
    },
    {
      label: 'Anti-Patterns',
      icon: Sparkles,
      iconColor: 'text-violet-300',
      total: antiPatterns.length,
      counts: antiCounts,
      accentBar: 'bg-violet-400',
      donutDelay: 0.2,
    },
    {
      label: 'Security Risks',
      icon: ShieldAlert,
      iconColor: 'text-red-300',
      total: vulnerabilities.length,
      counts: vulnCounts,
      accentBar: 'bg-red-400',
      donutDelay: 0.3,
    },
  ];

  const overallTotal = mistakes.length + antiPatterns.length + vulnerabilities.length;
  const criticalTotal = mistakeCounts.critical + antiCounts.critical + vulnCounts.critical;
  const highTotal = mistakeCounts.high + antiCounts.high + vulnCounts.high;

  const healthScore = Math.max(
    0,
    100 - criticalTotal * 20 - highTotal * 8 - (mistakeCounts.medium + antiCounts.medium + vulnCounts.medium) * 3
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">Audit Infographics</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Severity breakdown across {overallTotal} identified findings
          </p>
        </div>
        {/* Health Score Gauge */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Code Health</span>
          <div className="flex items-baseline gap-1">
            <span
              className={`font-mono text-2xl font-bold tabular-nums ${
                healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {healthScore}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ label, icon: Icon, iconColor, total, counts, accentBar, donutDelay }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
          >
            {/* Card header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                <span className="text-xs font-medium text-slate-300">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <DonutChart
                  segments={SEV_ORDER.map((s) => ({ value: counts[s], color: DONUT_COLORS[s] }))}
                  size={40}
                  delay={donutDelay}
                />
                <span className="font-mono text-xl font-semibold text-slate-200">{total}</span>
              </div>
            </div>

            {/* Overall bar */}
            <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: total > 0 ? '100%' : '0%' }}
                transition={{ duration: 0.6, delay: donutDelay }}
                className={`h-full rounded-full ${accentBar} opacity-40`}
              />
            </div>

            {/* Severity breakdown */}
            <SeverityBreakdown counts={counts} total={total} delay={donutDelay + 0.1} />
          </motion.div>
        ))}
      </div>

      {/* Summary row */}
      {overallTotal > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          {SEV_ORDER.map((sev) => {
            const n = mistakeCounts[sev] + antiCounts[sev] + vulnCounts[sev];
            if (n === 0) return null;
            return (
              <div key={sev} className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${SEV_STYLES[sev].dot}`} />
                <span className={`text-[11px] ${SEV_STYLES[sev].text}`}>
                  {n} {sev}
                </span>
              </div>
            );
          })}
          <span className="ml-auto text-[11px] text-slate-600">
            {overallTotal} total findings
          </span>
        </motion.div>
      )}
    </div>
  );
}
