'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import {
  Network,
  FileText,
  Wrench,
  FolderTree,
  ArrowRight,
  Github,
  Layers,
  ShieldCheck,
  Route,
  BarChart2,
} from 'lucide-react';

// ─── Fade-up variant reused across sections ────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: (i as number) * 0.08, ease: 'easeOut' as const },
  }),
};

// ─── Feature grid data ─────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Network,
    title: 'Architecture Graph',
    description:
      'Auto-generated interactive node graph mapping every layer of your system — frontend, backend, databases, and external services.',
    tag: 'Visualization',
  },
  {
    icon: FileText,
    title: 'Executive Summary',
    description:
      'A structured, plain-language overview of the codebase purpose, architecture narrative, and key capabilities — ready to share.',
    tag: 'Intelligence',
  },
  {
    icon: Wrench,
    title: 'Problem Remediation',
    description:
      'Every detected code mistake and security vulnerability is paired with an actionable fix and a before/after diff.',
    tag: 'Quality',
  },
  {
    icon: FolderTree,
    title: 'Live File Explorer',
    description:
      'Browse the full file tree with inline syntax-highlighted previews. Navigate without leaving the analysis view.',
    tag: 'Explorer',
  },
  {
    icon: ShieldCheck,
    title: 'Security Audit',
    description:
      'Static analysis surfaces hardcoded secrets, missing error handling, and insecure patterns with severity grading.',
    tag: 'Security',
  },
  {
    icon: Route,
    title: 'API Route Map',
    description:
      'Every detected HTTP endpoint is catalogued with its method, path, and inferred purpose — no manual documentation needed.',
    tag: 'Routing',
  },
  {
    icon: Layers,
    title: 'Tech Stack Graph',
    description:
      'Real brand logos plotted as a live dependency graph with per-technology file count and usage percentage.',
    tag: 'Stack',
  },
  {
    icon: BarChart2,
    title: 'Metrics & Debt',
    description:
      'Code health score, test coverage presence, documentation rating, and technical debt estimation in one glance.',
    tag: 'Metrics',
  },
] as const;

// ─── How it works steps ────────────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Upload or link', body: 'Drop a ZIP archive or paste a public GitHub repository URL.' },
  { n: '02', title: 'Instant analysis', body: 'IBM Bob\'s static analysis engine scans architecture, dependencies, and code quality in seconds.' },
  { n: '03', title: 'Explore results', body: 'Navigate the dashboard — graph views, file explorer, audit findings, and exportable reports.' },
] as const;

// ─── Landing page ──────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-6 pb-24 pt-36 text-center">
        {/* Eyebrow */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Powered by IBM Bob
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mb-5 font-sans text-5xl font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl"
        >
          Understand any codebase
          <br />
          <span className="text-zinc-500">in seconds.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-zinc-500"
        >
          Drop a ZIP or paste a GitHub URL. CodeLens AI instantly visualizes
          enterprise architecture, detects code mistakes, maps API routes, and
          surfaces security findings — without any configuration.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors duration-150 hover:bg-zinc-100"
          >
            Start analysing
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors duration-150 hover:bg-white/[0.07] hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            Try with a public repo
          </a>
        </motion.div>

        {/* Meta strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-10 flex items-center justify-center gap-5 text-xs text-zinc-700"
        >
          <span>ZIP archives</span>
          <span className="h-px w-4 bg-zinc-800" />
          <span>GitHub URLs</span>
          <span className="h-px w-4 bg-zinc-800" />
          <span>No account required</span>
          <span className="h-px w-4 bg-zinc-800" />
          <span>Instant results</span>
        </motion.div>
      </section>

      {/* ══ FEATURE BENTO GRID ════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        {/* Section label */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            What you get
          </p>
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything your team needs
            <br />
            <span className="text-zinc-500">to understand a codebase instantly.</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-px border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                custom={i * 0.6}
                className="group flex flex-col gap-4 bg-[#09090b] p-6 transition-colors duration-200 hover:bg-white/[0.025]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    {feat.tag}
                  </span>
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-white">{feat.title}</p>
                  <p className="text-sm leading-relaxed text-zinc-600">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-6 pb-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            How it works
          </p>
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Three steps.
            <br />
            <span className="text-zinc-500">Zero configuration.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-0 divide-y divide-white/[0.06] border border-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              custom={i * 0.8}
              className="flex flex-col gap-4 p-8"
            >
              <span className="font-mono text-xs font-semibold text-zinc-700">{step.n}</span>
              <div>
                <p className="mb-2 text-base font-semibold text-white">{step.title}</p>
                <p className="text-sm leading-relaxed text-zinc-600">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-6 pb-32">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          className="flex flex-col items-center gap-6 border border-white/[0.08] bg-white/[0.02] p-14 text-center sm:p-16"
        >
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to start?
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
            No account, no setup, no API keys. Upload your code and get a full
            analysis in under 30 seconds.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors duration-150 hover:bg-zinc-100"
          >
            Analyse a codebase
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <p className="text-xs text-zinc-700">
            Powered by IBM Bob · Enterprise AI Code Intelligence
          </p>
        </motion.div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 w-1 flex-col gap-[2px]">
              <span className="flex-1 rounded-full bg-cyan-500" />
              <span className="flex-1 rounded-full bg-cyan-700" />
              <span className="h-[3px] rounded-full bg-cyan-900" />
            </span>
            <span className="text-sm font-semibold text-white">CodeLens AI</span>
          </div>
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} CodeLens AI — Powered by IBM Bob
          </p>
        </div>
      </footer>
    </div>
  );
}
