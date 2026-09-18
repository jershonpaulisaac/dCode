export interface TechStackItem {
  name: string;
  category: 'language' | 'framework' | 'database' | 'tooling' | 'runtime' | 'library';
}

export interface ArchitectureMetric {
  label: string;
  value: string;
  description?: string;
}

export interface ExecutiveOverview {
  corePurpose: string;
  architectureNarrative: string;
  keyFeatures: string[];
}

export type SecuritySeverity = 'critical' | 'warning' | 'info' | 'success';

export interface SecurityFinding {
  severity: SecuritySeverity;
  title: string;
  description: string;
  detail?: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  purpose: string;
}

export type MetricStatus = 'good' | 'warning' | 'critical';

export interface TechDebtMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  description: string;
  status: MetricStatus;
}

export interface CodeDiff {
  title: string;
  description: string;
  beforeCode: string;
  afterCode: string;
  language: string;
}

export interface AnalysisData {
  id?: string;
  fileName: string;
  fileSize: number;
  summary: string;
  techStack: TechStackItem[];
  architecture: ArchitectureMetric[];
  fileTree: string;
  executiveOverview?: ExecutiveOverview;
  securityFindings?: SecurityFinding[];
  apiEndpoints?: ApiEndpoint[];
  techDebtMetrics?: TechDebtMetric[];
  recommendedRefactor?: CodeDiff;
  createdAt?: string;
}

export interface AnalysisRecord {
  id: string;
  file_name: string;
  file_size: number;
  summary: string;
  tech_stack: TechStackItem[];
  architecture: ArchitectureMetric[];
  file_tree: string;
  executive_overview: ExecutiveOverview | null;
  security_findings: SecurityFinding[] | null;
  api_endpoints: ApiEndpoint[] | null;
  tech_debt_metrics: TechDebtMetric[] | null;
  recommended_refactor: CodeDiff | null;
  created_at: string;
}

export function recordToAnalysisData(rec: AnalysisRecord): AnalysisData {
  return {
    id: rec.id,
    fileName: rec.file_name,
    fileSize: rec.file_size,
    summary: rec.summary,
    techStack: rec.tech_stack ?? [],
    architecture: rec.architecture ?? [],
    fileTree: rec.file_tree ?? '',
    executiveOverview: rec.executive_overview ?? undefined,
    securityFindings: rec.security_findings ?? undefined,
    apiEndpoints: rec.api_endpoints ?? undefined,
    techDebtMetrics: rec.tech_debt_metrics ?? undefined,
    recommendedRefactor: rec.recommended_refactor ?? undefined,
    createdAt: rec.created_at,
  };
}
