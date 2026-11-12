// Manual técnico (/docs/technical, solo perfil desarrollador). Cada sección usa las claves
// man_t_<id>_t (título), man_t_<id>_s (subtítulo) y man_t_<id>_1 … _<items> del diccionario
// "manuales". Los bloques de código no se traducen.

const SECTIONS = [
    {
        id: 'arquitectura', icon: 'fa-sitemap', items: 5,
        code: `medienpass_app/
├── server.js              # Rutas Express, sesiones y permisos
├── services/              # Lógica: access, reto_result, indicators, teacher_courses,
│                          # school_years, display_name, user_guide, tech_manual,
│                          # campaign, mailer, i18n_store…
├── data*.js               # Retos, preguntas por materia (data_tecnologia_retos.js,
│                          # data_deportes_retos.js), versión visual, test KMK
├── views/                 # Plantillas EJS (estudiante, teacher/, admin/, visual/, docs/)
│   └── partials/          # brand-head (estilo del colegio), brand-logo, header…
├── public/                # css/colegio.css, img/logo-colegio.png, JS e i18n*.js
├── data/                  # JSON de configuración (roles, años escolares, caché…)
└── test/                  # Pruebas: npm test`
    },
    {
        id: 'datos', icon: 'fa-database', items: 6,
        code: `-- Tablas de Supabase que usa la app
students             (id, username, full_name, class_name, student_code, …)
activity_responses   (student_id, activity_id, data JSONB, school_year, updated_at)
                     -- school_year: año en curso de data/school_years.json ("2627")
teachers             (id, first_name, last_name, email, doc_number, subject,
                      training_completed, training_score, training_date)
teacher_kmk_tests    (teacher_id, score, passed)
multimedia_products  (student_id, activity_id, subject, product_type, link, …)`
    },
    {
        id: 'seguridad', icon: 'fa-user-shield', items: 5,
        code: `// services/access.js
desarrollador (y "admin"): configure, reports, certificates, lists
directivo / coordinador:   reports, certificates, lists

app.get('/api/admin/indicators', allow('reports'), …)   // 403 sin permiso
app.post('/api/admin/i18n', devOnly, …)                  // solo desarrollador`
    },
    { id: 'retos', icon: 'fa-trophy', items: 6 },
    { id: 'contenido', icon: 'fa-book-open', items: 7 },
    {
        id: 'indicadores', icon: 'fa-chart-pie', items: 6,
        code: `GET /api/admin/indicators              # indicadores a, b y c por segmento y clase
GET /api/admin/teacher-courses         # Docentes y cursos
GET /api/admin/retos-progress/:subject # Avance retos
GET /api/admin/certificates/students/:className/:subject
GET /api/admin/students-without-progress  # Inicio: sin empezar, por clase
GET /api/admin/teachers-status         # Inicio: pendientes de certificación
GET /api/admin/teacher-subjects        # Mapeo: asignatura de cada docente
POST /api/admin/teachers/:id/subject   # corregir la asignatura (solo desarrollador)
POST /api/admin/teachers/:id/exemption # exceptuar de la capacitación
POST /api/admin/teacher-subjects/apply # aplicar las materias del mapeo
POST /api/admin/subjects               # nueva materia`
    },
    {
        id: 'capacitacion', icon: 'fa-envelope-open-text', items: 4,
        code: `# .env para el envío de correos (Microsoft Graph)
MS_TENANT_ID=…
MS_CLIENT_ID=…
MS_CLIENT_SECRET=…
MAIL_FROM=medienpass@colegioaleman.edu.co
PUBLIC_APP_URL=https://…`
    },
    { id: 'idiomas', icon: 'fa-language', items: 6 },
    {
        id: 'operacion', icon: 'fa-terminal', items: 4,
        code: `# .env mínimo
SUPABASE_URL=…
SUPABASE_ANON_KEY=…
COOKIE_SECRET=…        # firma de las sesiones (sin él, se cierran al reiniciar)

npm start              # http://localhost:3000
npm test               # 9 suites; usan archivos temporales (TEACHER_ROLES_FILE,
                       # SCHOOL_YEARS_FILE, …)`
    }
];

const keysOf = section => ({
    title: `man_t_${section.id}_t`,
    subtitle: `man_t_${section.id}_s`,
    items: Array.from({ length: section.items }, (_, i) => `man_t_${section.id}_${i + 1}`)
});

const sections = () => SECTIONS.map(section => ({ ...section, ...keysOf(section) }));

function allKeys() {
    return SECTIONS.flatMap(section => {
        const k = keysOf(section);
        return [k.title, k.subtitle, ...k.items];
    });
}

module.exports = { SECTIONS, sections, allKeys };
