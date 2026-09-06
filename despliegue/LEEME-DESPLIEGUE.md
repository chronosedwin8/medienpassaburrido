# Despliegue en CapRover — MedienPass

Carpeta lista para empaquetar y subir. Todo lo que hay que desplegar está en `app/`.

---

## 1. Crear el .tar

Desde PowerShell, en esta carpeta (`despliegue/`):

```powershell
.\crear-tar.ps1
```

Genera `medienpass-caprover.tar` (~25 MB).

> **Importante:** el tar debe contener `captain-definition` en la **raíz**, no dentro de una
> subcarpeta. Por eso el script empaqueta el *contenido* de `app/` (`tar -cf ... -C app .`)
> y no la carpeta `app/` en sí. Si lo comprimes a mano con el explorador de Windows o
> creando `tar -cf app.tar app/`, CapRover fallará con
> *"captain-definition file does not exist"*.

Equivalente manual:

```powershell
tar -cf medienpass-caprover.tar -C app .
tar -tf medienpass-caprover.tar | Select-Object -First 10   # verificar la raíz
```

---

## 2. Configurar las variables de entorno EN CapRover

El archivo `.env` **no se incluye** en el tar (contiene secretos). Sin estas variables la app
arranca, pero **no guarda datos en Supabase y la IA no funciona**.

En CapRover → tu app → **App Configs** → *Environmental Variables*:

| Variable | Valor | Necesaria para |
|---|---|---|
| `SUPABASE_URL` | `https://oklsflrolbjixfsyhfyd.supabase.co` | Persistencia de datos |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` (la de tu `.env`) | Persistencia de datos |
| `GEMINI_API_KEY` | `AIza...` | Generar / Ajustar preguntas con IA |
| `GEMINI_MODEL` | *(opcional)* `gemini-2.5-flash` | Cambiar de modelo |
| `GEMINI_BATCH_SIZE` | *(opcional)* `6` | Preguntas por request |

`PORT` y `NODE_ENV` ya vienen definidas en el `Dockerfile`; no las agregues.

> ⚠️ **La `GEMINI_API_KEY` debe empezar por `AIza`.** Un token que empiece por `AQ.` es un
> token OAuth temporal y **no sirve** para `generativelanguage.googleapis.com`: la app
> responderá "modo de respaldo local". Genera la clave correcta en
> https://aistudio.google.com/apikey

Después de guardar variables, CapRover reinicia la app sola.

---

## 3. Subir a CapRover

CapRover → tu app → pestaña **Deployment** → *Method 2: Tarball* →
selecciona `medienpass-caprover.tar` → **Upload & Deploy**.

Sigue el log de build. Al final debe aparecer:

```
🚀 Server running on http://localhost:3000
```

En **HTTP Settings**, `Container HTTP Port` debe ser **3000**.

---

## 4. Persistencia de los datos editables (IMPORTANTE)

La carpeta `data/` guarda estado que cambia en producción:

- `custom_instruments.json` — preguntas personalizadas y generadas con IA por los docentes
- `local_activity_responses.json` — respuestas locales
- `pending_teachers.json`, `teacher_roles.json` — docentes y roles

**Cada redespliegue reemplaza el contenedor y esos archivos vuelven al estado del tar**, es
decir, se pierde lo que los docentes hayan guardado desde la última subida.

Para evitarlo, en CapRover → **App Configs** → *Persistent Directories*:

| Path in App | Label |
|---|---|
| `/usr/src/app/data` | `medienpass-data` |

Hazlo **antes** del primer despliegue en producción. Ojo: al montar el volumen, la carpeta
queda vacía la primera vez, así que la app regenerará los archivos por defecto; si necesitas
conservar los actuales, súbelos manualmente al volumen o haz el montaje después de un
despliegue y copia los archivos dentro del contenedor.

---

## Qué contiene `app/`

Solo lo que la aplicación necesita en tiempo de ejecución:

```
captain-definition, Dockerfile, .dockerignore
package.json, package-lock.json
server.js
data.js, data_levels.js, data_questions.js      (data.js requiere los otros dos)
default_agent_tools.js, kmk_training_questions.js, training_competencies.js
supabaseClient.js
class_teacher_config.json, level_config.json, subject_config.json
services/     -> ai_service.js (Gemini), instrument_store.js
views/        -> plantillas EJS
public/       -> css, js, PDFs
data/         -> estado inicial (ver punto 4)
```

Quedan **fuera** a propósito: `node_modules/` (se instala en el build), `.env`, los scripts de
mantenimiento e importación de la raíz (`patch*.js`, `fix*.js`, `repair*.js`, `import_*.js`,
`check_*.js`, `scratch_*.js`, `generate_data.js`, `seed_devices.js`, `update_teachers_db.js`,
`test_login.js`, `db_fix.js`, `restore*.js`), `server.js.broken`, `*.log`, `AUDITORIA.md`,
`schema.sql`, `migrations/`.

---

## Verificado antes de entregar

- `npm ci --omit=dev` resuelve correctamente (lockfile sincronizado, 98 paquetes).
- La app arranca desde `app/` con `node server.js` sin errores de módulos faltantes.
- Node 20 en la imagen (`fetch` global disponible, que es lo que usa el servicio de IA).

## Después de desplegar

Comprueba que la IA quedó bien configurada abriendo, con sesión de docente iniciada:

```
https://TU-APP.tu-dominio.com/api/instruments/ai-status
```

Debe responder `{"success":true,"configured":true,"model":"gemini-2.5-flash"}`.
Si responde `configured:false`, el `message` te dice exactamente qué falta.
