'use client';

import { useRef, useState, useCallback } from 'react';
import type { AnalysisData } from '@/lib/types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function usePdfExport(data: AnalysisData) {
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const exportPdf = useCallback(async () => {
    setExporting(true);
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ── Helpers ────────────────────────────────────────────────────────────
      const addPage = () => {
        doc.addPage();
        y = margin;
      };
      const checkPageBreak = (needed: number) => {
        if (y + needed > pageH - margin) addPage();
      };
      const addLine = (
        text: string,
        size = 10,
        style: 'normal' | 'bold' | 'italic' = 'normal',
        color: [number, number, number] = [200, 200, 210],
        indent = 0,
      ) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, contentW - indent) as string[];
        checkPageBreak(lines.length * (size * 0.45) + 2);
        doc.text(lines, margin + indent, y);
        y += lines.length * (size * 0.45) + 2;
      };
      const addSection = (title: string) => {
        checkPageBreak(14);
        y += 4;
        doc.setFillColor(22, 30, 46);
        doc.roundedRect(margin, y - 5, contentW, 10, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184);
        doc.text(title.toUpperCase(), margin + 4, y + 1);
        y += 9;
      };
      const addDivider = () => {
        doc.setDrawColor(40, 52, 71);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 4;
      };

      // ── Cover ──────────────────────────────────────────────────────────────
      doc.setFillColor(8, 12, 22);
      doc.rect(0, 0, pageW, pageH, 'F');

      // Accent bar
      doc.setFillColor(14, 165, 233);
      doc.rect(0, 0, 5, pageH, 'F');

      y = 38;
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(241, 245, 249);
      doc.text('CodeLens AI', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Project Analysis Report', margin, y);
      y += 18;

      addDivider();

      // File meta
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      const metaLines = [
        `File: ${data.fileName}`,
        `Size: ${formatFileSize(data.fileSize)}`,
        `Generated: ${new Date().toLocaleString()}`,
        `Powered by IBM Bob`,
      ];
      for (const line of metaLines) {
        doc.text(line, margin, y);
        y += 6;
      }
      y += 8;

      // ── Summary ────────────────────────────────────────────────────────────
      addSection('Summary');
      addLine(data.summary, 9.5, 'normal', [148, 163, 184]);
      y += 2;

      // ── Executive Overview ─────────────────────────────────────────────────
      if (data.executiveOverview) {
        addSection('Executive Overview');
        const eo = data.executiveOverview;

        addLine('Core Purpose', 8.5, 'bold', [100, 116, 139]);
        addLine(eo.corePurpose, 9.5, 'normal', [200, 210, 220], 2);
        y += 2;

        addLine('Architecture Narrative', 8.5, 'bold', [100, 116, 139]);
        addLine(eo.architectureNarrative, 9.5, 'normal', [200, 210, 220], 2);
        y += 2;

        addLine('Key Features', 8.5, 'bold', [100, 116, 139]);
        for (const feat of eo.keyFeatures) {
          addLine(`• ${feat}`, 9, 'normal', [180, 190, 205], 3);
        }
        y += 2;
      }

      // ── Tech Stack ─────────────────────────────────────────────────────────
      addSection('Tech Stack');
      const grouped: Record<string, string[]> = {};
      for (const tech of data.techStack) {
        if (!grouped[tech.category]) grouped[tech.category] = [];
        grouped[tech.category].push(tech.name);
      }
      for (const [cat, names] of Object.entries(grouped)) {
        addLine(`${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${names.join(', ')}`, 9, 'normal', [180, 190, 205], 2);
      }
      y += 2;

      // ── Architecture Metrics ───────────────────────────────────────────────
      if (data.architecture?.length) {
        addSection('Architecture & Metrics');
        for (const m of data.architecture) {
          addLine(`${m.label}: ${m.value}`, 9, 'normal', [180, 190, 205], 2);
          if (m.description) addLine(m.description, 8, 'italic', [100, 116, 139], 4);
        }
        y += 2;
      }

      // ── Technical Debt ─────────────────────────────────────────────────────
      if (data.techDebtMetrics?.length) {
        addSection('Technical Debt & Metrics');
        for (const m of data.techDebtMetrics) {
          const pct = Math.round((m.value / m.max) * 100);
          addLine(
            `${m.label}: ${m.value}${m.unit} (${pct}% — ${m.status.toUpperCase()})`,
            9, 'normal', [180, 190, 205], 2,
          );
          addLine(m.description, 8, 'italic', [100, 116, 139], 4);
        }
        y += 2;
      }

      // ── Security Findings ──────────────────────────────────────────────────
      if (data.securityFindings?.length) {
        addSection('Security Audit');
        for (const f of data.securityFindings) {
          checkPageBreak(16);
          addLine(`[${f.severity.toUpperCase()}] ${f.title}`, 9.5, 'bold', [239, 68, 68], 2);
          addLine(f.description, 9, 'normal', [180, 190, 205], 4);
          y += 1;
        }
      }

      // ── Code Mistakes ──────────────────────────────────────────────────────
      if (data.code_mistakes?.length) {
        addSection(`Code Mistakes (${data.code_mistakes.length})`);
        for (const m of data.code_mistakes) {
          checkPageBreak(16);
          addLine(`[${m.severity.toUpperCase()}] ${m.title}`, 9.5, 'bold', [251, 191, 36], 2);
          addLine(m.description, 9, 'normal', [180, 190, 205], 4);
          if (m.file) addLine(`File: ${m.file}${m.line ? `:${m.line}` : ''}`, 8, 'italic', [100, 116, 139], 4);
          y += 1;
        }
      }

      // ── Security Vulnerabilities ───────────────────────────────────────────
      if (data.security_vulnerabilities?.length) {
        addSection(`Security Vulnerabilities (${data.security_vulnerabilities.length})`);
        for (const v of data.security_vulnerabilities) {
          checkPageBreak(16);
          addLine(`[${v.severity.toUpperCase()}] ${v.title}`, 9.5, 'bold', [239, 68, 68], 2);
          addLine(v.description, 9, 'normal', [180, 190, 205], 4);
          if (v.file) addLine(`File: ${v.file}${v.line ? `:${v.line}` : ''}`, 8, 'italic', [100, 116, 139], 4);
          y += 1;
        }
      }

      // ── Anti-Patterns ──────────────────────────────────────────────────────
      if (data.anti_patterns?.length) {
        addSection(`Anti-Patterns (${data.anti_patterns.length})`);
        for (const a of data.anti_patterns) {
          checkPageBreak(16);
          addLine(`[${a.severity.toUpperCase()}] ${a.title}`, 9.5, 'bold', [167, 139, 250], 2);
          addLine(a.description, 9, 'normal', [180, 190, 205], 4);
          y += 1;
        }
      }

      // ── API Endpoints ──────────────────────────────────────────────────────
      if (data.apiEndpoints?.length) {
        addSection('API Endpoints');
        for (const ep of data.apiEndpoints) {
          addLine(`${ep.method} ${ep.path} — ${ep.purpose}`, 9, 'normal', [180, 190, 205], 2);
        }
        y += 2;
      }

      // ── Footer on each page ────────────────────────────────────────────────
      const totalPages = (doc as unknown as { internal: { pages: unknown[] } }).internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 75, 95);
        doc.text(`CodeLens AI — Powered by IBM Bob`, margin, pageH - 8);
        doc.text(`Page ${i} / ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
      }

      // ── Save ───────────────────────────────────────────────────────────────
      const slug = data.fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`codelens-ai-${slug}-report.pdf`);
    } finally {
      setExporting(false);
    }
  }, [data]);

  return { exportPdf, exporting, reportRef };
}
