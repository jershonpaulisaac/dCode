import { NextResponse } from 'next/server';
import type {
  AnalysisData,
  TechStackItem,
  ArchitectureMetric,
  ExecutiveOverview,
  SecurityFinding,
  ApiEndpoint,
  TechDebtMetric,
  CodeDiff,
} from '@/lib/types';
import { mockAnalysisData } from '@/lib/mockData';

export const runtime = 'nodejs';

interface AnalyzeRequestBody {
  fileName?: string;
  fileSize?: number;
  fileContent?: string;
}

function buildBobPrompt(fileName: string, fileContent?: string): string {
  const contentSection = fileContent
    ? `\n\nFile contents:\n\`\`\`\n${fileContent.slice(0, 50000)}\n\`\`\``
    : '\n\n(No file content provided — analyze based on the file name and metadata.)';

  return `You are IBM Bob, an enterprise AI code analysis agent. Analyze the following uploaded codebase file and produce a structured JSON analysis.

File name: ${fileName}${contentSection}

Return a JSON object with this exact shape:
{
  "summary": "A detailed 3-5 sentence paragraph explaining what this project does, its architecture, and its primary use case.",
  "techStack": [{ "name": "string", "category": "language|framework|database|tooling|runtime|library" }],
  "architecture": [{ "label": "string", "value": "string", "description": "string (optional)" }],
  "fileTree": "A monospaced text representation of the project folder structure",
  "executiveOverview": {
    "corePurpose": "string",
    "architectureNarrative": "string",
    "keyFeatures": ["string"]
  },
  "securityFindings": [{ "severity": "critical|warning|info|success", "title": "string", "description": "string", "detail": "string (optional)" }],
  "apiEndpoints": [{ "method": "GET|POST|PUT|DELETE|PATCH", "path": "string", "purpose": "string" }],
  "techDebtMetrics": [{ "label": "string", "value": "number", "max": "number", "unit": "string", "description": "string", "status": "good|warning|critical" }],
  "recommendedRefactor": { "title": "string", "description": "string", "beforeCode": "string", "afterCode": "string", "language": "string" }
}`;
}

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequestBody = await request.json();
    const fileName = body.fileName || 'unknown.zip';
    const fileSize = body.fileSize || 0;
    const fileContent = body.fileContent;

    const bobApiKey = process.env.BOB_API_KEY;

    if (!bobApiKey) {
      return NextResponse.json(
        {
          ...mockAnalysisData,
          fileName,
          fileSize,
          summary: `${mockAnalysisData.summary}\n\nNote: Analysis generated from mock data. Set BOB_API_KEY in your environment to enable live IBM Bob inference.`,
        } as AnalysisData,
        { status: 200 }
      );
    }

    const prompt = buildBobPrompt(fileName, fileContent);

    const bobResponse = await fetch('https://api.ibm-bob.example.com/v1/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobApiKey}`,
        'X-Agent': 'dCode',
      },
      body: JSON.stringify({
        prompt,
        model: 'bob-enterprise-latest',
        response_format: { type: 'json_object' },
      }),
    });

    if (!bobResponse.ok) {
      const errorText = await bobResponse.text();
      console.error('IBM Bob API error:', bobResponse.status, errorText);
      return NextResponse.json(
        {
          error: `IBM Bob API returned status ${bobResponse.status}. ${errorText}`,
        },
        { status: 502 }
      );
    }

    const bobData = await bobResponse.json();

    const analysisData: AnalysisData = {
      fileName,
      fileSize,
      summary: bobData.summary || 'No summary available.',
      techStack: (bobData.techStack || []) as TechStackItem[],
      architecture: (bobData.architecture || []) as ArchitectureMetric[],
      fileTree: bobData.fileTree || '',
      executiveOverview: (bobData.executiveOverview || undefined) as ExecutiveOverview | undefined,
      securityFindings: (bobData.securityFindings || undefined) as SecurityFinding[] | undefined,
      apiEndpoints: (bobData.apiEndpoints || undefined) as ApiEndpoint[] | undefined,
      techDebtMetrics: (bobData.techDebtMetrics || undefined) as TechDebtMetric[] | undefined,
      recommendedRefactor: (bobData.recommendedRefactor || undefined) as CodeDiff | undefined,
    };

    return NextResponse.json(analysisData, { status: 200 });
  } catch (error) {
    console.error('Analyze route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
