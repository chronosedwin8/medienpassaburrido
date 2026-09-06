# Plan de saneamiento profundo — MedienPass

Auditoría del 2026-09-06. Snapshot de seguridad en git: commit `17551f8`.

## Hallazgos (medidos, no impresiones)

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | **Cualquiera puede ser administrador** | `requireAdmin` solo comprueba `req.cookies.admin_auth === 'true'`. Basta escribir `document.cookie='admin_auth=true'` en la consola del navegador. Lo mismo con `teacher_auth`. Lo verifiqué con `curl`. |
| 2 | **El rol viaja en una cookie que el cliente puede editar** | `teacher_data` es JSON sin firmar; el servidor confía en su campo `role`. Escalada de privilegios trivial. |
| 3 | **La contraseña del docente es su número de documento** | `.eq('doc_number', cleanPassword)`, en texto plano, y además se copia dentro de la cookie `teacher_data`. |
| 4 | **Contraseña maestra hardcodeada** | `ADMIN_PASSWORD \|\| 'medienpass2526'` en `server.js:214`. |
| 5 | **Tres sistemas de login paralelos** | Estudiante / docente / admin, con 6 cookies distintas y 4 middlewares (`requireLogin`, `requireTeacher`, `requireAdmin`, `requireAnyLogin`). |
| 6 | **72 % del contenido está duplicado** | `data.js` = 635 KB, 7 668 preguntas, solo 2 158 textos únicos → 5 510 duplicados. |
| 7 | **Traducciones guardadas como código ejecutable** | `public/js/i18n.js` se lee con `vm.runInNewContext()` y se reescribe generando JS. Un admin edita → se ejecuta en cada navegador. |
| 8 | **i18n incompleto** | 75 claves traducidas frente a ~146 textos visibles hardcodeados en las vistas. Solo cliente (localStorage) → el HTML del servidor sale siempre en español. |
| 9 | **Front-end sin sistema** | 3 versiones de Font Awesome, 4 familias tipográficas, 5 vistas con Tailwind CDN y 8 con `style.css` (3 905 líneas), ~2 900 líneas de `<style>` incrustado y 15 `<head>` duplicados. |
| 10 | **28 scripts muertos en la raíz** | `patch*.js`, `fix*.js`, `repair*.js`, `restore*.js`, `scratch_*.js`, `import_*.js`, `check_*.js`… ninguno referenciado. Más `server.js.broken` (69 KB). |
| 11 | **RLS de Supabase abierta** | Todas las políticas son `USING (true)` para `FOR ALL`. |
| 12 | **`server.js` monolítico** | 104 KB, ~90 rutas, toda la lógica mezclada. |

## Fases

### F1 — Seguridad y usuarios (crítico)
- Sesiones firmadas con HMAC-SHA256 (`node:crypto`, sin dependencias nuevas). Una sola cookie `mp_session`, imposible de falsificar.
- Modelo único de usuario: estudiantes y personal en un mismo servicio de identidad.
- Jerarquía de roles real y permisos declarativos, no comparaciones de strings dispersas.
- Un solo middleware `requireAuth(...)` sustituye a los cuatro actuales.
- Contraseñas con scrypt. El login legado (documento) sigue funcionando para no dejar fuera a los docentes, pero marcado como legado y actualizable.

### F2 — Cero hardcode
- `config/app.config.json`: colegio, dominio, grados, cursos, años lectivos, roles, TTL de sesión.
- Sin contraseña por defecto: si falta `SESSION_SECRET`/`ADMIN_PASSWORD`, el servidor avisa y no finge seguridad.
- Fuera el `'4D'` por defecto y los dominios de correo incrustados.

### F3 — Idiomas de verdad
- Traducciones en JSON (`config/i18n/*.json`), nunca más código ejecutable.
- Traducción en el servidor: el HTML sale ya en el idioma correcto, sin parpadeo.
- Resolución: `?lang=` → cookie → preferencia del grado → idioma por defecto.
- Cobertura completa de las vistas principales.

### F4 — UI/UX
- Sistema de diseño con tokens CSS (color, tipografía, espaciado, radios, sombras), claro y oscuro.
- Layout compartido: un `<head>`, una navegación, un pie. Se eliminan los 15 duplicados.
- Una sola tipografía y un solo set de iconos.
- Accesibilidad: foco visible, contraste AA, objetivos táctiles grandes para los grados menores.

### F5 — Limpieza
- Los 28 scripts muertos y `server.js.broken` salen del proyecto (quedan en git).
- `server.js` se divide en routers por dominio.

---

# Resultado de la ejecución

## Hecho y verificado

| Fase | Estado | Verificación |
|---|---|---|
| F1 Seguridad y usuarios | ✅ | 17 pruebas en verde; las 3 vías de falsificación de cookies quedan bloqueadas |
| F2 Cero hardcode | ✅ | Sin contraseña por defecto, sin curso `'4D'`, sin dominio incrustado |
| F3 Idiomas | ✅ | JSON, traducción en servidor, 101 claves con paridad es/de/en |
| F4 UI/UX | ⚠️ Parcial | Sistema de diseño + layout + 3 pantallas de acceso. Faltan ~24 vistas |
| F5 Limpieza | ✅ | 36 → 8 archivos `.js` en la raíz |
| Rendimiento | ✅ | Panel del estudiante: 10 MB → 114 KB (−98,9 %) |

## Lo que falta

Las vistas grandes siguen con el CSS antiguo y funcionan con normalidad, pero
todavía no usan el sistema de diseño nuevo:

- `views/admin/dashboard.ejs` (3 856 líneas, 769 de `<style>` incrustado)
- `views/activity.ejs` (3 119 líneas) — la pantalla donde el estudiante responde
- `views/teacher/*.ejs` (7 vistas)
- `public/css/style.css` (3 905 líneas) convive con `medienpass.css`

Orden recomendado para continuar: `activity.ejs` (la que más usan los
estudiantes) → `partials/header.ejs` (lo incluyen 8 vistas) →
`admin/dashboard.ejs`.

## Pendientes de infraestructura

1. **`data.js` tiene 5 510 preguntas duplicadas** de 7 668. Conviene moverlas a
   la base de datos o deduplicarlas por referencia.
2. **RLS de Supabase abierta**: todas las políticas son `USING (true)`.
3. **La contraseña del docente sigue siendo su número de documento** en el login
   histórico. Ya se puede migrar cuenta por cuenta con
   `node scripts/usuarios.js pass <correo>`.
4. **`server.js` sigue siendo monolítico** (~2 600 líneas, 90 rutas).
