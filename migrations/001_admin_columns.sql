-- Run this migration in Supabase SQL Editor:
-- https://app.supabase.com/project/oklsflrolbjixfsyhfyd/sql

-- Add full_name and student_code columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_code TEXT;

-- Add unique constraint for username+class_name to support upserts
-- (Check if it already exists first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'students_username_class_name_key'
    ) THEN
        ALTER TABLE students ADD CONSTRAINT students_username_class_name_key UNIQUE (username, class_name);
    END IF;
END $$;
