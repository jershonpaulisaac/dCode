import type { AnalysisData } from './types';

export const mockAnalysisData: AnalysisData = {
  fileName: 'nextjs-enterprise-app.zip',
  fileSize: 28450000,
  summary:
    'This is a production-grade Next.js 13.5 application using the App Router architecture. It implements a SaaS dashboard with authentication, real-time data visualization, and a multi-tenant data model. The project leverages Supabase for its PostgreSQL database, authentication, and edge functions. The UI is built with Tailwind CSS and shadcn/ui components, providing a consistent and accessible design system. The codebase demonstrates strong typing practices with TypeScript throughout, includes comprehensive form validation with react-hook-form and zod, and uses Recharts for data visualization. State management is primarily handled through React hooks with no external state library, indicating a well-scoped application. The project is configured for deployment on Netlify with the Next.js plugin.',
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
      description: 'Managed Postgres with Row Level Security enabled',
    },
    {
      label: 'Estimated Complexity',
      value: 'Medium-High',
      description: 'Multi-table schema with RLS policies and edge functions',
    },
    {
      label: 'Architecture Pattern',
      value: 'App Router (Server + Client)',
      description: 'Hybrid rendering with Server and Client Components',
    },
    {
      label: 'Deployment Target',
      value: 'Netlify',
      description: 'Configured with @netlify/plugin-nextjs adapter',
    },
  ],
  fileTree: `nextjs-enterprise-app/
├── app/
│   ├── api/
│   │   └── analyze/
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
├── public/
├── .env
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json`,
};
