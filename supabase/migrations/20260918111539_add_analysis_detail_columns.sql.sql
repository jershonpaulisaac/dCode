/*
# Add analysis detail columns for expanded dashboard

1. Modified Tables
- `analyses`
  - `executive_overview` (jsonb, nullable) — structured { corePurpose, architectureNarrative, keyFeatures[] } object for the Executive Overview card
  - `security_findings` (jsonb, nullable) — array of { severity, title, description, detail? } objects for the Security Audit panel
  - `api_endpoints` (jsonb, nullable) — array of { method, path, purpose } objects for the API & Routing Map
  - `tech_debt_metrics` (jsonb, nullable) — array of { label, value, max, unit, description, status } objects for the Technical Debt gauges
  - `recommended_refactor` (jsonb, nullable) — single { title, description, beforeCode, afterCode, language } object for the AI Action Hub code diff

2. Security
- No changes to RLS policies. The existing anon/authenticated CRUD policies remain in effect.
- All new columns are nullable so existing rows are unaffected.

3. Notes
- No destructive operations. Columns are added with ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
- The `architecture` column type remains jsonb (was already jsonb).
*/

ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS executive_overview jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS security_findings jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS api_endpoints jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tech_debt_metrics jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recommended_refactor jsonb DEFAULT NULL;
