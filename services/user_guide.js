// Guía de uso de la app (Manual de usuario, /docs): una pestaña por perfil, con sus pasos.
// Los textos están en el diccionario "manuales" con claves man_g_* y se editan en
// Administración › Textos e idiomas › Manuales. Cada sección usa:
//   man_g_<id>_t (título), man_g_<id>_d (dónde está en la app) y man_g_<id>_1 … _<steps> (pasos).
// Cada perfil ve sus pestañas (tabsFor): el estudiante la suya; el docente, la suya y la del
// estudiante; directivo y coordinador, además la de coordinación; el desarrollador, todas.

const COMMON = { id: 'comun', icon: 'fa-flag-checkered', steps: 4 };

const TABS = [
    {
        id: 'desarrollador', icon: 'fa-code', color: 'purple',
        sections: [
            { id: 'dev_perfiles', icon: 'fa-user-shield', steps: 3, link: '/admin#administracion/docentes' },
            { id: 'dev_estudiantes', icon: 'fa-user-graduate', steps: 2, link: '/admin#administracion/estudiantes' },
            { id: 'dev_phidias', icon: 'fa-arrows-rotate', steps: 3, link: '/admin/phidias' },
            { id: 'dev_docentes', icon: 'fa-user-tie', steps: 3, link: '/admin#administracion/docentes' },
            { id: 'dev_materias', icon: 'fa-book-open', steps: 2, link: '/admin#administracion/materias' },
            { id: 'dev_anio', icon: 'fa-calendar-days', steps: 3, link: '/admin#administracion/anio' },
            { id: 'dev_configuracion', icon: 'fa-sliders', steps: 3, link: '/admin#administracion/configuracion' },
            { id: 'dev_mapeo', icon: 'fa-chalkboard-user', steps: 4, link: '/admin#administracion/mapeo' },
            { id: 'dev_capacitacion', icon: 'fa-envelope-open-text', steps: 3, link: '/admin#administracion/ayuda' },
            { id: 'dev_textos', icon: 'fa-language', steps: 2, link: '/admin#administracion/idiomas' },
            { id: 'dev_quiz', icon: 'fa-clipboard-check', steps: 1, link: '/admin#indicadores/kmk' },
            { id: 'dev_tecnico', icon: 'fa-screwdriver-wrench', steps: 1, link: '/docs/technical' }
        ]
    },
    {
        id: 'coordinacion', icon: 'fa-landmark', color: 'blue',
        sections: [
            { id: 'coo_ingreso', icon: 'fa-right-to-bracket', steps: 3 },
            { id: 'coo_inicio', icon: 'fa-gauge-high', steps: 3, link: '/admin#inicio' },
            { id: 'coo_docentes_cursos', icon: 'fa-chalkboard-user', steps: 4, link: '/admin#indicadores/docentes_cursos' },
            { id: 'coo_indicadores', icon: 'fa-bullseye', steps: 4, link: '/admin#indicadores/kpis' },
            { id: 'coo_informes', icon: 'fa-chart-pie', steps: 5, link: '/admin#indicadores/avance' },
            { id: 'coo_consultas', icon: 'fa-magnifying-glass', steps: 2, link: '/admin#consultas/estudiantes' },
            { id: 'coo_certificados', icon: 'fa-award', steps: 2, link: '/admin#consultas/certificados' }
        ]
    },
    {
        id: 'docente', icon: 'fa-chalkboard-teacher', color: 'emerald',
        sections: [
            { id: 'doc_ingreso', icon: 'fa-right-to-bracket', steps: 3 },
            { id: 'doc_capacitacion', icon: 'fa-graduation-cap', steps: 4, link: '/teacher/training' },
            { id: 'doc_test', icon: 'fa-clipboard-check', steps: 2, link: '/teacher/evaluation' },
            { id: 'doc_modo_estudiante', icon: 'fa-pen-to-square', steps: 6, link: '/teacher/student-preview' },
            { id: 'doc_seguimiento', icon: 'fa-chart-line', steps: 4, link: '/teacher/progress' },
            { id: 'doc_asignaciones', icon: 'fa-list-check', steps: 3, link: '/teacher/assignments' },
            { id: 'doc_ayuda', icon: 'fa-circle-question', steps: 2, link: '/teacher/troubleshooting' }
        ]
    },
    {
        id: 'estudiante', icon: 'fa-user-graduate', color: 'violet',
        sections: [
            { id: 'est_ingreso', icon: 'fa-right-to-bracket', steps: 2 },
            { id: 'est_inicio', icon: 'fa-list-check', steps: 4, link: '/' },
            { id: 'est_reto0', icon: 'fa-id-badge', steps: 3, link: '/profile' },
            { id: 'est_retos', icon: 'fa-trophy', steps: 5, link: '/' },
            { id: 'est_lector', icon: 'fa-book-open-reader', steps: 3 },
            { id: 'est_certificado', icon: 'fa-award', steps: 2 },
            { id: 'est_evidencias', icon: 'fa-link', steps: 2 },
            { id: 'est_visual', icon: 'fa-shapes', steps: 2 },
            { id: 'est_ayuda', icon: 'fa-circle-question', steps: 1 }
        ]
    }
];

// Pestañas que ve cada perfil, en orden (la primera abre por defecto)
const TABS_BY_VIEWER = {
    estudiante: ['estudiante'],
    profesor: ['docente', 'estudiante'],
    coordinador: ['coordinacion', 'docente', 'estudiante'],
    directivo: ['coordinacion', 'docente', 'estudiante'],
    desarrollador: ['desarrollador', 'coordinacion', 'docente', 'estudiante']
};

const keysOf = section => ({
    title: `man_g_${section.id}_t`,
    where: `man_g_${section.id}_d`,
    steps: Array.from({ length: section.steps }, (_, i) => `man_g_${section.id}_${i + 1}`)
});

// viewer: 'estudiante' o el perfil normalizado ('profesor', 'coordinador', 'directivo', 'desarrollador')
function tabsFor(viewer) {
    const ids = TABS_BY_VIEWER[viewer] || TABS_BY_VIEWER.estudiante;
    return ids.map(id => TABS.find(tab => tab.id === id)).map(tab => ({
        ...tab,
        title: `man_g_tab_${tab.id}`,
        intro: `man_g_${tab.id}_intro`,
        sections: tab.sections.map(section => ({ ...section, ...keysOf(section) }))
    }));
}

function common() {
    return { ...COMMON, title: 'man_g_comun_t', steps: keysOf(COMMON).steps };
}

// Todas las claves que usa la guía (para comprobar que existen en DE, EN y ES)
function allKeys() {
    const keys = ['man_g_comun_t', ...keysOf(COMMON).steps];
    TABS.forEach(tab => {
        keys.push(`man_g_tab_${tab.id}`, `man_g_${tab.id}_intro`);
        tab.sections.forEach(section => {
            const k = keysOf(section);
            keys.push(k.title, k.where, ...k.steps);
        });
    });
    return keys;
}

module.exports = { TABS, TABS_BY_VIEWER, tabsFor, common, allKeys };
