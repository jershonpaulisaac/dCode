'use client';

import { motion } from 'framer-motion';
import { FileText, Layers, Database, GitBranch, Boxes, Terminal, ArrowLeft, HardDrive, ShieldAlert, ShieldCheck, TriangleAlert as AlertTriangle, Info, Route, Gauge, CircleCheck as CheckCircle2, Circle as XCircle, Plus, Minus, FileCode, Sparkles } from 'lucide-react';
import type {
  AnalysisData,
  SecurityFinding,
  SecuritySeverity,
  ApiEndpoint,
  TechDebtMetric,
  MetricStatus,
} from '@/lib/types';

interface DashboardProps {
  data: AnalysisData;
  onReset: () => void;
}

const METRIC_ICONS = [Database, GitBranch, Boxes, Layers];

const CATEGORY_COLORS: Record<string, string> = {
  language: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
  framework: 'border-slate-600/40 bg-slate-800/30 text-slate-300',
  database: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  tooling: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  runtime: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
  library: 'border-slate-700/50 bg-slate-800/30 text-slate-400',
};

const SEVERITY_CONFIG: Record<
  SecuritySeverity,
  { icon: typeof ShieldAlert; border: string; bg: string; text: string; label: string }
> = {
  critical: {
    icon: ShieldAlert,
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    text: 'text-red-400',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    label: 'Warning',
  },
  info: {
    icon: Info,
    border: 'border-slate-600/30',
    bg: 'bg-slate-800/20',
    text: 'text-slate-400',
    label: 'Info',
  },
  success: {
    icon: ShieldCheck,
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    label: 'Passed',
  },
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  POST: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  PUT: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  PATCH: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const STATUS_BAR_COLORS: Record<MetricStatus, string> = {
  good: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

const STATUS_TEXT_COLORS: Record<MetricStatus, string> = {
  good: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SectionWrapper({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: typeof Terminal }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <h2 className="font-sans text-sm font-medium tracking-tight text-slate-300">
        {title}
      </h2>
    </div>
  );
}

function ExecutiveOverviewSection({ data }: { data: AnalysisData }) {
  if (!data.executiveOverview) return null;
  const { corePurpose, architectureNarrative, keyFeatures } = data.executiveOverview;

  return (
    <SectionWrapper delay={0.15} className="p-7">
      <div className="mb-5 flex items-center justify-between">
        <SectionHeader title="Executive Overview" icon={FileText} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/30 bg-slate-800/30 px-2.5 py-1 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          IBM Bob
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Core Purpose
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              {corePurpose}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Architecture Narrative
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              {architectureNarrative}
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Key Features
          </h3>
          <ul className="space-y-2.5">
            {keyFeatures.map((feature, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + idx * 0.08 }}
                className="flex items-start gap-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-3.5"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="text-sm leading-relaxed text-slate-300">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </SectionWrapper>
  );
}

function SecurityAuditSection({ findings }: { findings: SecurityFinding[] }) {
  if (!findings || findings.length === 0) return null;

  return (
    <SectionWrapper delay={0.2} className="p-7">
      <SectionHeader title="Security Audit" icon={ShieldAlert} />
      <div className="grid gap-4 md:grid-cols-2">
        {findings.map((finding, idx) => {
          const config = SEVERITY_CONFIG[finding.severity];
          const Icon = config.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + idx * 0.08 }}
              className={`rounded-xl border p-5 ${config.border} ${config.bg}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${config.text}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {config.label}
                  </span>
                </div>
              </div>
              <h3 className="mb-2 text-sm font-medium text-slate-200">
                {finding.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-500">
                {finding.description}
              </p>
              {finding.detail && (
                <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/50 p-3 font-mono text-[11px] leading-relaxed text-slate-500">
                  {finding.detail}
                </pre>
              )}
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

function ApiRoutingSection({ endpoints }: { endpoints: ApiEndpoint[] }) {
  if (!endpoints || endpoints.length === 0) return null;

  return (
    <SectionWrapper delay={0.25} className="p-7">
      <SectionHeader title="API & Routing Map" icon={Route} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Method
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Path
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Purpose
              </th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + idx * 0.04 }}
                className="border-b border-slate-800/40 transition-colors hover:bg-slate-800/20"
              >
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${
                      METHOD_COLORS[ep.method] || 'text-slate-400 bg-slate-800/20 border-slate-700'
                    }`}
                  >
                    {ep.method}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <code className="font-mono text-xs text-slate-300">{ep.path}</code>
                </td>
                <td className="px-3 py-3 text-xs leading-relaxed text-slate-500">
                  {ep.purpose}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}

function TechDebtSection({ metrics }: { metrics: TechDebtMetric[] }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <SectionWrapper delay={0.3} className="p-7">
      <SectionHeader title="Technical Debt & Metrics" icon={Gauge} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, idx) => {
          const pct = Math.round((metric.value / metric.max) * 100);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 + idx * 0.08 }}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="mb-1 flex items-baseline justify-between">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <span className={`font-mono text-sm font-semibold tabular-nums ${STATUS_TEXT_COLORS[metric.status]}`}>
                  {metric.value}{metric.unit}
                </span>
              </div>
              <div className="mb-3 mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + idx * 0.08, ease: 'easeOut' }}
                  className={`h-full rounded-full ${STATUS_BAR_COLORS[metric.status]}`}
                />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {metric.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

function CodeDiffSection({ data }: { data: AnalysisData }) {
  if (!data.recommendedRefactor) return null;
  const refactor = data.recommendedRefactor;

  const beforeLines = refactor.beforeCode.split('\n');
  const afterLines = refactor.afterCode.split('\n');

  return (
    <SectionWrapper delay={0.35} className="p-7">
      <div className="mb-5 flex items-center justify-between">
        <SectionHeader title="AI Action Hub" icon={Sparkles} />
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-xs font-medium text-slate-900 transition-all hover:bg-white">
          <FileCode className="h-3.5 w-3.5" />
          Generate Documentation (README.md)
        </button>
      </div>

      <div className="mb-5">
        <h3 className="mb-1.5 text-sm font-medium text-slate-200">
          {refactor.title}
        </h3>
        <p className="text-xs leading-relaxed text-slate-500">
          {refactor.description}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-red-500/20">
          <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/5 px-4 py-2.5">
            <XCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-400">Before</span>
            <span className="ml-auto font-mono text-[10px] text-slate-600">{refactor.language}</span>
          </div>
          <pre className="max-h-80 overflow-auto bg-slate-950/50 p-4 font-mono text-[11px] leading-relaxed">
            {beforeLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-3 w-6 shrink-0 select-none text-right text-slate-700">
                  {i + 1}
                </span>
                <span className="text-slate-500">{line || ' '}</span>
              </div>
            ))}
          </pre>
        </div>

        <div className="overflow-hidden rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">After — Optimized by IBM Bob</span>
            <span className="ml-auto font-mono text-[10px] text-slate-600">{refactor.language}</span>
          </div>
          <pre className="max-h-80 overflow-auto bg-slate-950/50 p-4 font-mono text-[11px] leading-relaxed">
            {afterLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-3 w-6 shrink-0 select-none text-right text-slate-700">
                  {i + 1}
                </span>
                <span className="text-slate-300">{line || ' '}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </SectionWrapper>
  );
}

export function Dashboard({ data, onReset }: DashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-5xl px-6 pb-24 pt-28"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          New Analysis
        </button>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5" />
            {formatFileSize(data.fileSize)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {data.fileName}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50">
            <Terminal className="h-4 w-4 text-slate-300" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-medium tracking-tight text-slate-100">
              Analysis Report
            </h1>
            <p className="text-xs text-slate-500">
              Generated by IBM Bob Enterprise Agent
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Executive Overview */}
        <ExecutiveOverviewSection data={data} />

        {/* Tech Stack */}
        <SectionWrapper delay={0.2} className="p-7">
          <SectionHeader title="Tech Stack Breakdown" icon={Layers} />
          <div className="flex flex-wrap gap-2.5">
            {data.techStack.map((tech, idx) => (
              <motion.span
                key={`${tech.name}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.25 + idx * 0.03 }}
                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  CATEGORY_COLORS[tech.category] || CATEGORY_COLORS.library
                }`}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </SectionWrapper>

        {/* Architecture & Metrics */}
        <SectionWrapper delay={0.25} className="p-7">
          <SectionHeader title="Architecture & Metrics" icon={Boxes} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.architecture.map((metric, idx) => {
              const Icon = METRIC_ICONS[idx % METRIC_ICONS.length];
              return (
                <div
                  key={`${metric.label}-${idx}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-slate-700"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mb-1 text-xs text-slate-500">{metric.label}</p>
                  <p className="font-sans text-sm font-medium tracking-tight text-slate-200">
                    {metric.value}
                  </p>
                  {metric.description && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {metric.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </SectionWrapper>

        {/* Security Audit */}
        {data.securityFindings && <SecurityAuditSection findings={data.securityFindings} />}

        {/* API & Routing Map */}
        {data.apiEndpoints && <ApiRoutingSection endpoints={data.apiEndpoints} />}

        {/* Technical Debt & Metrics */}
        {data.techDebtMetrics && <TechDebtSection metrics={data.techDebtMetrics} />}

        {/* AI Action Hub */}
        {data.recommendedRefactor && <CodeDiffSection data={data} />}

        {/* File Structure */}
        <SectionWrapper delay={0.35} className="p-7">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeader title="File Structure" icon={Terminal} />
          </div>
          <pre className="overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-950/50 p-5 font-mono text-xs leading-relaxed text-slate-400">
            {data.fileTree}
          </pre>
        </SectionWrapper>
      </div>

      {/* Dashboard Footer */}
      <div className="mt-12 border-t border-slate-800/40 pt-6">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>dCode — Enterprise AI Code Intelligence</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Powered by IBM Bob
          </span>
        </div>
      </div>
    </motion.div>
  );
}
