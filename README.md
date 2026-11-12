# Medienpass 2627 - Interactive Web App

Aplicación web Node.js para gestionar el proyecto Medienpass del Colegio Alemán Barranquilla, implementando las competencias digitales KMK según el PSP Objetivo 3.1.

## Características

- **Portal Estudiantes**: Dashboard con Retos 1-6 para Klasse K3-K9
- **Portal Docentes**: Capacitación KMK, Test KMK, Configura tus Retos del 0 al 6, Consulta los
  avances, Troubleshooting (el banco de fichas se retiró; las hojas de trabajo de Klett siguen en la
  pestaña «Fichas» de cada competencia en Capacitación)
- **Portal Admin**: Gestión de estudiantes, configuración, reportes e indicadores PSP
- **Dashboard Ejecutivo**: KPIs para Directores de Sección
- **Soporte Multilingüe**: Alemán, Inglés, Español (Alemán e Inglés se abren en su idioma)

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
COOKIE_SECRET=cadena-larga-y-aleatoria
```

`COOKIE_SECRET` firma las cookies de sesión para que nadie pueda falsificarlas. Genera uno con
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Si falta, el servidor
usa uno temporal y todas las sesiones se cierran en cada reinicio. El `.env` no entra en la imagen
Docker, así que en CapRover hay que definirlo también en las variables de entorno de la app.

## Base de Datos

Ejecutar el SQL en Supabase SQL Editor:

```bash
# Copia el contenido de schema.sql y pégalo en:
# Supabase Dashboard > SQL Editor > New Query
```

La bitácora de novedades se retiró: la app ya no usa la tabla `incidents` (si existe en Supabase,
no se lee ni se borra). La dirección vieja `/teacher/bitacora` lleva al portal docente.

## Ejecución

```bash
npm start
```

Abrir: http://localhost:3000

Desde otro equipo de la misma red: `http://<nombre-del-equipo>:3000` (por ejemplo `http://REG-18:3000`)
o con su IP. La app escucha en todas las interfaces; el firewall de Windows debe permitir Node.js.

### Dejar la app funcionando en este equipo (Windows)

- **Instalar:** doble clic en `despliegue\instalar_inicio_automatico.cmd`, con el usuario que va a
  dejar la sesión abierta. Crea la tarea programada «Medienpass» de ese usuario y no pide permisos de
  administrador.
- **Qué hace la tarea:** al iniciar sesión ejecuta `despliegue\servidor_windows.ps1`, que:
  - inicia la app;
  - si la app se cierra o falla, la vuelve a iniciar a los 10 segundos;
  - si ya hay una copia corriendo en el puerto, no abre otra.
- **Registro:** `logs\servidor.log`. Al pasar de 10 MB se guarda como `logs\servidor.anterior.log`.
- **Quitar:** doble clic en `despliegue\quitar_inicio_automatico.cmd`. Borra la tarea y detiene la app.
- **Cuándo no está disponible:**
  - si se cierra la sesión de Windows o el equipo se apaga o se suspende;
  - en un portátil, al cerrar la tapa, si Windows está configurado para suspender.

  Para que funcione aunque nadie haya iniciado sesión, hace falta una tarea «al iniciar el equipo»
  creada por un administrador, o un servidor (ver `despliegue/`, CapRover).

## Roles

- **Estudiantes**: Login con nombre de usuario y clase
- **Docentes**: Login con correo institucional y número de documento
- **Panel administrativo**: no hay clave maestra. En `/login` hay tres botones (¿Soy coordinador?,
  ¿Soy directivo?, ¿Soy desarrollador?) que llevan a `/admin/login?perfil=...`. Se entra con correo
  institucional y número de documento, y solo por el botón del perfil que la cuenta tiene en
  `data/teacher_roles.json` (correo → rol; se asigna en Administración › Docentes).
  Permisos (`services/access.js`):

  | Perfil | Configuración | Informes | Certificados | Listas |
  |---|:-:|:-:|:-:|:-:|
  | desarrollador (y `admin`, nombre anterior) | ✔ | ✔ | ✔ | ✔ |
  | directivo | — | ✔ | ✔ | ✔ (sin códigos ni documentos) |
  | coordinador | — | ✔ | ✔ | ✔ (sin códigos ni documentos) |

  El rol se lee en cada petición: quitarlo o cambiarlo vale desde el siguiente clic. La API responde
  403 cuando el perfil no tiene el permiso. Nadie cambia su propio perfil. Antes de publicar,
  confirma que el servidor tiene al menos una cuenta con perfil desarrollador.

El panel tiene el menú a la izquierda, como el portal docente (`views/partials/admin-sidebar.ejs`,
`public/css/sidebar.css` y `public/css/admin-nav.css`); en el celular se abre con el botón ☰.

## Guía de uso (Manual de usuario, `/docs`)

Una pestaña por perfil, con pasos numerados, dónde está cada cosa y un botón Abrir: Estudiante,
Docente, Coordinación y directivos, y Desarrollador. Cada quien ve sus pestañas (el estudiante solo
la suya; el desarrollador todas y el enlace al manual técnico). Tiene buscador y enlaces directos
(`/docs#docente`, `/docs#sec-doc_modo_estudiante`). La estructura está en `services/user_guide.js` y los
textos en el diccionario de manuales (claves `man_g_*`), editables en Administración › Textos e
idiomas. Se abre desde el botón Guía del panel, el menú del docente y el pie de página del estudiante.

## Estilo del colegio

La app sigue el estilo de [colegioaleman.edu.co](https://colegioaleman.edu.co/): encabezados blancos
con el logo del colegio (`public/img/logo-colegio.png`), texto negro, rojo `#C03928` en las
acciones, dorado `#F0CE2D` y azul `#21529B` de acento, letra Roboto / Roboto Slab y una franja con
los colores de Alemania y Colombia, como la iguana del escudo.

- `views/partials/brand-head.ejs` va al final del `<head>` de todas las páginas: ícono, fuentes y
  `public/css/colegio.css`. En las páginas con Tailwind cambia los tonos índigo, violeta, morado y
  azul por el azul del colegio.
- `views/partials/brand-logo.ejs` es el logo con la marca MEDIENPASS de los encabezados, y
  `brand-page-header.ejs` el encabezado de las páginas del docente sin menú lateral.
- **Nombre del estudiante**: una barra negra fija bajo el encabezado muestra su nombre completo, la
  clase y el año escolar; no se oculta al bajar por la página (en el celular queda fija solo esa
  barra). El saludo usa el primer nombre (`services/display_name.js`).

## Año escolar (Administración › Año escolar)

Solo el perfil desarrollador. `data/school_years.json` guarda la lista de años y el año en curso
(`services/school_years.js`); un año es un código de cuatro dígitos (`2627` = 2026 - 2027).

- El año en curso es el que ve el estudiante (ya no lo elige) y con el que se guardan sus
  respuestas (`activity_responses.school_year`). La barra del panel también lo muestra.
- Se agregan años escribiendo el año en que empiezan (2028 → 2028 - 2029).
- El filtro de año de Inicio lista todos los años, con el año en curso elegido.
- Solo se puede quitar de la lista un año que no está en curso y no tiene respuestas guardadas;
  quitarlo no borra datos.

## Idiomas (DE / EN / ES)

Los botones DE | EN | ES cambian el idioma de toda la app (estudiantes, docentes, admin y
manuales). La elección se guarda en la cookie `lang` y en el navegador.

- Los textos están en diccionarios por portal: `public/js/i18n.js` (común y estudiantes),
  `i18n-docentes.js`, `i18n-admin.js` e `i18n-manuales.js`. Se editan desde el panel:
  Administración › Textos e idiomas (y hay que pulsar Guardar).
- En las vistas: `<span data-i18n="clave"><%= locals.t('clave') %></span>` (usa `locals.t`,
  no `t`, porque algunos bucles EJS llaman `t` a una variable). En JavaScript del navegador:
  `window.t('clave')`.
- Las claves nuevas llevan prefijo por portal (`adm_`, `doc_`, `man_`, `est_`).
- `npm test` falla si una clave usada en las vistas no existe en los tres idiomas.
- El banco de preguntas KMK tiene sus traducciones en `kmk_training_questions_i18n.js`.
- **Alemán e Inglés en su idioma**: el inicio con esa materia, su Reto 0 y sus retos se abren en
  alemán o en inglés aunque la app esté en otro idioma (`useSubjectLang` en `server.js`, `<body
  data-native-subject data-page-lang>`). Abrir la materia no cambia la preferencia de idioma. Los
  botones DE | EN | ES siguen funcionando: lo que el estudiante elija en esa materia vale para ella
  durante la sesión (cookie `lang_<materia>`, `public/js/lang.js`) y también queda como su
  preferencia general.

## Lector inmersivo (diferenciación)

En las páginas de los retos 0 a 6 hay un botón **Lector** abajo a la izquierda y un 🔊 en cada pregunta
(`public/js/reader.js`, `public/css/reader.css`, `views/partials/reader.ejs`; lo incluye `footer.ejs` cuando
la página pasa `{ reader: true }`).

- Lee en voz alta la pregunta y sus opciones, la página entera o el texto seleccionado, con la voz del
  dispositivo (Web Speech API) en el idioma de la página, y resalta la palabra que va leyendo.
- Ajustes: velocidad, tamaño de letra, espaciado amplio, letra fácil de leer (Atkinson Hyperlegible),
  regla de lectura y color de fondo. Se recuerdan en el navegador (`localStorage`, `medienpass_lector`).
- «Ver también en» muestra cada pregunta y sus opciones en otro idioma con los textos que ya tienen
  (`data-lang-content`).
- No usa servicios externos ni tiene costo. El Lector inmersivo de Microsoft (Azure) se puede conectar más
  adelante si el colegio crea el recurso.

## Contenido por materia

- **Reto 0**: cada materia tiene su evaluación de 10 preguntas (`data_reto0_quiz.js`): 2 sobre el
  Medienpass, 6 sobre las competencias KMK aplicadas a la materia y 2 de seguridad o derechos de
  autor. El material de estudio (panel 4, 6 diapositivas) sale de los mismos datos. Se guarda en
  el registro `profile`, que combina las materias al guardar; el estudiante entra con
  `/profile?subject=<materia>`. Quien aprobó la evaluación anterior de 28 preguntas conserva el
  Reto 0 ganado en todas sus materias.
- **Retos 1 a 6**: `data_questions.js` arma las 6 preguntas de cada reto con el paquete temático de
  la materia (`data_subject_packs.js`: temas, fuentes, herramientas y casos en DE/EN/ES). Enunciados y
  opciones son propios de cada materia, y `npm test` falla si dos materias los repiten. La posición de
  la respuesta correcta en K3–K12 no cambia (`test/fixtures/legacy_correct_positions.json`), para que las
  respuestas guardadas se califiquen igual. Para cambiar un ejemplo de una materia basta con editar su
  paquete. La tarjeta "Agente del Profesor" también sale de ese paquete (`default_agent_tools.js`).
- **Tecnología** tiene preguntas propias en los retos 1 a 6 (`data_tecnologia_retos.js`), ambientadas
  en las plataformas del colegio y mezcladas en cada reto: Ozaria, CodeCombat, codeSpark, OneNote,
  Teams, Minecraft Education y BookStudio (lienzo libre para libros interactivos). Conservan la
  subcompetencia KMK y la posición de la respuesta correcta de la plantilla común. Su paquete temático
  (versión visual con codeSpark, agente del profesor y ejemplo de evidencias) usa las mismas plataformas.
- **Deportes** (`deportes`, habilitada en todas las clases) tiene preguntas propias en los retos 1 a 6
  (`data_deportes_retos.js`) sobre natación, polimotor, voleibol, baloncesto y atletismo, mezclados en
  cada reto; cada pregunta indica su deporte (`area`) y conserva la subcompetencia KMK y la posición de
  la respuesta correcta. Su Reto 0 tiene preguntas abiertas y evaluación propias (`data_reto0.js`,
  `data_reto0_quiz.js`) y su paquete temático (`data_subject_packs.js`) da la versión visual y el agente
  del profesor. `data_questions.js` toma las preguntas propias de cada materia de `OWN_QUESTIONS`.
- **Competencia de cada pregunta**: en los retos 1 a 6 (K3–K12), cada pregunta muestra arriba la
  subcompetencia KMK que trabaja, por ejemplo «KMK 1.1 · Buscar y filtrar» (`data_kmk_competences.js`).
- **Inteligencia artificial en todos los retos**: las 6 competencias KMK siguen siendo las de «Bildung in
  der digitalen Welt»; cada una tiene su dimensión de IA (campo `ai` en `KMK_COMPETENCES`,
  `data_reto0_quiz.js`), en la línea de la recomendación de la KMK sobre IA en la escuela (octubre de 2024).
  En cada reto 1 a 6 una pregunta por materia es sobre IA (`ai: true`, etiqueta «🤖 IA»): R1Q5 chatbot como
  fuente, R2Q5 deepfakes, R3Q3 imágenes generadas, R4Q3 datos personales, R5Q4 IA como tutor y R6Q3 uso
  ético, con la misma subcompetencia y la misma posición de la respuesta correcta (las respuestas guardadas
  se califican igual). La versión visual tiene una por reto y el Reto 0, la pregunta 10. La página del
  reto, el editor docente y Capacitación muestran la dimensión de IA de la competencia.
- **Capacitación**: las competencias 1 a 3 llevan los colores de la bandera de Alemania y las 4 a 6, los
  de Colombia.

## Retos ganados y Certificados Medienpass

- Un reto se gana con el 80 % o más. En el Reto 0 cuentan los aciertos de la evaluación. En los retos
  1 a 6 cada pregunta da 3 estrellas si la respuesta es correcta y 2 más si el argumento es coherente.
  Lo calcula el servidor con lo guardado (`services/reto_result.js`), con las mismas reglas que
  muestra la página.
- El cuadro "Certificado Medienpass" de cada reto está oculto y solo aparece cuando el estudiante ganó
  los 7 retos (0 a 6) de la materia (`medienpassFrom` en `server.js`). Entonces escribe su correo
  `@colegioaleman.edu.co` (se guarda con las respuestas del reto, en `institutional_email`) y ve el
  certificado de la materia completa, con los 7 retos, para recortarlo y pegarlo en OneNote. El
  servidor solo acepta el correo con la materia completa y nunca borra uno ya guardado.
- Administración › Certificados: modo Estudiante (clase + materia habilitada) y modo Profesor
  (docentes que aprobaron el test KMK, `training_completed`). Son apaisados, tipo diapositiva, con los
  colores del colegio, textos tipo frase y dos firmas: «Mg. Luis Carlos Acero · Coordinación» y
  «Dir. Hellman Vallejo · Dirección PSP» (claves `est_cert_firma1_*` y `est_cert_firma2_*`, editables en
  Textos e idiomas; las usa también el certificado que ve el estudiante). Se imprimen en A4 horizontal o
  se guardan en PDF y llevan el escudo del colegio (`public/img/escudo-colegio.png`).
- Inicio › Estudiantes sin empezar el Medienpass: por clase y segmento, cuántos estudiantes no han
  guardado ningún reto en el año elegido, con sus nombres (`services/no_progress.js`).
- Indicadores › Avance retos: por materia, el % de estudiantes de cada clase que ganó cada reto
  (0 a 6) y cuántos lo tienen en curso, con detalle por estudiante. Usa el mismo cálculo que los
  certificados.

## Indicadores institucionales

Indicadores › KPIs muestra tres indicadores con su meta y avance, en total, por segmento y por clase
(`services/indicators.js`, ruta `GET /api/admin/indicators`):

- **Profesores capacitados** (meta 70 %): `training_completed`. El segmento del docente se asigna en
  Administración › Docentes (`data/teacher_segments.json`); si no está asignado se deduce del mapeo.
- **Estudiantes con mínimo 3 de 6 retos** (meta 85 %): 3 retos distintos del 1 al 6, ganados con el
  80 % o más, en cualquier materia.
- **Estudiantes con evidencias** (meta 85 %): al menos un vínculo `http(s)` en un reto. Se adjuntan
  con el botón de cada reto 1 a 6 (hasta 3, en la columna `link` de `multimedia_products`, uno por línea).

Segmentos (`services/class_levels.js`): Preescolar (PK, KIN, KKP, K1), Primaria (K2 a K6) y Secundaria
(K7 a K12). `sinact` queda por fuera, y dos registros con el mismo código cuentan como una persona.

## Medienpass visual (Prekínder, Kinder, K1 y K2)

No saben escribir: 3 preguntas por reto con imagen y voz del dispositivo, sin campos de texto
(`data_visual.js`, `views/visual/`, `public/js/visual.js`). Se gana con las 3 correctas y un error permite
intentar de nuevo. Usan las preguntas del grado 2 (`evidence_k2`), que también edita el portal docente.
El certificado no pide correo. Los docentes lo ven en `/teacher/visual-preview?subject=<materia>&reto=<n>`.

## Capacitación docente y test KMK

`/teacher/training` organiza por competencia el contenido de siempre, con las pestañas Qué es, En tu
materia, Ejemplos, En acción y Fichas. `/teacher/evaluation` es el test de 12 preguntas
(`data_teacher_test.js`): se califica en el servidor y se aprueba con 9. Quien ya aprobó no pierde la
aprobación al repetirlo.

## Botón AYUDA y capacitación por correo

El botón AYUDA (`views/partials/help-button.ejs`) está en las páginas de estudiantes y docentes.
Administración › Capacitación y ayuda guarda los enlaces de los videos y la serie de 5 correos
(`data_campaign_defaults.js`, `services/campaign.js`). El envío usa Microsoft Graph (`services/mailer.js`)
y necesita una aplicación de Microsoft Entra con permiso `Mail.Send`, limitada al buzón remitente:

```env
MS_TENANT_ID=...
MS_CLIENT_ID=...
MS_CLIENT_SECRET=...
MAIL_FROM=medienpass@colegioaleman.edu.co
PUBLIC_APP_URL=https://...
```

Sin esas variables el módulo funciona, pero avisa y no envía. Los enlaces, los textos editados y el registro
de envíos quedan en `data/`: en CapRover esa carpeta debe ser un directorio persistente, porque el registro
evita repetir correos.

## Materias, docentes y mapeo

- **Materias** (Administración › Materias): la lista base está en `data_levels.js`; los cambios
  (nombre DE/EN/ES, ícono, color, activa) se guardan en `data/subjects_config.json` y
  `services/subject_store.js` los aplica sobre esa misma lista al arrancar y al guardar. Las
  materias inactivas (`active: false`) no aparecen en los combos, en Configuración ni a los
  estudiantes; sus datos se conservan.
- **Nueva materia** (mismo apartado): nombre DE/EN/ES, ícono y color. Se guarda con `custom: true`
  (`data_levels.js` la agrega al arrancar), queda activa y, si se marca, habilitada en todas las clases.
  Sus retos 0 a 6 usan contenido general con su nombre (`data_generic_subject.js`) y se crean sin
  reiniciar (`registerSubjectActivities` en `data.js`). Para darle preguntas propias se agrega su paquete
  en `data_subject_packs.js`, `data_reto0_quiz.js` y `data_reto0.js`.
- **Asignatura de cada docente** (Mapeo, arriba): la lista de docentes con `teachers.subject`, la que
  usan todos los informes por materia. Se corrige o se asigna a quien no tiene; la columna «Según el
  mapeo» sale de `services/teacher_subjects.js`, y «Aplicar las materias del mapeo» corrige a todos
  (sin empates). Los cambios quedan en `data/teacher_subject_changes.json`.
- **Excepciones de la capacitación** (Inicio › Docentes pendientes de certificación, solo el
  desarrollador): `data/teacher_exemptions.json`, por correo. Los exentos no cuentan en el indicador de
  docentes capacitados ni en Capacitación KMK por materia, y no reciben los correos para docentes sin
  capacitar.
- **Docentes**: cada fila se edita en pantalla (nombres, apellidos, correo, materia y rol). Al
  registrarse, el docente elige su materia; el admin la confirma o cambia al aprobar la solicitud.
- **Editar y eliminar docentes** (solo el desarrollador). Los botones «Editar» y «Eliminar» están en:
  - Docentes registrados;
  - Docentes pendientes de certificación;
  - Mapeo › Asignatura de cada docente;
  - Capacitación KMK;
  - Docentes y cursos.

  Todos abren el mismo cuadro. Al eliminar (`DELETE /api/admin/teachers/:id`):
  - Primero se guarda una copia en `data/teacher_deletions.json` con el registro completo del
    docente, sus pruebas KMK, su rol, sus segmentos y su excepción.
  - Luego se borran el docente y sus pruebas KMK, y su correo sale de los roles, los segmentos y las
    excepciones.
  - El mapeo por clase no se toca: el aviso dice en cuántas clases sigue nombrado.
  - Nadie puede eliminar su propia cuenta.
- **Mapeo de profesores** (`class_teacher_config.json`): tabla clase × materia editable por fila.
  Prellena el panel 3 del Reto 0; las clases se reconocen como `K6A`, `6A` o `KLASSE 6 (K6A)`.

## Configura tus Retos del 0 al 6 (editor docente)

- El menú del docente tiene Capacitación KMK, Test KMK, **Configura tus Retos del 0 al 6**
  (`/teacher/student-preview`: el reto como lo ve el estudiante y su editor) y **Consulta los avances**
  (`/teacher/progress`: seguimiento por clase, con un combo de Klassen).
- El docente edita las preguntas de un reto por grado y materia. Cada reto trabaja una competencia
  KMK y cada pregunta lleva su subcompetencia (`kmk`, definidas en `data_kmk_competences.js`).
- **Reto 0** (K3 a K12): se edita la evaluación, desde la pregunta 10; las preguntas 1 a 9 (avatar,
  datos, profesores y preguntas abiertas) no cambian. La subcompetencia KMK es opcional y la pista
  se guarda como explicación. Se guarda con la clave `<grado>_<materia>_0` y `reto0ForGrade`
  (`server.js`) la usa en la página, la calificación, el cuadernillo y el progreso.
- Lo guardado (`data/custom_instruments.json`, vía `services/instrument_store.js`) reemplaza las
  preguntas del sistema para todos los estudiantes de ese grado y materia: página del reto,
  calificación, certificados, Avance retos, cuadernillo y progreso (`retoEvidenceFor` en
  `server.js`). "Restablecer al sistema" lo borra.
- Un docente solo guarda en su materia (`teachers.subject`); los roles coordinador, directivo y
  desarrollador pueden guardar en cualquiera.
- Ya no hay carga de PDF, plantilla CSV ni generación con IA (`services/ai_service.js` quedó sin
  uso y se puede borrar).

## Pruebas

`npm test` corre `test/verify_features.test.js`, `test/admin_features.test.js`,
`test/teacher_editor.test.js`, `test/indicators.test.js`, `test/content_subjects.test.js`,
`test/training_help.test.js`, `test/access_roles.test.js` (permisos por perfil, ingreso, Docentes y
cursos, y que la bitácora ya no existe), `test/user_guide.test.js` (guía de uso por perfil) y
`test/school_years.test.js` (año escolar, barra con el nombre del estudiante y estilo del colegio en
todos los portales). Para usar archivos de datos temporales hay variables de entorno:
`LOCAL_ACTIVITY_CACHE_FILE`, `CUSTOM_INSTRUMENTS_PATH`, `SUBJECTS_CONFIG_FILE`,
`CLASS_TEACHER_CONFIG_FILE`, `PENDING_TEACHERS_FILE`, `TEACHER_SEGMENTS_FILE`, `HELP_CAMPAIGN_FILE`,
`CAMPAIGN_LOG_FILE`, `TEACHER_ROLES_FILE`, `SCHOOL_YEARS_FILE`, `CLASS_SUBJECTS_FILE` (materias por
clase), `TEACHER_EXEMPTIONS_FILE` y `TEACHER_SUBJECT_LOG_FILE`. `npm test` carga antes `test/isolate.js`,
para que las materias nuevas creadas en la app real no cambien lo que esperan las pruebas.

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
- `GET /api/admin/certificates/students/:className/:subject` - Certificados de estudiantes (retos 0-6 ganados en una materia)
- `GET /api/admin/teachers` - Docentes con rol y resultado del test KMK (lista de Docentes y certificados de profesor)
- `POST /api/admin/teachers/:id` - Editar nombres, apellidos, correo, materia y rol de un docente
- `GET /api/admin/subjects`, `POST /api/admin/subjects/:id` - Materias (nombre, ícono, color, activa)
- `GET|POST /api/admin/school-years`, `PUT /api/admin/school-years/active`, `DELETE /api/admin/school-years/:id` - Año escolar: lista con respuestas por año, agregar, año en curso y quitar (solo desarrollador)
- `GET /api/admin/retos-progress/:subject` - Avance retos 0-6 por clase y estudiante en una materia
- `GET /api/admin/indicators` - Indicadores institucionales, en total, por segmento y por clase
- `GET|POST /api/admin/help-videos` - Enlaces de los videos del botón AYUDA
- `GET /api/admin/campaign`, `POST /api/admin/campaign/{settings,emails/:id,recipients,preview,test,send}` - Capacitación por correo
- `GET|POST /api/admin/teacher-mapping` - Mapeo de profesores por clase (el editor muestra todas las clases)
- `GET /api/admin/teacher-courses` - Docentes y cursos: avance de retos 0-6 por curso, pendientes por aplicar y capacitación KMK

### Docentes
- `GET /api/instruments/:grade/:subject/:reto` - Preguntas editadas de un reto 0-6 (Reto 0: solo K3-K12)
- `POST /api/instruments/save`, `POST /api/instruments/reset` - Guardar o restablecer las preguntas editadas
- `GET /api/admin/psp-indicators/:className` - Indicadores PSP
- `GET /api/admin/kpis` - KPIs ejecutivos
- `GET /api/admin/executive-dashboard` - Dashboard de directores

## Autores

- Diseño y Desarrollo: Lacero ETIC
- Basado en: Medienpass KMK - Deutsche Schule Barranquilla

## Versión

2627 - Abril 2026
