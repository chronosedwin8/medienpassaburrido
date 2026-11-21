-- Asignaciones de actividades (retos 0 a 6 de una materia) a estudiantes o cursos completos.
-- Ejecutar una vez en Supabase › SQL Editor. Mientras la tabla no exista, la app guarda las
-- asignaciones en data/activity_assignments.json (que en CapRover se pierde al publicar).
-- Los estudiantes se identifican por su código (el de Phidias), que no cambia de un año a otro.

CREATE TABLE IF NOT EXISTS activity_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    activity_ids TEXT[] NOT NULL DEFAULT '{}',
    class_names TEXT[] NOT NULL DEFAULT '{}',
    student_codes TEXT[] NOT NULL DEFAULT '{}',
    due_date DATE,
    note TEXT,
    school_year TEXT,
    created_by TEXT,
    created_by_name TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_classes ON activity_assignments USING GIN (class_names);
CREATE INDEX IF NOT EXISTS idx_assignments_students ON activity_assignments USING GIN (student_codes);

ALTER TABLE activity_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on activity_assignments" ON activity_assignments;
CREATE POLICY "Allow all operations on activity_assignments"
    ON activity_assignments FOR ALL USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_assignments ON activity_assignments;
CREATE TRIGGER set_updated_at_assignments
    BEFORE UPDATE ON activity_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
