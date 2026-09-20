CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  analysis jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS architecture_nodes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS code_mistakes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS anti_patterns jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS security_vulnerabilities jsonb DEFAULT '[]'::jsonb;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);
