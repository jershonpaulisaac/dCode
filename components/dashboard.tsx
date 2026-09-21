'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Layers, Database, GitBranch, Boxes, Terminal,
  ArrowLeft, HardDrive, ShieldAlert, ShieldCheck,
  TriangleAlert as AlertTriangle, Info, Route, Gauge,
  CircleCheck as CheckCircle2, Circle as XCircle, FileCode,
  Sparkles, Network, FolderTree, Download, Zap, Menu, X,
} from 'lucide-react';
import type {
  AnalysisData,
  SecurityFinding,
  SecuritySeverity,
  ApiEndpoint,
  TechDebtMetric,
  MetricStatus,
  AdvancedMetric,
} from '@/lib/types';
import { ArchitectureGraph } from '@/components/architecture-graph';
import { AuditInfographics } from '@/components/audit-infographics';
import { TechStackGraph } from '@/components/tech-stack-graph';
import { ProblemExplorer } from '@/components/problem-explorer';
import { LiveFileExplorer } from '@/components/live-file-explorer';
import { QuickStartSection } from '@/components/quick-start-section';
import { usePdfExport } from '@/hooks/use-pdf-export';
import { useTheme } from '@/lib/theme-context';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardProps {
  data: AnalysisData;
  onReset: () => void;
}

type TabId =
  | 'overview'
  | 'techstack'
  | 'architecture'
  | 'security'
  | 'api'
  | 'problems'
  | 'files'
  | 'quickstart'
  | 'metrics';

interface NavItem {
  id: TabId;
  label: string;
  icon: typeof FileText;
  badge?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const METRIC_ICONS = [Database, GitBranch, Boxes, Layers];

const SEVERITY_CONFIG: Record<
  SecuritySeverity,
  { icon: typeof ShieldAlert; border: string; bg: string; text: string; label: string }
> = {
  critical: { icon: ShieldAlert, border: 'border-red-500/30',     bg: 'bg-red-500/5',     text: 'text-red-400',     label: 'Critical' },
  warning:  { icon: AlertTriangle, border: 'border-amber-500/30', bg: 'bg-amber-500/5',   text: 'text-amber-400',   label: 'Warning' },
  info:     { icon: Info,          border: 'border-slate-600/30', bg: 'bg-slate-800/20',  text: 'text-slate-400',   label: 'Info' },
  success:  { icon: ShieldCheck,   border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', label: 'Passed' },
};

const METHOD_COLORS: Record<string, string> = {
  GET:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  POST:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
  PUT:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
  PATCH:  'text-violet-400 bg-violet-500/10 border-violet-500/20',
  DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const STATUS_BAR_COLORS: Record<MetricStatus, string> = {
  good: 'bg-emerald-500', warning: 'bg-amber-500', critical: 'bg-red-500',
};
const STATUS_TEXT_COLORS: Record<MetricStatus, string> = {
  good: 'text-emerald-400', warning: 'text-amber-400', critical: 'text-red-400',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Theme-aware surface classes ──────────────────────────────────────────────
function useSurface() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return {
    page:    dark ? 'bg-slate-950 text-slate-100'         : 'bg-slate-50 text-slate-900',
    nav:     dark ? 'bg-slate-900 border-slate-800'       : 'bg-white border-slate-200',
    card:    dark ? 'bg-slate-900/40 border-slate-800'    : 'bg-white border-slate-200',
    panel:   dark ? 'bg-slate-900/30 border-slate-800'    : 'bg-white border-slate-200',
    row:     dark ? 'hover:bg-slate-800/30'               : 'hover:bg-slate-50',
    muted:   dark ? 'text-slate-500'                      : 'text-slate-400',
    subtle:  dark ? 'text-slate-400'                      : 'text-slate-600',
    heading: dark ? 'text-slate-200'                      : 'text-slate-800',
    label:   dark ? 'text-slate-500'                      : 'text-slate-400',
    border:  dark ? 'border-slate-800'                    : 'border-slate-200',
    input:   dark ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400',
    codeBg:  dark ? 'bg-[#0a0f1a]'                        : 'bg-slate-50',
    isDark: dark,
  };
}

// ─── Panel wrapper ────────────────────────────────────────────────────────────
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const s = useSurface();
  return (
    <motion.div
      key="panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border ${s.panel} backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: typeof Terminal }) {
  const s = useSurface();
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${s.card}`}>
        <Icon className={`h-4 w-4 ${s.muted}`} />
      </div>
      <h2 className={`font-sans text-sm font-semibold tracking-tight ${s.heading}`}>{title}</h2>
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────
function OverviewPanel({ data }: { data: AnalysisData }) {
  const s = useSurface();
  const eo = data.executiveOverview;

  return (
    <Panel className="p-7">
      <div className="mb-5 flex items-center justify-between">
        <SectionHeader title="Executive Overview" icon={FileText} />
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${s.card} ${s.muted}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          IBM Bob
        </span>
      </div>

      <p className={`mb-6 rounded-xl border ${s.card} p-4 text-sm leading-relaxed ${s.subtle}`}>
        {data.summary}
      </p>

      {eo && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <h3 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${s.label}`}>Core Purpose</h3>
              <p className={`text-sm leading-relaxed ${s.subtle}`}>{eo.corePurpose}</p>
            </div>
            <div>
              <h3 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${s.label}`}>Architecture</h3>
              <p className={`text-sm leading-relaxed ${s.subtle}`}>{eo.architectureNarrative}</p>
            </div>
          </div>
          <div>
            <h3 className={`mb-3 text-xs font-semibold uppercase tracking-wider ${s.label}`}>Key Features</h3>
            <ul className="space-y-2.5">
              {eo.keyFeatures.map((feature, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`flex items-start gap-3 rounded-lg border ${s.card} p-3`}
                >
                  <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${s.muted}`} />
                  <span className={`text-sm leading-relaxed ${s.heading}`}>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Panel>
  );
}

function TechStackPanel({ data }: { data: AnalysisData }) {
  return (
    <Panel className="p-7">
      <SectionHeader title="Tech Stack Graph" icon={Layers} />
      <TechStackGraph techStack={data.techStack} />
    </Panel>
  );
}

function ArchitecturePanel({ data }: { data: AnalysisData }) {
  const s = useSurface();
  return (
    <div className="space-y-6">
      <Panel className="p-7">
        <SectionHeader title="Architecture & Metrics" icon={Boxes} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.architecture.map((metric, idx) => {
            const Icon = METRIC_ICONS[idx % METRIC_ICONS.length];
            return (
              <div key={idx} className={`rounded-xl border ${s.card} p-5 transition-colors ${s.row}`}>
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg border ${s.card}`}>
                  <Icon className={`h-4 w-4 ${s.muted}`} />
                </div>
                <p className={`mb-1 text-xs ${s.label}`}>{metric.label}</p>
                <p className={`text-sm font-medium tracking-tight ${s.heading}`}>{metric.value}</p>
                {metric.description && <p className={`mt-2 text-xs leading-relaxed ${s.muted}`}>{metric.description}</p>}
              </div>
            );
          })}
        </div>
      </Panel>
      {data.architecture_nodes?.length > 0 && (
        <Panel className="p-7">
          <SectionHeader title="Architecture Graph" icon={Network} />
          <ArchitectureGraph nodes={data.architecture_nodes} />
        </Panel>
      )}
    </div>
  );
}

function SecurityPanel({ data }: { data: AnalysisData }) {
  const s = useSurface();
  return (
    <div className="space-y-6">
      {data.securityFindings && data.securityFindings.length > 0 && (
        <Panel className="p-7">
          <SectionHeader title="Security Audit" icon={ShieldAlert} />
          <div className="grid gap-4 md:grid-cols-2">
            {data.securityFindings.map((finding, idx) => {
              const cfg = SEVERITY_CONFIG[finding.severity];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`rounded-xl border p-5 ${cfg.border} ${cfg.bg}`}
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${cfg.text}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${s.muted}`}>{cfg.label}</span>
                  </div>
                  <h3 className={`mb-2 text-sm font-medium ${s.heading}`}>{finding.title}</h3>
                  <p className={`text-xs leading-relaxed ${s.muted}`}>{finding.description}</p>
                  {finding.detail && (
                    <pre className={`mt-3 overflow-x-auto rounded-lg border ${s.border} ${s.codeBg} p-3 font-mono text-[11px] leading-relaxed ${s.muted}`}>
                      {finding.detail}
                    </pre>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Panel>
      )}
      <AuditInfographics
        mistakes={data.code_mistakes}
        antiPatterns={data.anti_patterns}
        vulnerabilities={data.security_vulnerabilities}
      />
    </div>
  );
}

function ApiPanel({ data }: { data: AnalysisData }) {
  const s = useSurface();
  const endpoints = data.apiEndpoints ?? [];
  return (
    <Panel className="p-7">
      <SectionHeader title="API & Routing Map" icon={Route} />
      {endpoints.length === 0 ? (
        <p className={`text-sm ${s.muted}`}>No API endpoints detected.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${s.border}`}>
                {['Method', 'Path', 'Purpose'].map(h => (
                  <th key={h} className={`px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider ${s.label}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`border-b ${s.border} transition-colors ${s.row}`}
                >
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${METHOD_COLORS[ep.method] ?? 'text-slate-400 bg-slate-800/20 border-slate-700'}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <code className={`font-mono text-xs ${s.heading}`}>{ep.path}</code>
                  </td>
                  <td className={`px-3 py-3 text-xs leading-relaxed ${s.muted}`}>{ep.purpose}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function MetricsPanel({ data }: { data: AnalysisData }) {
  const s = useSurface();
  const metrics = data.techDebtMetrics ?? [];
  const advanced = data.advancedMetrics ?? [];

  return (
    <div className="space-y-6">
      {metrics.length > 0 && (
        <Panel className="p-7">
          <SectionHeader title="Technical Debt & Metrics" icon={Gauge} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, idx) => {
              const pct = Math.round((metric.value / metric.max) * 100);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`rounded-xl border ${s.card} p-5`}
                >
                  <div className="mb-1 flex items-baseline justify-between">
                    <p className={`text-xs ${s.label}`}>{metric.label}</p>
                    <span className={`font-mono text-sm font-semibold tabular-nums ${STATUS_TEXT_COLORS[metric.status]}`}>
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                  <div className={`mb-3 mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800 dark:bg-slate-800`} style={{ background: s.isDark ? undefined : '#e2e8f0' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.07, ease: 'easeOut' }}
                      className={`h-full rounded-full ${STATUS_BAR_COLORS[metric.status]}`}
                    />
                  </div>
                  <p className={`text-[11px] leading-relaxed ${s.muted}`}>{metric.description}</p>
                </motion.div>
              );
            })}
          </div>
        </Panel>
      )}
      {advanced.length > 0 && (
        <Panel className="p-7">
          <SectionHeader title="Intelligence Signals" icon={Sparkles} />
          <div className="grid gap-4 md:grid-cols-3">
            {advanced.map((metric) => {
              const color = metric.status === 'good' ? 'text-emerald-400' : metric.status === 'warning' ? 'text-amber-400' : 'text-red-400';
              return (
                <div key={metric.label} className={`rounded-xl border ${s.card} p-5`}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <p className={`text-xs font-medium ${s.heading}`}>{metric.label}</p>
                    <span className={`font-mono text-lg font-semibold ${color}`}>{metric.value}{metric.unit === '%' ? '%' : ''}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${s.muted}`}>{metric.description}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}

function ProblemsPanel({ data }: { data: AnalysisData }) {
  return (
    <ProblemExplorer
      mistakes={data.code_mistakes}
      antiPatterns={data.anti_patterns}
      vulnerabilities={data.security_vulnerabilities}
    />
  );
}

function FilesPanel({ data }: { data: AnalysisData }) {
  return (
    <LiveFileExplorer fileTree={data.fileTree} fileContents={data.fileContents} />
  );
}

function QuickStartPanel({ data }: { data: AnalysisData }) {
  return (
    <QuickStartSection setupCommands={data.setupCommands} entryPoints={data.entryPoints} />
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  items,
  active,
  onSelect,
  data,
  isDark,
}: {
  items: NavItem[];
  active: TabId;
  onSelect: (id: TabId) => void;
  data: AnalysisData;
  isDark: boolean;
}) {
  return (
    <nav
      className="flex flex-col gap-0.5 py-2"
      style={{
        borderRight: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        minHeight: '100%',
      }}
    >
      {items.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 mx-2"
            style={{
              backgroundColor: isActive
                ? isDark ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.08)'
                : 'transparent',
              color: isActive
                ? '#0ea5e9'
                : isDark ? '#64748b' : '#94a3b8',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)';
                (e.currentTarget as HTMLElement).style.color = isDark ? '#94a3b8' : '#475569';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = isDark ? '#64748b' : '#94a3b8';
              }
            }}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-cyan-400"
              />
            )}
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                style={{
                  backgroundColor: isActive
                    ? 'rgba(14,165,233,0.2)'
                    : isDark ? '#1e293b' : '#e2e8f0',
                  color: isActive ? '#0ea5e9' : isDark ? '#64748b' : '#94a3b8',
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function Dashboard({ data, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { exportPdf, exporting } = usePdfExport(data);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const s = useSurface();

  const totalProblems =
    data.code_mistakes.length + data.anti_patterns.length + data.security_vulnerabilities.length;

  const NAV_ITEMS: NavItem[] = [
    { id: 'overview',    label: 'Executive Summary',   icon: FileText },
    { id: 'techstack',   label: 'Tech Stack Graph',    icon: Layers },
    { id: 'architecture',label: 'Architecture',        icon: Network },
    { id: 'security',    label: 'Security Audit',      icon: ShieldAlert, badge: data.security_vulnerabilities.length },
    { id: 'api',         label: 'API Routing Map',     icon: Route,       badge: (data.apiEndpoints ?? []).length },
    { id: 'problems',    label: 'Problem Remediation', icon: AlertTriangle, badge: totalProblems },
    { id: 'files',       label: 'File Explorer',       icon: FolderTree },
    { id: 'quickstart',  label: 'Quick Start',         icon: Zap },
    { id: 'metrics',     label: 'Metrics & Debt',      icon: Gauge },
  ];

  function renderPanel() {
    switch (activeTab) {
      case 'overview':     return <OverviewPanel data={data} />;
      case 'techstack':    return <TechStackPanel data={data} />;
      case 'architecture': return <ArchitecturePanel data={data} />;
      case 'security':     return <SecurityPanel data={data} />;
      case 'api':          return <ApiPanel data={data} />;
      case 'problems':     return <ProblemsPanel data={data} />;
      case 'files':        return <FilesPanel data={data} />;
      case 'quickstart':   return <QuickStartPanel data={data} />;
      case 'metrics':      return <MetricsPanel data={data} />;
      default:             return null;
    }
  }

  const activeItem = NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <div
      className="flex min-h-screen flex-col pt-14"
      style={{ background: isDark ? 'hsl(222,47%,4%)' : 'hsl(210,40%,98%)' }}
    >
      {/* ── Top action bar ── */}
      <div
        className="sticky top-14 z-40 flex items-center justify-between border-b px-4 py-2"
        style={{
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
          background: isDark ? 'rgba(2,6,23,0.85)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = isDark ? '#cbd5e1' : '#1e293b'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isDark ? '#64748b' : '#94a3b8'; }}
          >
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </button>

          <span
            className="rounded-full border px-2.5 py-0.5 font-mono text-xs"
            style={{
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              color: isDark ? '#64748b' : '#94a3b8',
              background: isDark ? '#0f172a' : '#f8fafc',
            }}
          >
            {data.fileName}
          </span>
          <span style={{ color: isDark ? '#475569' : '#cbd5e1', fontSize: '11px' }}>
            {formatFileSize(data.fileSize)}
          </span>
        </div>

        <button
          onClick={exportPdf}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          style={{
            borderColor: isDark ? '#064e3b' : '#d1fae5',
            background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)',
            color: isDark ? '#34d399' : '#059669',
          }}
        >
          <Download className="h-3.5 w-3.5" />
          {exporting ? 'Generating…' : 'Export PDF'}
        </button>
      </div>

      {/* ── Body: sidebar + panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="shrink-0 overflow-hidden"
              style={{
                background: isDark ? 'hsl(222,47%,6%)' : 'hsl(0,0%,100%)',
              }}
            >
              <div style={{ width: 220 }}>
                {/* Project info chip */}
                <div
                  className="mx-3 mb-1 mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{
                    background: isDark ? '#0f172a' : '#f1f5f9',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                  }}
                >
                  <Terminal className="h-3.5 w-3.5 shrink-0" style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {data.fileName}
                    </p>
                    <p className="text-[10px]" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                      {data.techStack.length} techs · {formatFileSize(data.fileSize)}
                    </p>
                  </div>
                </div>

                <Sidebar
                  items={NAV_ITEMS}
                  active={activeTab}
                  onSelect={(id) => setActiveTab(id)}
                  data={data}
                  isDark={isDark}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main panel */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2">
            <span style={{ color: isDark ? '#334155' : '#cbd5e1', fontSize: '12px' }}>Analysis</span>
            <span style={{ color: isDark ? '#334155' : '#cbd5e1', fontSize: '12px' }}>/</span>
            <span className="text-xs font-semibold" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
              {activeItem?.label ?? 'Overview'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
