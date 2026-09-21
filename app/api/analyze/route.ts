import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import type {
  AnalysisData,
  ArchitectureMetric,
  ArchitectureNode,
  CodeDiff,
  CodeMistake,
  ExecutiveOverview,
  SecurityFinding,
  SecurityVulnerability,
  ApiEndpoint,
  TechDebtMetric,
  TechStackItem,
  AdvancedMetric,
  SetupCommand,
  EntryPoint,
} from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const MAX_ARCHIVE_ENTRIES = 1000;
const MAX_ANALYSIS_CONTENT = 2_000_000;
const MAX_FILE_PREVIEW = 50_000; // max bytes per file stored for preview
const PREVIEW_EXTENSIONS = new Set(['ts', 'tsx', 'js', 'jsx', 'json', 'css', 'md', 'sql', 'py', 'go', 'java', 'html', 'yml', 'yaml', 'toml', 'env', 'sh']);

function isZip(file: File) {
  return file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip');
}

async function extractProject(file: File) {
  if (!isZip(file)) {
    const content = await file.text();
    const fileContents: Record<string, string> = { [file.name]: content.slice(0, MAX_FILE_PREVIEW) };
    return { content: content.slice(0, MAX_ANALYSIS_CONTENT), fileList: [file.name], fileContents };
  }

  const archive = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.entries(archive.files).filter(([_, entry]) => !entry.dir);
  const fileNames = entries.map(([name]) => name);

  const contentParts: string[] = [];
  const fileContents: Record<string, string> = {};
  let contentLength = 0;

  for (const [name, entry] of entries) {
    const extension = name.split('.').pop()?.toLowerCase() ?? '';
    if (!PREVIEW_EXTENSIONS.has(extension)) continue;

    const text = await entry.async('string');
    // Store file content for preview (capped per file)
    fileContents[name] = text.slice(0, MAX_FILE_PREVIEW);

    if (contentLength < MAX_ANALYSIS_CONTENT) {
      const remaining = MAX_ANALYSIS_CONTENT - contentLength;
      const snippet = text.slice(0, remaining);
      contentParts.push(`\n--- ${name} ---\n${snippet}`);
      contentLength += snippet.length;
    }
  }
  return { content: contentParts.join(''), fileList: fileNames, fileContents };
}

// ─── Setup command + entry point detection ──────────────────────────────────
function detectSetupCommands(fileList: string[], fileContents: Record<string, string>): SetupCommand[] {
  const cmds: SetupCommand[] = [];
  const hasPkg = fileList.some(f => f.endsWith('package.json'));
  const hasPnpm = fileList.some(f => f.includes('pnpm-lock'));
  const hasYarn = fileList.some(f => f.includes('yarn.lock'));
  const hasPoetry = fileList.some(f => f.includes('pyproject.toml'));
  const hasRequirements = fileList.some(f => f.endsWith('requirements.txt'));
  const hasGoMod = fileList.some(f => f.endsWith('go.mod'));
  const hasDockerCompose = fileList.some(f => f.includes('docker-compose'));
  const hasMakefile = fileList.some(f => f.toLowerCase() === 'makefile');
  const hasPrisma = fileList.some(f => f.includes('prisma/schema'));

  if (hasPkg) {
    const pm = hasPnpm ? 'pnpm' : hasYarn ? 'yarn' : 'npm';
    const install = pm === 'npm' ? 'npm install' : pm === 'yarn' ? 'yarn' : 'pnpm install';
    cmds.push({ command: install, description: 'Install all project dependencies' });

    // Try to read scripts from package.json
    const pkgFile = Object.keys(fileContents).find(f => f.endsWith('package.json') && !f.includes('node_modules'));
    if (pkgFile) {
      try {
        const pkg = JSON.parse(fileContents[pkgFile]);
        const scripts: Record<string, string> = pkg.scripts ?? {};
        if (scripts.dev) cmds.push({ command: `${pm === 'npm' ? 'npm run' : pm} dev`, description: 'Start development server' });
        else if (scripts.start) cmds.push({ command: `${pm === 'npm' ? 'npm run' : pm} start`, description: 'Start the application' });
        if (scripts.build) cmds.push({ command: `${pm === 'npm' ? 'npm run' : pm} build`, description: 'Build for production' });
        if (scripts.test) cmds.push({ command: `${pm === 'npm' ? 'npm run' : pm} test`, description: 'Run test suite' });
        if (scripts.lint) cmds.push({ command: `${pm === 'npm' ? 'npm run' : pm} lint`, description: 'Lint source files' });
      } catch { /* ignore malformed JSON */ }
    }
  }
  if (hasPoetry) {
    cmds.push({ command: 'poetry install', description: 'Install Python dependencies via Poetry' });
    cmds.push({ command: 'poetry run python main.py', description: 'Run the Python application' });
  } else if (hasRequirements) {
    cmds.push({ command: 'pip install -r requirements.txt', description: 'Install Python dependencies' });
  }
  if (hasGoMod) {
    cmds.push({ command: 'go mod download', description: 'Download Go module dependencies' });
    cmds.push({ command: 'go run .', description: 'Run the Go application' });
  }
  if (hasDockerCompose) {
    cmds.push({ command: 'docker-compose up -d', description: 'Start all services via Docker Compose' });
  }
  if (hasPrisma) {
    cmds.push({ command: 'npx prisma migrate dev', description: 'Run Prisma database migrations' });
    cmds.push({ command: 'npx prisma generate', description: 'Generate Prisma client' });
  }
  if (hasMakefile) {
    cmds.push({ command: 'make', description: 'Run default Makefile target' });
  }
  return cmds;
}

function detectEntryPoints(fileList: string[], fileContents: Record<string, string>): EntryPoint[] {
  const points: EntryPoint[] = [];
  const candidates: [string, string][] = [
    ['app/page.tsx', 'Next.js App Router root page'],
    ['app/page.jsx', 'Next.js App Router root page'],
    ['pages/index.tsx', 'Next.js Pages Router index'],
    ['pages/index.jsx', 'Next.js Pages Router index'],
    ['src/index.tsx', 'React application entry point'],
    ['src/index.jsx', 'React application entry point'],
    ['src/main.tsx', 'Vite React entry point'],
    ['src/main.jsx', 'Vite React entry point'],
    ['src/App.tsx', 'Root application component'],
    ['main.py', 'Python application entry point'],
    ['app.py', 'Python Flask/FastAPI application'],
    ['main.go', 'Go application entry point'],
    ['cmd/main.go', 'Go CLI entry point'],
    ['index.js', 'Node.js entry point'],
    ['src/index.js', 'Node.js entry point'],
    ['server.js', 'Node.js server entry point'],
    ['app/layout.tsx', 'Next.js root layout'],
    ['app/layout.jsx', 'Next.js root layout'],
  ];

  for (const [candidate, desc] of candidates) {
    const match = fileList.find(f => f.endsWith(candidate) || f === candidate);
    if (match) points.push({ path: match, description: desc });
  }

  // Also include api routes
  const apiRoutes = fileList.filter(f =>
    (f.includes('/api/') && (f.endsWith('route.ts') || f.endsWith('route.js'))) ||
    f.includes('pages/api/')
  ).slice(0, 5);
  for (const route of apiRoutes) {
    if (!points.find(p => p.path === route)) {
      const name = route.split('/').slice(-3).join('/');
      points.push({ path: route, description: `API route handler — ${name}` });
    }
  }

  return points.slice(0, 10);
}

// Local Heuristic Analyzer (No API Required)
function performLocalAnalysis(
  fileName: string,
  fileSize: number,
  fileList: string[],
  content: string,
  fileContents: Record<string, string>,
): AnalysisData {
  const techStack: TechStackItem[] = [];
  if (fileList.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) techStack.push({ name: 'TypeScript', category: 'language' });
  if (fileList.some(f => f.endsWith('.js') || f.endsWith('.jsx'))) techStack.push({ name: 'JavaScript', category: 'language' });
  if (fileList.some(f => f.includes('next.config') || fileList.some(f => f.includes('app/')))) techStack.push({ name: 'Next.js App Router', category: 'framework' });
  if (fileList.some(f => f.includes('tailwind'))) techStack.push({ name: 'Tailwind CSS', category: 'tooling' });
  if (fileList.some(f => f.includes('supabase') || content.includes('supabase'))) techStack.push({ name: 'Supabase', category: 'database' });
  if (fileList.some(f => f.endsWith('.py'))) techStack.push({ name: 'Python', category: 'language' });

  if (techStack.length === 0) {
    techStack.push({ name: 'Node.js', category: 'runtime' }, { name: 'JavaScript', category: 'language' });
  }

  const architectureNodes: ArchitectureNode[] = [
    { id: 'frontend', label: 'Client / UI Layer', type: 'frontend', description: 'User interface components and pages', connectsTo: ['backend'] },
    { id: 'backend', label: 'API & Route Handlers', type: 'backend', description: 'Server-side logic and endpoints', connectsTo: ['database'] },
    { id: 'database', label: 'Data & Storage', type: 'database', description: 'Persistent storage and database triggers', connectsTo: [] }
  ];

  const codeMistakes: CodeMistake[] = [];
  if (content.includes('console.log')) {
    codeMistakes.push({ title: 'Unsanitized Console Logs', severity: 'low', description: 'Found debug console.log statements in production code path.', file: 'Multiple Files', line: 0 });
  }
  if (!content.includes('try {') && !content.includes('catch')) {
    codeMistakes.push({ title: 'Missing Error Handling', severity: 'medium', description: 'Async operations lack robust try/catch blocks.', file: 'API Routes', line: 0 });
  }

  const securityVulnerabilities: SecurityVulnerability[] = [];
  if (content.includes('password') || content.includes('secret') || content.includes('api_key')) {
    securityVulnerabilities.push({ title: 'Potential Hardcoded Secret', severity: 'high', description: 'Keywords matching credentials or secrets identified in source files.', file: 'Config/Env', line: 0 });
  }

  // Build a rich executive overview from the detected signals
  const hasReadme = fileList.some(f => f.toLowerCase().includes('readme'));
  const hasTests = fileList.some(f => f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__'));
  const hasCI = fileList.some(f => f.includes('.github') || f.includes('netlify') || f.includes('vercel') || f.includes('ci'));
  const hasMigrations = fileList.some(f => f.includes('migration') || f.includes('supabase'));
  const tsFiles = fileList.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).length;
  const jsFiles = fileList.filter(f => f.endsWith('.js') || f.endsWith('.jsx')).length;
  const totalSourceFiles = tsFiles + jsFiles;

  const primaryLang = techStack.find(t => t.category === 'language')?.name ?? 'JavaScript';
  const primaryFramework = techStack.find(t => t.category === 'framework')?.name;
  const primaryDB = techStack.find(t => t.category === 'database')?.name;

  const corePurpose = [
    `${fileName} is a ${primaryLang}${primaryFramework ? ` / ${primaryFramework}` : ''} project comprising ${fileList.length} files`,
    primaryDB ? ` backed by ${primaryDB}` : '',
    `. The codebase is structured for ${totalSourceFiles > 50 ? 'a production-scale' : 'a focused'} application,`,
    ` with ${tsFiles > 0 ? 'strong TypeScript adoption' : 'JavaScript as the primary language'}`,
    ` and ${hasTests ? 'test coverage present' : 'no detected test files'}.`,
  ].join('');

  const architectureNarrative = [
    architectureNodes.map(n => `The ${n.label} layer handles ${n.description.toLowerCase()}`).join('; ') + '.',
    hasMigrations ? ' Database migrations indicate a structured schema evolution strategy.' : '',
    hasCI ? ' Continuous integration configuration is present, enabling automated deployment pipelines.' : '',
    ` Overall, the project follows ${techStack.length > 6 ? 'a full-stack multi-layer' : 'a lean'} architecture pattern`,
    ` with ${codeMistakes.length === 0 && securityVulnerabilities.length === 0 ? 'no critical issues' : `${codeMistakes.length + securityVulnerabilities.length} issues detected`} during static analysis.`,
  ].join('');

  const keyFeatures: string[] = [
    `${fileList.length} source files across ${new Set(fileList.map(f => f.split('/')[0])).size} top-level directories`,
    `${techStack.length} detected technologies spanning languages, frameworks, and tooling`,
    ...(hasTests ? ['Automated test infrastructure present'] : []),
    ...(hasMigrations ? ['Database migration management with versioned schemas'] : []),
    ...(hasCI ? ['CI/CD pipeline configuration detected'] : []),
    ...(hasReadme ? ['Project documentation (README) present'] : ['No README documentation detected']),
  ];

  const debtScore = Math.max(10, 95 - codeMistakes.length * 5 - securityVulnerabilities.length * 10);

  const setupCommands = detectSetupCommands(fileList, fileContents);
  const entryPoints = detectEntryPoints(fileList, fileContents);

  // Detect API endpoints from file paths
  const detectedApiEndpoints: ApiEndpoint[] = fileList
    .filter(f => f.includes('/api/') && (f.endsWith('route.ts') || f.endsWith('route.js') || f.includes('pages/api/')))
    .slice(0, 10)
    .map(f => {
      const path = '/' + f.replace(/.*?(app|pages)\//, '').replace(/\/route\.(ts|js)$/, '').replace(/\.(ts|js|tsx|jsx)$/, '');
      return { method: 'GET' as const, path, purpose: `Handler for ${path}` };
    });
  if (detectedApiEndpoints.length === 0) {
    detectedApiEndpoints.push({ method: 'POST', path: '/api/analyze', purpose: 'Codebase submission and structural parsing' });
  }

  return {
    fileName,
    fileSize,
    summary: corePurpose,
    techStack,
    architecture: [
      { label: 'Total Files Scanned', value: `${fileList.length} files`, description: 'Count of parsed source files' },
      { label: 'Source Files', value: `${totalSourceFiles} files`, description: `${tsFiles} TypeScript, ${jsFiles} JavaScript` },
      { label: 'Analysis Mode', value: 'Local Heuristic Engine', description: 'Static code scanning without external API' },
      { label: 'Tech Debt Score', value: `${debtScore}/100`, description: 'Estimated code quality score' },
    ],
    architecture_nodes: architectureNodes,
    code_mistakes: codeMistakes,
    anti_patterns: [],
    security_vulnerabilities: securityVulnerabilities,
    fileTree: fileList.join('\n'),
    fileContents,
    setupCommands,
    entryPoints,
    executiveOverview: {
      corePurpose,
      architectureNarrative,
      keyFeatures,
    },
    apiEndpoints: detectedApiEndpoints,
    techDebtMetrics: [
      {
        label: 'Code Health',
        value: debtScore,
        max: 100,
        unit: '/100',
        description: 'Composite score based on detected mistakes and vulnerabilities',
        status: debtScore >= 80 ? 'good' : debtScore >= 55 ? 'warning' : 'critical',
      },
      {
        label: 'Documentation',
        value: hasReadme ? 75 : 20,
        max: 100,
        unit: '/100',
        description: hasReadme ? 'README present; inline comments not assessed' : 'No README found',
        status: hasReadme ? 'good' : 'warning',
      },
      {
        label: 'Test Coverage',
        value: hasTests ? 60 : 0,
        max: 100,
        unit: '/100',
        description: hasTests ? 'Test files detected in the project' : 'No test files found',
        status: hasTests ? 'good' : 'critical',
      },
    ],
    advancedMetrics: [],
  };
}

async function persistAnalysis(data: AnalysisData) {
  try {
    await getSupabaseClient().from('projects').insert({
      file_name: data.fileName,
      file_size: data.fileSize,
      analysis: data,
    });
  } catch (err) {
    console.warn('Supabase persistence bypassed or failed:', err);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get('file');
    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: 'A project file is required.' }, { status: 400 });
    }

    const { content, fileList, fileContents } = await extractProject(uploadedFile);
    const data = performLocalAnalysis(uploadedFile.name, uploadedFile.size, fileList, content, fileContents);
    
    await persistAnalysis(data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Local analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Local analysis failed.' },
      { status: 500 }
    );
  }
}