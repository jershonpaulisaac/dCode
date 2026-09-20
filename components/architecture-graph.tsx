'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Database, Globe, Server } from 'lucide-react';
import type { ArchitectureNode } from '@/lib/types';

const ICONS = { frontend: Globe, backend: Server, database: Database, service: Server, external: Globe };

export function ArchitectureGraph({ nodes }: { nodes: ArchitectureNode[] }) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/50 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">CodeLens AI Architecture Graph</p>
          <p className="mt-1 text-xs text-slate-500">Inferred request and persistence flow</p>
        </div>
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-cyan-300">
          Live map
        </span>
      </div>
      <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node, index) => {
          const Icon = ICONS[node.type];
          return (
            <div key={node.id} className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.12 }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-lg shadow-cyan-950/10"
              >
                <Icon className="mb-3 h-4 w-4 text-cyan-300" />
                <p className="text-xs font-medium text-slate-200">{node.label}</p>
                <p className="mt-1 text-[11px] text-slate-500">{node.description}</p>
                {node.connectsTo.length > 0 && (
                  <p className="mt-3 text-[10px] text-cyan-400">
                    Connects to: {node.connectsTo.join(', ')}
                  </p>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
