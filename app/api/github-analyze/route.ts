import { NextResponse } from 'next/server';
import type { AnalysisData } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const MAX_FILE_PREVIEW = 50_000;
const MAX_ANALYSIS_CONTENT = 2_000_000;
const PREVIEW_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'json', 'css', 'md', 'sql', 'py',
  'go', 'java', 'html', 'yml', 'yaml', 'toml', 'sh',
]);
const GITHUB_API = 'https://api.github.com';

// ─── GitHub helpers ──────────────────────────────────────────────────────────
function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const m = url.match(/github\.com\/([^/\s]+)\/([^/\s?#]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

async function githubFetch(path: string, token?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'CodeLens-AI/1.0',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText} — ${path}`);
  return res.json();
}

interface GHTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

async function fetchRepoTree(owner: string, repo: string, token?: string): Promise<GHTreeItem[]> {
  // Get default branch
  const repoData = await githubFetch(`/repos/${owner}/${repo}`, token);
  const branch: string = repoData.default_branch ?? 'main';

  // Get recursive tree
  const treeData = await githubFetch(
    `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token,
  );
  return (treeData.tree ?? []) as GHTreeItem[];
}

async function fetchFileContent(url: string, token?: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.raw',
    'User-Agent': 'CodeLens-AI/1.0',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return '';
  return res.text();
}

// ─── Re-use the full analysis logic from the file upload route ────────────────
// We import it dynamically to avoid duplication — but since Next.js route files
// can't export arbitrary functions across API boundaries easily, we inline the
// logic using a shared helper approach.
// The actual analysis functions are defined below (same heuristics as analyze/route.ts).

import {
  type TechStackItem,
  type ArchitectureNode,
  type CodeMistake,
  type SecurityVulnerability,
  type SetupCommand,
  type EntryPoint,
  type ApiEndpoint,
} from '@/lib/types';

function detectTechStack(fileList: string[], content: string): TechStackItem[] {
  const techStack: TechStackItem[] = [];
  if (fileList.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) techStack.push({ name: 'TypeScript', category: 'language' });
  if (fileList.some(f => f.endsWith('.js') || f.endsWith('.jsx'))) techStack.push({ name: 'JavaScript', category: 'language' });
  if (fileList.some(f => f.includes('next.config') || f.includes('app/'))) techStack.push({ name: 'Next.js App Router', category: 'framework' });
  if (fileList.some(f => f.includes('tailwind'))) techStack.push({ name: 'Tailwind CSS', category: 'tooling' });
  if (fileList.some(f => f.includes('supabase')) || content.includes('supabase')) techStack.push({ name: 'Supabase', category: 'database' });
  if (fileList.some(f => f.endsWith('.py'))) techStack.push({ name: 'Python', category: 'language' });
  if (fileList.some(f => f.endsWith('.go'))) techStack.push({ name: 'Go', category: 'language' });
  if (content.includes('"react"') || content.includes("'react'")) techStack.push({ name: 'React', category: 'framework' });
  if (content.includes('"vue"') || content.includes("'vue'")) techStack.push({ name: 'Vue', category: 'framework' });
  if (content.includes('"prisma"') || fileList.some(f => f.includes('prisma/'))) techStack.push({ name: 'Prisma', category: 'database' });
  if (fileList.some(f => f.endsWith('go.mod'))) techStack.push({ name: 'Node.js', category: 'runtime' });
  if (techStack.length === 0) techStack.push({ name: 'Node.js', category: 'runtime' }, { name: 'JavaScript', category: 'language' });
  return techStack;
}

function detectSetupCommandsFromTree(fileList: string[], fileContents: Record<string, string>): SetupCommand[] {
  const cmds: SetupCommand[] = [];
  const hasPkg = fileList.some(f => f.endsWith('package.json'));
  const hasPnpm = fileList.some(f => f.includes('pnpm-lock'));
  const hasYarn = fileList.some(f => f.includes('yarn.lock'));
  if (hasPkg) {
    const pm = hasPnpm ? 'pnpm' : hasYarn ? 'yarn' : 'npm';
    const install = pm === 'npm' ? 'npm install' : pm === 'yarn' ? 'yarn' : 'pnpm install';
    cmds.push({ command: install, description: 'Install project dependencies' });
    const pkgFile = Object.keys(fileContents).find(f => f.endsWith('package.json') && !f.includes('node_modules'));
    if (pkgFile) {
      try {
        const pkg = JSON.parse(fileContents[pkgFile]);
        const scripts: Record<string, string> = pkg.scripts ?? {};
        if (scripts.dev) cmds.push({ command: `${pm === 'npm' ? 'npm run' : pm} dev`, description: 'Start development server' });
        else if (scripts.start) cmds.push({ command: `${pm === 'npm' ? 'npm run' : pm} start`, description: 'Start the application' });
        if (scripts.build) cmds.push({ command: `${pm === 'npm' ? 'npm run' : pm} build`, description: 'Build for production' });
      } catch { /* ignore */ }
    }
  }
  if (fileList.some(f => f.endsWith('requirements.txt'))) {
    cmds.push({ command: 'pip install -r requirements.txt', description: 'Install Python dependencies' });
  }
  if (fileList.some(f => f.endsWith('go.mod'))) {
    cmds.push({ command: 'go mod download', description: 'Download Go modules' });
    cmds.push({ command: 'go run .', description: 'Run the Go application' });
  }
  return cmds;
}

function detectEntryPointsFromTree(fileList: string[]): EntryPoint[] {
  const points: EntryPoint[] = [];
  const candidates: [string, string][] = [
    ['app/page.tsx', 'Next.js App Router root page'],
    ['app/page.jsx', 'Next.js App Router root page'],
    ['pages/index.tsx', 'Next.js Pages index'],
    ['src/index.tsx', 'React entry point'],
    ['src/main.tsx', 'Vite React entry point'],
    ['main.py', 'Python entry point'],
    ['main.go', 'Go entry point'],
    ['index.js', 'Node.js entry point'],
    ['server.js', 'Node.js server'],
    ['app/layout.tsx', 'Next.js root layout'],
  ];
  for (const [c, d] of candidates) {
    const m = fileList.find(f => f.endsWith(c) || f === c);
    if (m) points.push({ path: m, description: d });
  }
  const apiRoutes = fileList.filter(f =>
    (f.includes('/api/') && (f.endsWith('route.ts') || f.endsWith('route.js'))) ||
    f.includes('pages/api/')
  ).slice(0, 4);
  for (const r of apiRoutes) {
    if (!points.find(p => p.path === r)) {
      points.push({ path: r, description: `API route handler` });
    }
  }
  return points.slice(0, 10);
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json() as { url?: string };
    const repoUrl = body.url?.trim();
    if (!repoUrl) {
      return NextResponse.json({ error: 'GitHub repository URL is required.' }, { status: 400 });
    }

    const parsed = parseGithubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid GitHub URL. Expected https://github.com/owner/repo' }, { status: 400 });
    }
    const { owner, repo } = parsed;

    // Optional GitHub PAT from env for higher rate limits
    const token = process.env.GITHUB_TOKEN;

    // 1. Fetch the file tree
    let treeItems: GHTreeItem[];
    try {
      treeItems = await fetchRepoTree(owner, repo, token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `Cannot access repository. It may be private or the URL is incorrect. (${msg})` },
        { status: 422 },
      );
    }

    const blobItems = treeItems.filter(i => i.type === 'blob');
    const fileList = blobItems.map(i => i.path);

    // 2. Fetch source file contents (cap at preview extensions, prioritise key files)
    const fileContents: Record<string, string> = {};
    let totalFetched = 0;

    // Priority files first
    const priorityFiles = blobItems.filter(i => {
      const base = i.path.split('/').pop() ?? '';
      return ['package.json', 'go.mod', 'requirements.txt', 'pyproject.toml', 'README.md', 'readme.md'].includes(base);
    });
    const remainingFiles = blobItems.filter(i => {
      const ext = i.path.split('.').pop()?.toLowerCase() ?? '';
      return PREVIEW_EXTENSIONS.has(ext);
    });
    const orderedFiles = [...priorityFiles, ...remainingFiles.filter(f => !priorityFiles.includes(f))];

    for (const item of orderedFiles) {
      if (totalFetched >= MAX_ANALYSIS_CONTENT) break;
      const size = item.size ?? 0;
      if (size > MAX_FILE_PREVIEW) continue; // skip very large single files

      const ext = item.path.split('.').pop()?.toLowerCase() ?? '';
      if (!PREVIEW_EXTENSIONS.has(ext) && !['package.json', 'go.mod'].some(s => item.path.endsWith(s))) continue;

      try {
        const content = await fetchFileContent(item.url, token);
        fileContents[item.path] = content.slice(0, MAX_FILE_PREVIEW);
        totalFetched += content.length;
      } catch {
        // skip files that 404 or error
      }
    }

    const fullContent = Object.values(fileContents).join('\n');

    // 3. Build analysis
    const techStack = detectTechStack(fileList, fullContent);
    const architectureNodes: ArchitectureNode[] = [
      { id: 'frontend', label: 'Client / UI Layer', type: 'frontend', description: 'User interface components and pages', connectsTo: ['backend'] },
      { id: 'backend', label: 'API & Route Handlers', type: 'backend', description: 'Server-side logic and endpoints', connectsTo: ['database'] },
      { id: 'database', label: 'Data & Storage', type: 'database', description: 'Persistent storage and database triggers', connectsTo: [] },
    ];

    const codeMistakes: CodeMistake[] = [];
    if (fullContent.includes('console.log')) {
      codeMistakes.push({ title: 'Debug Console Logs', severity: 'low', description: 'console.log statements found in production code paths.', file: 'Multiple files' });
    }

    const securityVulnerabilities: SecurityVulnerability[] = [];
    if (fullContent.includes('password') || fullContent.includes('api_key') || fullContent.includes('secret')) {
      securityVulnerabilities.push({ title: 'Potential Hardcoded Secret', severity: 'high', description: 'Credential-related keywords found in source files.', file: 'Config/Env' });
    }

    const setupCommands = detectSetupCommandsFromTree(fileList, fileContents);
    const entryPoints = detectEntryPointsFromTree(fileList);

    const tsFiles = fileList.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).length;
    const jsFiles = fileList.filter(f => f.endsWith('.js') || f.endsWith('.jsx')).length;
    const hasTests = fileList.some(f => f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__'));
    const hasCI = fileList.some(f => f.includes('.github/') || f.includes('netlify') || f.includes('ci'));
    const hasMigrations = fileList.some(f => f.includes('migration') || f.includes('supabase'));
    const hasReadme = fileList.some(f => f.toLowerCase().endsWith('readme.md'));
    const debtScore = Math.max(10, 95 - codeMistakes.length * 5 - securityVulnerabilities.length * 10);
    const primaryLang = techStack.find(t => t.category === 'language')?.name ?? 'JavaScript';
    const primaryFramework = techStack.find(t => t.category === 'framework')?.name;
    const primaryDB = techStack.find(t => t.category === 'database')?.name;

    const corePurpose = `${owner}/${repo} is a ${primaryLang}${primaryFramework ? ` / ${primaryFramework}` : ''} project with ${fileList.length} files${primaryDB ? ` backed by ${primaryDB}` : ''}. ${tsFiles > 0 ? 'TypeScript is the primary language.' : ''} ${hasTests ? 'Test infrastructure is present.' : 'No test files detected.'}`;

    const architectureNarrative = `The project follows a ${techStack.length > 5 ? 'full-stack multi-layer' : 'lean'} architecture. ${hasMigrations ? 'Database migrations indicate a structured schema strategy.' : ''} ${hasCI ? 'CI/CD pipelines are configured.' : ''} ${codeMistakes.length + securityVulnerabilities.length === 0 ? 'No critical issues were found during static analysis.' : `${codeMistakes.length + securityVulnerabilities.length} issues were detected.`}`;

    const keyFeatures: string[] = [
      `${fileList.length} files across ${new Set(fileList.map(f => f.split('/')[0])).size} top-level directories`,
      `${techStack.length} detected technologies`,
      ...(hasTests ? ['Test infrastructure present'] : []),
      ...(hasMigrations ? ['Database migrations present'] : []),
      ...(hasCI ? ['CI/CD pipelines configured'] : []),
      ...(hasReadme ? ['README documentation present'] : []),
    ];

    const detectedApiEndpoints: ApiEndpoint[] = fileList
      .filter(f => (f.includes('/api/') && (f.endsWith('route.ts') || f.endsWith('route.js'))) || f.includes('pages/api/'))
      .slice(0, 10)
      .map(f => {
        const path = '/' + f.replace(/.*?(app|pages)\//, '').replace(/\/route\.(ts|js)$/, '').replace(/\.(ts|js)$/, '');
        return { method: 'GET' as const, path, purpose: `Handler for ${path}` };
      });

    const data: AnalysisData = {
      fileName: `${owner}/${repo}`,
      fileSize: totalFetched,
      summary: corePurpose,
      techStack,
      architecture: [
        { label: 'Repository', value: `${owner}/${repo}`, description: 'GitHub source repository' },
        { label: 'Total Files', value: `${fileList.length} files`, description: 'Files in default branch' },
        { label: 'Source Files', value: `${tsFiles + jsFiles} files`, description: `${tsFiles} TypeScript, ${jsFiles} JavaScript` },
        { label: 'Tech Debt Score', value: `${debtScore}/100`, description: 'Estimated quality score' },
      ],
      architecture_nodes: architectureNodes,
      code_mistakes: codeMistakes,
      anti_patterns: [],
      security_vulnerabilities: securityVulnerabilities,
      fileTree: fileList.join('\n'),
      fileContents,
      setupCommands,
      entryPoints,
      executiveOverview: { corePurpose, architectureNarrative, keyFeatures },
      apiEndpoints: detectedApiEndpoints.length > 0 ? detectedApiEndpoints : [
        { method: 'GET', path: '/', purpose: 'Root page or API entry point' },
      ],
      techDebtMetrics: [
        { label: 'Code Health', value: debtScore, max: 100, unit: '/100', description: 'Score based on detected issues', status: debtScore >= 80 ? 'good' : debtScore >= 55 ? 'warning' : 'critical' },
        { label: 'Documentation', value: hasReadme ? 75 : 20, max: 100, unit: '/100', description: hasReadme ? 'README found' : 'No README', status: hasReadme ? 'good' : 'warning' },
        { label: 'Test Coverage', value: hasTests ? 60 : 0, max: 100, unit: '/100', description: hasTests ? 'Test files present' : 'No tests found', status: hasTests ? 'good' : 'critical' },
      ],
      advancedMetrics: [],
    };

    // Persist
    try {
      await getSupabaseClient().from('projects').insert({
        file_name: data.fileName,
        file_size: data.fileSize,
        analysis: data,
      });
    } catch (err) {
      console.warn('Supabase persistence failed:', err);
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('GitHub analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'GitHub analysis failed.' },
      { status: 500 },
    );
  }
}
