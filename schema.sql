-- ============================================
-- Medienpass App - Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard -> Your Project -> SQL Editor

-- 1. Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    class_name TEXT NOT NULL DEFAULT '4D',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create activity_responses table
CREATE TABLE IF NOT EXISTS activity_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    activity_id TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    period INTEGER DEFAULT 1,
    school_year TEXT DEFAULT '2627',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, activity_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_responses_student ON activity_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_responses_activity ON activity_responses(activity_id);
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);

-- 4. Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_responses ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public access (using anon key)
-- Since this is a simple school app without auth, we allow all operations
CREATE POLICY "Allow all operations on students"
    ON students FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on activity_responses"
    ON activity_responses FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to auto-update updated_at on activity_responses
DROP TRIGGER IF EXISTS set_updated_at ON activity_responses;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON activity_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NEW TABLES FOR PSP 3.1
-- ============================================

-- 8. Create incidents table for bitacora de novedades
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID,
    classroom TEXT NOT NULL,
    device_type TEXT,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'media',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create devices table for inventory
CREATE TABLE IF NOT EXISTS devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    serial_number TEXT UNIQUE,
    type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    status TEXT DEFAULT 'available',
    location TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create device_loans table for equipment tracking
CREATE TABLE IF NOT EXISTS device_loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID REFERENCES devices(id),
    student_id UUID REFERENCES students(id),
    loaned_at TIMESTAMPTZ DEFAULT NOW(),
    returned_at TIMESTAMPTZ,
    classroom TEXT,
    notes TEXT
);

-- 11. Enable RLS and create policies for new tables
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on incidents" ON incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on devices" ON devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on device_loans" ON device_loans FOR ALL USING (true) WITH CHECK (true);

-- 12. Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_classroom ON incidents(classroom);
CREATE INDEX IF NOT EXISTS idx_devices_location ON devices(location);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_device_loans_device ON device_loans(device_id);
CREATE INDEX IF NOT EXISTS idx_device_loans_student ON device_loans(student_id);
