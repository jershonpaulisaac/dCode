export interface TechStackItem {
  name: string;
  category: 'language' | 'framework' | 'database' | 'tooling' | 'runtime' | 'library';
}

export interface ArchitectureMetric {
  label: string;
  value: string;
  description?: string;
}

export interface AnalysisData {
  id?: string;
  fileName: string;
  fileSize: number;
  summary: string;
  techStack: TechStackItem[];
  architecture: ArchitectureMetric[];
  fileTree: string;
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
    createdAt: rec.created_at,
  };
}
