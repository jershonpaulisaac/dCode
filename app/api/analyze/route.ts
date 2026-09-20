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
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'tar' || extension === 'gz' || extension === 'tgz') {
      throw new Error('Only ZIP archives or individual text source files are supported.');
    }
    const content = await file.text();
    return { tree: file.name, content: content.slice(0, MAX_ANALYSIS_CONTENT) };
  }

  const archive = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.values(archive.files).filter((entry) => !entry.dir);
  if (entries.length > MAX_ARCHIVE_ENTRIES) {
    throw new Error(`Uploaded archive contains more than ${MAX_ARCHIVE_ENTRIES} files.`);
  }

  const tree = entries.map((entry) => entry.name).join('\n');
  const contentParts: string[] = [];
  let contentLength = 0;
  for (const entry of entries) {
    if (contentLength >= MAX_ANALYSIS_CONTENT) break;
    const extension = entry.name.split('.').pop()?.toLowerCase();
    if (!extension || !['ts', 'tsx', 'js', 'jsx', 'json', 'css', 'md', 'sql', 'py', 'go', 'java'].includes(extension)) {
      continue;
    }
    const text = await entry.async('string');
    const remaining = MAX_ANALYSIS_CONTENT - contentLength;
    const snippet = text.slice(0, remaining);
    contentParts.push(`\n--- ${entry.name} ---\n${snippet}`);
    contentLength += snippet.length;
  }
  return { tree, content: contentParts.join('') };
}

function buildBobPrompt(fileName: string, tree: string, content: string) {
  return `You are the CodeLens AI code intelligence engine. Analyze the actual uploaded project below. Do not invent files, findings, metrics, or architecture. Every finding must be grounded in the supplied file tree or code.

Project: ${fileName}
FILE TREE:
${tree}

SOURCE CONTENT:
${content}

Return only valid JSON matching this exact schema. Use empty arrays when no evidence exists:
{
  "summary": "string",
  "techStack": [{ "name": "string", "category": "language|framework|database|tooling|runtime|library" }],
  "architecture": [{ "label": "string", "value": "string", "description": "string" }],
  "architecture_nodes": [{ "id": "string", "label": "string", "type": "frontend|backend|database|service|external", "description": "string", "connectsTo": ["node id"] }],
  "fileTree": "string",
  "executiveOverview": { "corePurpose": "string", "architectureNarrative": "string", "keyFeatures": ["string"] },
  "securityFindings": [],
  "apiEndpoints": [{ "method": "GET|POST|PUT|DELETE|PATCH", "path": "string", "purpose": "string" }],
  "techDebtMetrics": [],
  "advancedMetrics": [],
  "code_mistakes": [{ "title": "string", "severity": "low|medium|high|critical", "description": "string", "file": "string", "line": 0 }],
  "anti_patterns": [{ "title": "string", "severity": "low|medium|high|critical", "description": "string", "file": "string", "line": 0 }],
  "security_vulnerabilities": [{ "title": "string", "severity": "low|medium|high|critical", "description": "string", "file": "string", "line": 0 }],
  "recommendedRefactor": null
}`;
}

function parseBobResponse(value: unknown, fileName: string, fileSize: number): AnalysisData {
  if (!value || typeof value !== 'object') throw new Error('IBM Bob returned a non-object response.');
  const data = value as Record<string, unknown>;
  const requiredArrays = ['techStack', 'architecture', 'architecture_nodes', 'code_mistakes', 'anti_patterns', 'security_vulnerabilities'];
  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) throw new Error(`IBM Bob response is missing array: ${key}.`);
  }
  if (typeof data.summary !== 'string' || typeof data.fileTree !== 'string') {
    throw new Error('IBM Bob response is missing summary or fileTree.');
  }
  return {
    fileName,
    fileSize,
    summary: data.summary,
    techStack: data.techStack as TechStackItem[],
    architecture: data.architecture as ArchitectureMetric[],
    architecture_nodes: data.architecture_nodes as ArchitectureNode[],
    code_mistakes: data.code_mistakes as CodeMistake[],
    anti_patterns: data.anti_patterns as CodeMistake[],
    security_vulnerabilities: data.security_vulnerabilities as SecurityVulnerability[],
    fileTree: data.fileTree,
    executiveOverview: data.executiveOverview as ExecutiveOverview | undefined,
    securityFindings: data.securityFindings as SecurityFinding[] | undefined,
    apiEndpoints: data.apiEndpoints as ApiEndpoint[] | undefined,
    techDebtMetrics: data.techDebtMetrics as TechDebtMetric[] | undefined,
    advancedMetrics: data.advancedMetrics as AdvancedMetric[] | undefined,
    recommendedRefactor: data.recommendedRefactor as CodeDiff | undefined,
  };
}

async function persistAnalysis(data: AnalysisData) {
  const { error } = await getSupabaseClient().from('projects').insert({
    file_name: data.fileName,
    file_size: data.fileSize,
    analysis: data,
  });
  if (error) throw new Error(`Supabase project persistence failed: ${error.message}`);
}

export async function POST(request: Request) {
  try {
    const bobApiKey = process.env.BOB_API_KEY;
    if (!bobApiKey) {
      return NextResponse.json({ error: 'BOB_API_KEY is not configured.' }, { status: 503 });
    }

    const formData = await request.formData();
    const uploadedFile = formData.get('file');
    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: 'A project file is required.' }, { status: 400 });
    }

    const { tree, content } = await extractProject(uploadedFile);
    const bobResponse = await fetch('https://api.ibm-bob.example.com/v1/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ['Bearer', bobApiKey].join(' '),
        'X-Agent': 'CodeLens AI',
      },
      body: JSON.stringify({
        prompt: buildBobPrompt(uploadedFile.name, tree, content),
        model: 'bob-enterprise-latest',
        response_format: { type: 'json_object' },
      }),
    });

    if (!bobResponse.ok) {
      const errorText = await bobResponse.text();
      console.error('IBM Bob API error:', bobResponse.status, errorText);
      return NextResponse.json({ error: `IBM Bob API returned status ${bobResponse.status}.` }, { status: 502 });
    }

    const data = parseBobResponse(await bobResponse.json(), uploadedFile.name, uploadedFile.size);
    await persistAnalysis(data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Analyze route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Live analysis failed.' },
      { status: 500 }
    );
  }
}
