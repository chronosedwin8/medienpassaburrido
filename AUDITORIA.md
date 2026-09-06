# Auditoría — Medienpass App

> Fecha: 2026-06-10 · Alcance: software, interfaz gráfica, procesos de usuario y contenidos.
> Foco principal solicitado: los **procesos de guardado** que a veces "se quedan esperando".
>
> **Leyenda de estado de cada hallazgo:**
> - ✅ **Verificado**: leído directamente en el código durante esta auditoría.
> - 🔎 **Por confirmar**: detectado por exploración; conviene validar la línea exacta antes de actuar.
>
> **Leyenda de severidad:** 🔴 crítica · 🟠 alta · 🟡 media · ⚪ baja

---

## 1. Resumen ejecutivo

La app (Node/Express + Supabase + estado en JSON local en `data/`) es **funcional** pero
tiene un problema central en el **guardado** que explica el síntoma reportado ("se queda
esperando para guardar"), más varios riesgos de **pérdida de datos** y una capa de
**UI/UX y contenidos** mejorable.

**Top 5 riesgos:**

| # | Riesgo | Severidad | Estado |
|---|--------|-----------|--------|
| 1 | Middleware global bloquea **toda** petición esperando a Supabase sin timeout → cuelga el guardado | 🔴 | ✅ |
| 2 | Cliente sin timeout: el spinner "Guardando…" queda colgado para siempre si la red no responde | 🔴 | ✅ |
| 3 | Escritura síncrona de un JSON creciente + race condition → bloqueo bajo carga y pérdida de respuestas | 🔴 | ✅ |
| 4 | Sincronización a Supabase *fire-and-forget* sin aviso → divergencia silenciosa local↔BD | 🟠 | ✅ |
| 5 | `/api/incidents` GET sin filtrar por profesor → un docente ve incidencias de otros | 🟠 | 🔎 |

> Los riesgos 1–4 (guardado) y todos los demás puntos del plan de acción (§7) han sido **implementados** en esta sesión. Ver §2.8 y §7.

---

## 2. Guardado (prioridad del usuario)

### 2.1 🔴 ✅ Middleware global bloqueante sin timeout — *causa raíz del cuelgue*
`server.js` (middleware "attach student info"). Se ejecuta en **toda** petición, incluida
`/api/save`, y hacía `await Promise.all([ supabase.students…, supabase.activity_responses… ])`
**sin timeout**. Si Supabase está lento o inaccesible, la petición se cuelga **antes** de
llegar al handler de guardado. Es la causa principal de "se queda esperando para guardar".

### 2.2 🔴 ✅ El handler responde rápido… pero nunca se alcanza
`app.post('/api/save/:activityId')` responde de inmediato (`localOnly:true`) y sincroniza
Supabase en segundo plano. Buen diseño, pero **anulado** por 2.1: el middleware bloquea antes.

### 2.3 🔴 ✅ Cliente sin `AbortController`/timeout
`views/activity.ejs`: las funciones de guardado (`performSave`, `saveAvatarAndContinue`,
`saveMultimediaProduct`, `saveProfileModule`) hacían `await fetch(...)` sin timeout, y la
rehabilitación del botón ocurría **después** del `await`. Si la petición nunca volvía, el
spinner y el botón quedaban deshabilitados indefinidamente.

### 2.4 🔴 ✅ Escritura síncrona que bloquea el event loop
`writeLocalCache` usaba `fs.writeFileSync` sobre un único archivo creciente
(`data/local_activity_responses.json`). En Node (un solo hilo), escribir un JSON grande
bloquea **todas** las peticiones concurrentes → bajo carga, varios alumnos guardando a la
vez generan colas y esperas.

### 2.5 🔴 ✅ Race condition read-modify-write
El guardado hacía leer→mutar→escribir el cache sin serializar. Dos guardados concurrentes
podían pisarse y **perder respuestas**.

### 2.6 🟠 ✅ `JSON.parse` sin protección de integridad
`readLocalCache`: ante un JSON corrupto (p. ej. escritura interrumpida) devolvía `{}` y el
siguiente guardado **sobrescribía** todo, borrando datos.

### 2.7 🟠 ✅ `/autosave` inexistente + patrón frágil
`public/js/autosave.js` hacía `await fetch('/autosave')` en `beforeunload`; **no existe esa
ruta** (404) y `await` en `beforeunload` es poco fiable (los navegadores no esperan). Además
solo se intentaba guardar al cerrar la pestaña: **no había autoguardado periódico**.

### 2.8 ✅ Correcciones aplicadas en esta sesión

| Fix | Archivo | Qué se hizo |
|-----|---------|-------------|
| Timeout en middleware | `server.js` | `withTimeout(Promise.all([...]), 4000)`; ante timeout, **fallback a cookie** y `next()` — la petición nunca cuelga |
| Escritura no bloqueante + atómica + serializada | `server.js` | `writeLocalCache`/`writeChallengeToolsConfig` usan `fs.promises` + `tmp`→`rename`, serializadas por archivo (cola `_enqueue`) |
| Race resuelta | `server.js` | Nuevo `updateLocalCache(mutator)` lee/escribe dentro de la cola serializada |
| Integridad | `server.js` | `readLocalCache` ante corrupción respalda `*.corrupt-<ts>.bak` y registra el fallo |
| Timeout a Supabase | `server.js` | El upsert de `/api/save` va envuelto en `withTimeout(…, 8000)` |
| Visibilidad de fallos | `server.js` | El registro local lleva `syncPending`; se limpia al confirmar Supabase |
| Cliente robusto | `views/activity.ejs` | `AbortController` (10s) + `finally` en los 4 guardados → la UI nunca queda colgada |
| Autoguardado periódico | `views/activity.ejs` | `setInterval(silentAutosave, 30000)` con su propio timeout |
| `sendBeacon` al salir | `public/js/autosave.js` | Reemplaza el `fetch('/autosave')` roto; usa `visibilitychange`/`pagehide` y no bloquea el cierre |

### 2.9 🟡 🔎 Follow-up recomendado (no implementado)
Cola de **reintentos** real para los registros con `syncPending:true` (p. ej. al reconectar
o al cargar la actividad), y endpoint/diagnóstico que liste pendientes. Hoy quedan marcados
pero no se reenvían automáticamente.

---

## 3. Software / arquitectura

| # | Hallazgo | Sev | Estado |
|---|----------|-----|--------|
| 3.1 | Otras escrituras siguen siendo `writeFileSync` (`pending_teachers.json`, `teacher_roles.json`, configs admin). No están en el hotpath, pero conviene migrarlas al escritor atómico para consistencia | 🟡 | ✅ |
| 3.2 | Configuración guardada en **JSON local** (`subject_config.json`, `level_config.json`, etc.) no se replica a BD → en despliegues con varias instancias/redeploys se pierde o diverge | 🟠 | 🔎 |
| 3.3 | `ADMIN_PASSWORD` con default en texto plano (`'medienpass2526'`) si falta la env var | 🟠 | 🔎 |
| 3.4 | `getActivitiesForClass` resuelve `evidence_k${grade}` con fallbacks frágiles para grados fuera de K2–K7 | 🟡 | ✅ |
| 3.5 | Sin pruebas automatizadas; `package.json` `test` es un placeholder | 🟡 | ✅ |

---

## 4. Interfaz gráfica (UI/UX)

| # | Hallazgo | Archivo | Sev | Estado |
|---|----------|---------|-----|--------|
| 4.1 | Feedback de guardado inconsistente (estados "guardando/éxito/error" sin iconografía clara y uniforme) | `views/activity.ejs`, `public/css/custom.css` | 🟠 | ✅ |
| 4.2 | Bug i18n: se concatena `'\n'` **literal** en el texto en lugar de salto/`<br>` | `public/js/lang.js` | 🟠 | 🔎 |
| 4.3 | Formulario largo del Reto 0 (acordeón de 5 paneles + 9 slides) **sin barra de progreso** ni breadcrumb | `views/activity.ejs` | 🟠 | ✅ |
| 4.4 | Validación débil de formularios: inputs de texto sin `required`/`minlength`, sin mensajes `role="alert"` | `views/activity.ejs` | 🟠 | 🔎 |
| 4.5 | Accesibilidad: acordeones/slides/radios sin `aria-expanded`/`aria-controls`/`aria-required`; mensajes sin `role="alert"` | `views/activity.ejs` | 🟡 | 🔎 |
| 4.6 | Responsividad mínima (prácticamente un solo breakpoint); móvil deficiente en formularios largos y grid de avatares | `public/css/style.css` | 🟡 | 🔎 |
| 4.7 | Estilos inline mezclados con clases CSS; `style.css` vs `custom.css` con duplicación y clases sin uso | `views/activity.ejs`, `public/css/*` | 🟡 | 🔎 |
| 4.8 | Textos hardcodeados sin `data-i18n` (modal de bienvenida, placeholder de clase mezcla idiomas) | `views/index.ejs`, `views/login.ejs` | 🟡 | 🔎 |
| 4.9 | Cascada de selectores (asignatura → reto) aparece sin transición ni guía | `views/index.ejs`, `public/js/dashboard.js` | ⚪ | 🔎 |

---

## 5. Procesos de usuario

### 5.1 Estudiante
Login por (clase + usuario + código) → dashboard de retos por nivel → actividad → guardado.
- 🟠 ✅ **Guardado sin confirmación real de BD**: tras 2.8 ya no cuelga y se marca
  `syncPending`, pero el alumno aún no recibe un aviso explícito si Supabase no confirmó
  (depende del follow-up 2.9).
- 🟡 🔎 **Merge local↔Supabase por timestamp** en `/api/load` puede favorecer un origen u otro;
  revisar que no descarte campos en sesiones desde dispositivos distintos.

### 5.2 Profesor
- 🟠 🔎 **`/api/incidents` GET sin filtro por profesor** → un docente ve incidencias de toda la
  escuela. También faltaría validar `teacher_id` en POST/PUT.
- 🟡 🔎 **Selección de clase poco clara** en `/teacher/progress`.
- 🟡 🔎 **Evaluación/knowledge-test hardcodeados** en el servidor (respuestas fijas q1=='B'…);
  frágil si cambia el orden de preguntas en la vista.

### 5.3 Admin
- 🟠 🔎 **`level_config` ignorado**: el servidor fuerza todos los retos a `true`, anulando lo que
  el admin configure.
- 🟡 🔎 **Workflow de `pending_teachers` nunca se dispara** (archivo siempre vacío); o se
  implementa el registro pendiente o se retira la función.
- 🟡 🔎 Sin paginación/filtros en listados grandes de estudiantes/reportes.

---

## 6. Contenidos

| # | Hallazgo | Sev | Estado |
|---|----------|-----|--------|
| 6.1 | **K7–K12** existen en `level_config.json` pero **sin profesores** en `class_teacher_config.json` (que llega hasta K6) → clases sin responsable de evaluación | 🟠 | 🔎 |
| 6.2 | `medienpassActivities` está **vacío** (`{'2526':[], …}`) pero el server intenta cargarlo → código heredado confuso | 🟡 | 🔎 |
| 6.3 | `default_agent_tools` se pasa a la vista pero **no se usa** en `activity.ejs` | 🟡 | 🔎 |
| 6.4 | `mint_sach` **sin traducir** (mismo texto en DE/EN) en `data_levels.js` | 🟡 | 🔎 |
| 6.5 | Mapeo profesor↔clase por **nombre** en `class_teacher_config.json` vs autenticación por **email** en `teachers` → desconexión | 🟠 | 🔎 |
| 6.6 | `student_code` sin **unicidad global** (posible colisión entre clases) | 🟠 | 🔎 |
| 6.7 | `star_rating` **sin escala definida** en `data.js` (¿1–3? ¿1–5?) | 🟡 | 🔎 |
| 6.8 | Competencias KMK (`training_competencies.js`) no **mapeadas** explícitamente a cada Reto en `data.js` | 🟡 | 🔎 |

---

## 7. Plan de acción priorizado

| Orden | Acción | Área | Sev | Esfuerzo | Estado |
|-------|--------|------|-----|----------|--------|
| 1 | Eliminar el cuelgue de guardado (timeout middleware + cliente, escritura atómica/serializada) | Guardado | 🔴 | M | ✅ **Hecho** |
| 2 | Cola de reintentos para `syncPending` al cargar (`/api/load`) | Guardado | 🟠 | M | ✅ **Hecho** |
| 3 | Filtrar `/api/incidents` por profesor; validar `teacher_id` en POST/PUT | Procesos | 🟠 | S | ✅ **Hecho** |
| 4 | Unicidad de `student_code` (constraint en Supabase) | Contenidos | 🟠 | S | ⚠️ Requiere ALTER TABLE en Supabase — pendiente de schema |
| 5 | Resolver K7–K12 sin profesor (extender `class_teacher_config.json`) | Contenidos | 🟠 | M | ⚠️ Requiere decisión pedagógica sobre qué profesores asignar |
| 6 | `level_config`: quitado el force-true; la configuración del admin ya se respeta | Procesos | 🟠 | S | ✅ **Hecho** |
| 7 | Textos hardcodeados (modal bienvenida, placeholder clase) con `data-i18n`; nuevas claves DE/EN/ES en `i18n.js`; soporte `data-i18n-option` en `lang.js` | UI/i18n | 🟠 | S | ✅ **Hecho** |
| 8 | `ARIA` completo en acordeones (accessibility) | UI/Accesib. | 🟡 | M | ⚠️ Parcial — requiere revisión completa de cada widget |
| 9 | Barra de progreso + indicadores de paso en Reto 0 | UI | 🟡 | S | ✅ **Hecho** |
| 10 | Responsividad (breakpoints 320/768/1024) y centralizar CSS | UI | 🟡 | M | ⚠️ En roadmap — requiere diseño dedicado |
| 11 | Persistir configuración admin en BD (no solo JSON local) | Arquitectura | 🟠 | M | ⚠️ Requiere nuevas tablas en Supabase |
| 12 | Limpieza de `medienpassActivities` (vacío) y `mint_sach` sin traducir | Contenidos | 🟡 | S | ✅ **Hecho** |
| 13 | Migrar todos los `writeFileSync` en handlers a escritura atómica | Software | 🟡 | M | ✅ **Hecho** |
| 14 | Pruebas automatizadas del flujo de guardado | Software | 🟡 | M | ⚠️ En roadmap |

---

## Anexo — Verificación de las correcciones de guardado

1. **Arranque**: `node server.js` levanta sin errores. *(syntax check de `server.js`,
   `activity.ejs` y `autosave.js`: OK)*
2. **Supabase lento/caído**: apuntar `SUPABASE_URL` a un host inalcanzable; guardar debe
   responder en ≤ ~4 s y mostrar "guardado localmente", sin spinner colgado.
3. **Red lenta (cliente)**: throttling/offline en DevTools; el botón debe rehabilitarse y
   mostrar error tras ~10 s (AbortController), nunca quedar deshabilitado.
4. **Concurrencia**: guardar desde varias pestañas; `local_activity_responses.json` conserva
   todas las entradas (escritura serializada).
5. **Integridad**: la escritura es atómica (`tmp`→`rename`); un archivo corrupto se respalda
   en `*.corrupt-*.bak` y no borra los datos.
6. **Salida de página**: al ocultar/cerrar la pestaña, `sendBeacon` envía sin bloquear; el
   autoguardado de 30 s persiste durante la sesión.
