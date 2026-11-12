-- Run after 001_admin_columns.sql in the Supabase SQL Editor.
-- Resolve any duplicate non-empty student codes before applying this migration.
DO $$
BEGIN
    IF EXISTS (
        SELECT btrim(student_code)
        FROM students
        WHERE student_code IS NOT NULL AND btrim(student_code) <> ''
        GROUP BY btrim(student_code)
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate student_code values exist; resolve them before adding the unique index.';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_code_unique
    ON students (btrim(student_code))
    WHERE student_code IS NOT NULL AND btrim(student_code) <> '';
