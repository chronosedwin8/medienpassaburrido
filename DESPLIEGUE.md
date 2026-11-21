# Despliegue de Medienpass (CapRover)

Guía para publicar una versión nueva en **https://medienpass.panel.fundales.com**. No contiene
claves: las contraseñas y los tokens están fuera del repositorio (`.env` local y las notas
privadas del administrador).

## Dónde corre

| Qué | Dónde |
|---|---|
| Sitio | https://medienpass.panel.fundales.com |
| Panel de CapRover | https://captain.panel.fundales.com (app `medienpass`) |
| Servidor | AWS EC2, usuario `ubuntu`; contenedor `srv-captain--medienpass`, carpeta `/usr/src/app` |
| SSH | Llave `.ppk` del administrador, con `plink`/`pscp` de PuTTY. El puerto 22 solo acepta la IP autorizada en el *security group* `launch-wizard-1`: si `plink` da *timeout*, hay que agregar la IP actual en la consola de AWS (EC2 › Security Groups › Inbound rules). |
| Base de datos | Supabase (`students`, `activity_responses`, `teachers`, `multimedia_products`, `activity_assignments`) |

## Variables de entorno (CapRover › App Configs › Environmental Variables)

| Variable | Para qué |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Base de datos |
| `COOKIE_SECRET` | Firma de las sesiones |
| `AI_TOKEN` | Generación con IA |
| `PHIDIAS_BASE_URL`, `PHIDIAS_TOKEN` | Matrícula de Phidias (estudiantes, nombres y cursos) |
| `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` | Ingreso con Microsoft (app «mediempassLucho») |
| `APP_BASE_URL` | `https://medienpass.panel.fundales.com` (dirección de retorno del SSO) |

Los valores están en el `.env` del equipo de desarrollo. El `.env` no entra en la imagen.

## Una sola vez

1. **Azure** › App registrations › mediempassLucho › Authentication › *Add a platform* › **Web**,
   con las direcciones de retorno `https://medienpass.panel.fundales.com/auth/microsoft/callback` y,
   para desarrollo, `http://localhost:3000/auth/microsoft/callback`.
2. **Supabase** › SQL Editor: ejecutar `migrations/003_activity_assignments.sql`. Crea la tabla de
   actividades asignadas. Sin ella, las asignaciones se guardan en un archivo que se pierde al publicar.

## Cada vez que se publica

La app guarda estado en archivos dentro de la imagen: `data/*.json` (roles, segmentos, docentes
pendientes, caché de respuestas), `subject_config.json`, `level_config.json`,
`class_teacher_config.json` y `public/js/i18n*.js` (textos editados en «Textos e idiomas»).
**Cada publicación los reemplaza**, así que antes hay que traer los de producción.

1. `npm test` debe pasar.
2. Respaldar el estado de producción por SSH. El resultado queda en `data/respaldo_produccion_<fecha>/`.
   Pon la ruta de tu llave en `$KEY` y la IP pública del servidor (está en tus notas privadas) en `$HOST`:
   ```bash
   plink -batch -i "$KEY" ubuntu@$HOST "C=\$(sudo docker ps -q -f name=srv-captain--medienpass); sudo docker exec \$C sh -c 'tar -czf - data subject_config.json level_config.json class_teacher_config.json public/js/i18n*.js' | base64 -w0" > estado.tgz.b64
   base64 -d estado.tgz.b64 > estado.tgz && tar -xzf estado.tgz -C data/respaldo_produccion_<fecha>/estado
   ```
3. Comparar el respaldo con lo local:
   - Si producción tiene textos o configuraciones editados en línea, fusionarlos con los locales.
   - Para `data/`, usar el de producción.
4. Armar el paquete: el código sin `node_modules`, `.env`, `.git`, `.vscode`, `despliegue`, `scratch`,
   `logs`, `*.log`, `*.broken`, `test` ni `data`, más el `data/` de producción. `captain-definition` y
   `Dockerfile` deben quedar en la raíz del tar. Ejemplo:
   `despliegue/medienpass-caprover-AAAA-MM-DD.tar`.
5. Publicarlo en CapRover › app `medienpass` › Deployment › **Tarball**. Hacerlo enseguida del
   respaldo, para no perder cambios hechos en producción entre medias.
6. Verificar en el sitio, solo con GET:
   - la lista de clases (sin «5C» ni «sinact»);
   - «Entrar con Microsoft» con una cuenta de estudiante y una de docente;
   - el ingreso con clase y código;
   - el peso del inicio;
   - que al elegir la materia aparezcan los retos 0 a 6.

## Al empezar un año escolar

Panel › Matrícula › **Phidias y estudiantes** › «Revisar cambios» y «Aplicar cambios» (solo
desarrollador). Pone al día cursos y nombres, crea los estudiantes nuevos y pasa a «sinact» a quienes
ya no están, sin borrar a nadie. Antes guarda una copia en `data/phidias_sync_<fecha>.json`.
