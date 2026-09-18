/*
# Create analyses table (single-tenant, no auth)

1. New Tables
- `analyses`
  - `id` (uuid, primary key)
  - `file_name` (text, name of uploaded file)
  - `file_size` (bigint, size in bytes)
  - `summary` (text, IBM Bob generated summary)
  - `tech_stack` (jsonb, array of {name, category} objects)
  - `architecture` (jsonb, key-value metrics)
  - `file_tree` (text, monospaced file tree)
  - `created_at` (timestamptz)
2. Security
- Enable RLS on `analyses`.
- Allow anon + authenticated CRUD (single-tenant, no sign-in).
*/

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  summary text DEFAULT '',
  tech_stack jsonb DEFAULT '[]'::jsonb,
  architecture jsonb DEFAULT '{}'::jsonb,
  file_tree text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analyses" ON analyses;
CREATE POLICY "anon_select_analyses" ON analyses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analyses" ON analyses;
CREATE POLICY "anon_insert_analyses" ON analyses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analyses" ON analyses;
CREATE POLICY "anon_update_analyses" ON analyses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analyses" ON analyses;
CREATE POLICY "anon_delete_analyses" ON analyses FOR DELETE
  TO anon, authenticated USING (true);
