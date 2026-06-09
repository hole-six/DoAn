-- Manual Migration: Drop JSON columns
-- Created: 2026-06-09
-- Description: Remove kyNang and portfolio JSON fields, use only relational tables

-- Drop JSON columns from ung_vien
ALTER TABLE ung_vien DROP COLUMN IF EXISTS "kyNang";
ALTER TABLE ung_vien DROP COLUMN IF EXISTS "portfolio";

-- Drop JSON column from tin_tuyen_dung
ALTER TABLE tin_tuyen_dung DROP COLUMN IF EXISTS "kyNang";

-- Verify tables still exist and have correct structure
-- Expected: ung_vien should have kyNangLienKet relation
-- Expected: tin_tuyen_dung should have kyNangLienKet relation
