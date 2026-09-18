import type { AnalysisData } from './types';

export const mockAnalysisData: AnalysisData = {
  fileName: 'nextjs-enterprise-app.zip',
  fileSize: 28450000,
  summary:
    'This is a production-grade Next.js 13.5 application using the App Router architecture. It implements a SaaS dashboard with authentication, real-time data visualization, and a multi-tenant data model. The project leverages Supabase for its PostgreSQL database, authentication, and edge functions. The UI is built with Tailwind CSS and shadcn/ui components, providing a consistent and accessible design system. The codebase demonstrates strong typing practices with TypeScript throughout, includes comprehensive form validation with react-hook-form and zod, and uses Recharts for data visualization. State management is primarily handled through React hooks with no external state library, indicating a well-scoped application. The project is configured for deployment on Netlify with the Next.js plugin.',
  executiveOverview: {
    corePurpose:
      'This application is a B2B SaaS analytics platform designed for operations teams at mid-market logistics companies. It ingests shipment, carrier, and warehouse data from multiple third-party APIs (FedEx, UPS, ShipBob), normalizes it into a unified PostgreSQL schema, and presents real-time delivery dashboards, SLA compliance reports, and exception alerts. The end users are dispatch managers and logistics analysts who need a single pane of glass across fragmented carrier systems — they log in through an email/password flow, select a tenant workspace, and interact with filtered charts, drill-down tables, and CSV exports. The platform is built to support 50-100 concurrent tenants with strict row-level data isolation enforced at the database layer.',
    architectureNarrative:
      'Client requests flow from the Next.js App Router into a mix of Server Components (for initial data loading) and Client Components (for interactive charts and filters). All data access is routed through Supabase: the anon-key client handles real-time subscriptions and lightweight reads, while sensitive mutations (carrier API key rotation, tenant provisioning) are dispatched to Supabase Edge Functions acting as a serverless API gateway. PostgreSQL Row Level Security policies enforce that every query is scoped to the authenticated user\u2019s tenant_id. Carrier integrations run as background edge functions triggered by Supabase cron, writing normalized records into a raw_events table that materialized views aggregate into the dashboard-facing tables. Real-time updates are pushed back to the browser via Supabase Realtime channels.',
    keyFeatures: [
      'Multi-tenant carrier data aggregation with FedEx, UPS, and ShipBob integrations running on cron-triggered edge functions',
      'Real-time delivery exception dashboard with Supabase Realtime WebSocket subscriptions and SLA breach alerts',
      'Role-based access control (admin, analyst, viewer) enforced through database RLS policies and JWT custom claims',
      'Scheduled PDF and CSV report generation with email delivery via an edge function rendering service',
    ],
  },
  securityFindings: [
    {
      severity: 'critical',
      title: 'Hardcoded Secrets Detected',
      description:
        'IBM Bob identified a masked API key committed directly in a source file. This key grants read/write access to the production Supabase instance and must be rotated immediately.',
      detail:
        'Found in lib/supabaseClient.ts line 14:\nconst SERVICE_KEY = "sb_service_••••••••••••••••••••••••••••••••3f7a"\n\nRecommendation: Move to environment variables (process.env.SUPABASE_SERVICE_ROLE_KEY) and rotate the key in the Supabase dashboard.',
    },
    {
      severity: 'warning',
      title: 'Outdated Dependencies',
      description:
        '4 packages are behind their latest major versions. Two have known moderate-severity advisories that IBM Bob flagged for prioritized upgrade.',
      detail:
        '• next@13.5.1 → 14.2.x (moderate advisory: CVE-2024-12345)\n• recharts@2.12.7 → 2.13.x (moderate: XSS in custom tooltip renderer)\n• framer-motion@10.16.x → 11.x\n• zod@3.22.x → 3.23.x',
    },
    {
      severity: 'success',
      title: 'Row Level Security Enabled',
      description:
        'All 14 tables in the public schema have RLS enabled with properly scoped policies. No publicly exposed tables without ownership checks were found.',
    },
  ],
  apiEndpoints: [
    { method: 'GET', path: '/api/analyses', purpose: 'List all saved codebase analyses for the current workspace' },
    { method: 'POST', path: '/api/analyze', purpose: 'Upload a codebase file and trigger IBM Bob deep-dive analysis' },
    { method: 'GET', path: '/api/analyses/:id', purpose: 'Retrieve a single analysis report with full metrics' },
    { method: 'DELETE', path: '/api/analyses/:id', purpose: 'Remove a stored analysis and its associated metadata' },
    { method: 'POST', path: '/api/export', purpose: 'Generate and download a PDF or CSV export of an analysis' },
    { method: 'PATCH', path: '/api/workspace/settings', purpose: 'Update workspace-level configuration and API keys' },
    { method: 'GET', path: '/api/health', purpose: 'Liveness probe used by the deployment platform health checks' },
  ],
  techDebtMetrics: [
    {
      label: 'Cyclomatic Complexity',
      value: 47,
      max: 100,
      unit: 'avg',
      description: 'Average complexity per function across 1,240 measured functions. Values above 50 indicate areas needing refactor.',
      status: 'warning',
    },
    {
      label: 'Test Coverage',
      value: 68,
      max: 100,
      unit: '%',
      description: 'Statement coverage measured by the test suite. 68% is below the enterprise target of 80%.',
      status: 'warning',
    },
    {
      label: 'Code Duplication Index',
      value: 12,
      max: 100,
      unit: '%',
      description: 'Percentage of duplicated code blocks detected. Below the 15% warning threshold — healthy.',
      status: 'good',
    },
    {
      label: 'Type Safety Score',
      value: 94,
      max: 100,
      unit: '%',
      description: 'Proportion of strictly-typed exports with no implicit any. Strong TypeScript discipline.',
      status: 'good',
    },
  ],
  recommendedRefactor: {
    title: 'Optimize Carrier Data Normalization Function',
    description:
      'IBM Bob identified a high-complexity function (cyclomatic complexity 23) in the carrier normalization module. The function handles three carriers with deeply nested conditionals. The recommended refactor uses a strategy pattern to eliminate branching and improve extensibility for future carriers.',
    language: 'typescript',
    beforeCode: `function normalizeCarrierData(raw: any, carrier: string) {
  let result: any = {};
  if (carrier === 'fedex') {
    result.trackingId = raw.tracking_number;
    result.status = raw.shipment_status;
    result.weight = raw.total_weight_lbs;
    if (raw.shipment_status === 'delivered') {
      result.deliveredAt = new Date(raw.actual_delivery);
    } else if (raw.shipment_status === 'in_transit') {
      result.eta = new Date(raw.estimated_delivery);
    } else if (raw.shipment_status === 'exception') {
      result.exceptionCode = raw.exception_code;
      result.exceptionNote = raw.exception_description;
    }
  } else if (carrier === 'ups') {
    result.trackingId = raw.trackNum;
    result.status = raw.statusCode;
    result.weight = raw.weightVal;
    if (raw.statusCode === 'D') {
      result.deliveredAt = new Date(raw.deliveryTime);
    } else if (raw.statusCode === 'I') {
      result.eta = new Date(raw.estDelivery);
    }
  } else if (carrier === 'shipbob') {
    result.trackingId = raw.id;
    result.status = raw.fulfillment_status;
    result.weight = raw.weight;
  } else {
    throw new Error('Unknown carrier: ' + carrier);
  }
  return result;
}`,
    afterCode: `interface CarrierNormalizer {
  trackingId: (raw: Record<string, unknown>) => string;
  status: (raw: Record<string, unknown>) => string;
  weight: (raw: Record<string, unknown>) => number;
  extraFields?: (raw: Record<string, unknown>) => Partial<NormalizedShipment>;
}

const normalizers: Record<string, CarrierNormalizer> = {
  fedex: {
    trackingId: (r) => String(r.tracking_number),
    status: (r) => String(r.shipment_status),
    weight: (r) => Number(r.total_weight_lbs),
    extraFields: (r) => {
      const status = r.shipment_status;
      if (status === 'delivered') return { deliveredAt: new Date(String(r.actual_delivery)) };
      if (status === 'in_transit') return { eta: new Date(String(r.estimated_delivery)) };
      if (status === 'exception') return { exceptionCode: String(r.exception_code), exceptionNote: String(r.exception_description) };
      return {};
    },
  },
  ups: {
    trackingId: (r) => String(r.trackNum),
    status: (r) => String(r.statusCode),
    weight: (r) => Number(r.weightVal),
    extraFields: (r) => {
      if (r.statusCode === 'D') return { deliveredAt: new Date(String(r.deliveryTime)) };
      if (r.statusCode === 'I') return { eta: new Date(String(r.estDelivery)) };
      return {};
    },
  },
  shipbob: {
    trackingId: (r) => String(r.id),
    status: (r) => String(r.fulfillment_status),
    weight: (r) => Number(r.weight),
  },
};

function normalizeCarrierData(raw: Record<string, unknown>, carrier: string): NormalizedShipment {
  const normalizer = normalizers[carrier];
  if (!normalizer) throw new Error(\`Unknown carrier: \${carrier}\`);
  return {
    trackingId: normalizer.trackingId(raw),
    status: normalizer.status(raw),
    weight: normalizer.weight(raw),
    ...normalizer.extraFields?.(raw),
  };
}`,
  },
  techStack: [
    { name: 'TypeScript', category: 'language' },
    { name: 'Next.js 13.5', category: 'framework' },
    { name: 'React 18', category: 'framework' },
    { name: 'Tailwind CSS', category: 'framework' },
    { name: 'Supabase', category: 'database' },
    { name: 'PostgreSQL', category: 'database' },
    { name: 'Node.js', category: 'runtime' },
    { name: 'Recharts', category: 'library' },
    { name: 'react-hook-form', category: 'library' },
    { name: 'Zod', category: 'library' },
    { name: 'shadcn/ui', category: 'library' },
    { name: 'Framer Motion', category: 'library' },
    { name: 'Vite', category: 'tooling' },
    { name: 'ESLint', category: 'tooling' },
  ],
  architecture: [
    {
      label: 'Primary Database',
      value: 'PostgreSQL (Supabase)',
      description: 'Managed Postgres with Row Level Security enabled across all tables',
    },
    {
      label: 'Estimated Complexity',
      value: 'Medium-High',
      description: 'Multi-table schema with RLS policies, materialized views, and edge functions',
    },
    {
      label: 'Architecture Pattern',
      value: 'App Router (Server + Client)',
      description: 'Hybrid rendering with Server Components for initial load and Client Components for interactivity',
    },
    {
      label: 'Deployment Target',
      value: 'Netlify',
      description: 'Configured with @netlify/plugin-nextjs adapter for SSR and edge function support',
    },
  ],
  fileTree: `nextjs-enterprise-app/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts
│   │   ├── analyses/
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── export/
│   │   │   └── route.ts
│   │   └── health/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── accordion.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── ... (30+ components)
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── types.ts
│   ├── mockData.ts
│   └── utils.ts
├── supabase/
│   └── functions/
│       ├── carrier-sync/
│       └── report-render/
├── public/
├── .env
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json`,
};
