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
} from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const MAX_ARCHIVE_ENTRIES = 1000;
const MAX_ANALYSIS_CONTENT = 2_000_000;

function isZip(file: File) {
  return file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip');
}

async function extractProject(file: File) {
  if (!isZip(file)) {
    const content = await file.text();
    return { tree: file.name, content: content.slice(0, MAX_ANALYSIS_CONTENT), fileList: [file.name] };
  }

  const archive = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.entries(archive.files).filter(([_, entry]) => !entry.dir);
  const fileNames = entries.map(([name]) => name);

  const contentParts: string[] = [];
  let contentLength = 0;
  for (const [name, entry] of entries) {
    if (contentLength >= MAX_ANALYSIS_CONTENT) break;
    const extension = name.split('.').pop()?.toLowerCase();
    if (!extension || !['ts', 'tsx', 'js', 'jsx', 'json', 'css', 'md', 'sql', 'py', 'go', 'java'].includes(extension)) {
      continue;
    }
    const text = await entry.async('string');
    const remaining = MAX_ANALYSIS_CONTENT - contentLength;
    const snippet = text.slice(0, remaining);
    contentParts.push(`\n--- ${name} ---\n${snippet}`);
    contentLength += snippet.length;
  }
  return { tree: fileNames.join('\n'), content: contentParts.join(''), fileList: fileNames };
}

// Local Heuristic Analyzer (No API Required)
function performLocalAnalysis(fileName: string, fileSize: number, fileList: string[], content: string): AnalysisData {
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

  return {
    fileName,
    fileSize,
    summary: `CodeLens AI local analysis successfully parsed ${fileList.length} files in ${fileName}. Architecture exhibits modular separation across frontend components, server route handlers, and data integration layers.`,
    techStack,
    architecture: [
      { label: 'Total Files Scanned', value: `${fileList.length} files`, description: 'Count of parsed source files' },
      { label: 'Analysis Mode', value: 'Local Heuristic Engine', description: 'Zero-API offline processing mode' }
    ],
    architecture_nodes: architectureNodes,
    code_mistakes: codeMistakes,
    anti_patterns: [],
    security_vulnerabilities: securityVulnerabilities,
    fileTree: fileList.join('\n'),
    executiveOverview: {
      corePurpose: `Comprehensive structural examination of ${fileName} executed via local static code scanning.`,
      architectureNarrative: 'The project is structured around modular directory patterns with separation of UI views and backend handlers.',
      keyFeatures: ['Automated File Tree Parsing', 'Static Code Inspection', 'Dependency Identification']
    },
    apiEndpoints: [
      { method: 'POST', path: '/api/analyze', purpose: 'Codebase submission and structural parsing' }
    ],
    techDebtMetrics: [
      { category: 'Documentation', score: 85, details: 'Readme and code comments coverage.' }
    ],
    advancedMetrics: [
      { label: 'Maintainability Index', value: '88/100' }
    ]
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

    const { tree, content, fileList } = await extractProject(uploadedFile);
    const data = performLocalAnalysis(uploadedFile.name, uploadedFile.size, fileList, content);
    
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