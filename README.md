# Medienpass 2627 - Interactive Web App

Aplicación web Node.js para gestionar el proyecto Medienpass del Colegio Alemán Barranquilla, implementando las competencias digitales KMK según el PSP Objetivo 3.1.

## Características

- **Portal Estudiantes**: Dashboard con Retos 1-6 para Klasse K3-K9
- **Portal Docentes**: Capacitación KMK, Evaluación, Banco de Fichas, Troubleshooting
- **Portal Admin**: Gestión de estudiantes, configuración, reportes e indicadores PSP
- **Dashboard Ejecutivo**: KPIs para Directores de Sección
- **Bitácora de Novedades**: Reporte de incidencias técnicas
- **Soporte Multilingüe**: Alemán, Inglés, Español

## Requisitos

- Node.js 18+
- Supabase (opcional, funciona en modo local)

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env` con las variables de entorno:

```env
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima
ADMIN_PASSWORD=tu-contraseña-admin
```

## Base de Datos

Ejecutar el SQL en Supabase SQL Editor:

```bash
# Copia el contenido de schema.sql y pégalo en:
# Supabase Dashboard > SQL Editor > New Query
```

## Ejecución

```bash
npm start
```

Abrir: http://localhost:3000

## Roles

- **Estudiantes**: Login con nombre de usuario y clase
- **Docentes**: Login con correo institucional y número de documento
- **Admin**: Password configurable en `.env`

## Estructura

```
├── server.js              # Servidor Express
├── data.js                # Actividades y configuraciones
├── data_levels.js         # Niveles y materias
├── schema.sql             # Schema de base de datos
├── views/
│   ├── admin/             # Vistas de administración
│   ├── teacher/           # Portal docente
│   └── *.ejs              # Vistas públicas
├── public/
│   ├── css/               # Estilos
│   └── js/                # Scripts
└── node_modules/          # Dependencias
```

## Endpoints API

### Estudiantes
- `POST /api/save/:activityId` - Guardar progreso
- `GET /api/load/:activityId` - Cargar progreso
- `GET /api/progress` - Ver progreso general

### Admin
- `GET /api/admin/reports/:className` - Reportes por clase
- `GET /api/admin/psp-indicators/:className` - Indicadores PSP
- `GET /api/admin/kpis` - KPIs ejecutivos
- `GET /api/admin/executive-dashboard` - Dashboard de directores

### Incidentes (Bitácora)
- `GET /api/incidents` - Listar novedades
- `POST /api/incidents` - Crear novedad
- `PUT /api/incidents/:id` - Actualizar estado

## Autores

- Diseño y Desarrollo: Lacero ETIC
- Basado en: Medienpass KMK - Deutsche Schule Barranquilla

## Versión

2627 - Abril 2026
