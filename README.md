# Taquilla de Cine — Frontend Angular 21

Componente frontend del proyecto académico **Taquilla de Cine**, desarrollado para la
asignatura **Programación Basada en Componentes**.

Esta fase (3.6) implementa el **módulo de taquilla y reportes de ventas** en el frontend:
filtros de fechas con inicialización automática a la fecha actual de Colombia (America/Bogota),
consulta de ventas mediante `GET /api/reportes/ventas`, visualización de indicadores clave
(cantidad de compras, boletos vendidos, total recaudado en COP) y detalle tabular de cada
venta. Reutiliza la arquitectura, estilos y componentes de las fases 3.3, 3.4 y 3.5.

## Tecnologías

| Tecnología | Versión |
|---|---|
| Angular | 21.2.26 |
| Angular CLI | 21.2.30 |
| TypeScript | 5.9.3 |
| Node.js | 24.15.0 (LTS compatible con Angular 21) |
| npm | 12.2.0 |
| RxJS | 7.8.2 |
| Vitest (runner incluido por Angular) | 4.1.12 |

Características usadas:

- Arquitectura basada en **NgModule** (no standalone).
- **Angular Router** con carga diferida por módulo funcional.
- **HttpClient** con `provideHttpClient(withFetch())`.
- **Reactive Forms** para formularios de películas, funciones, compras y filtros.
- **Signals** para el estado de la UI y detección de cambios zoneless.
- CSS convencional, sin frameworks de estilos.
- Archivos separados `.ts`, `.html` y `.css`.

No se utilizan Tailwind, Bootstrap, Angular Material, NgRx, librerías de componentes, SSR,
PWA ni dependencias innecesarias.

## Requisitos previos

1. **Node.js 24.x** (probado con 24.15.0) y npm.
2. **Angular CLI 21** — no es necesario instalarlo globalmente; se usa `npx` o la copia
   local del proyecto.
3. **Backend Spring Boot** (`taquilla-cine-api`) en ejecución sobre el puerto `8080`.
4. **PostgreSQL local** con la base `taquilla_cine_test` (administrada por
   `taquilla-cine-db`). El frontend **no** se conecta a PostgreSQL: solo consume la API.

## Instalación de dependencias

Desde la carpeta `taquilla-cine-web`:

```powershell
npm install
```

El archivo `package-lock.json` se conserva para instalaciones reproducibles.

## Comandos de desarrollo

```powershell
npm start
```

La aplicación queda disponible en:

```
http://localhost:4200
```

Para usar la CLI local directamente:

```powershell
npx ng serve
```

## Compilación

```powershell
npm run build
```

El resultado se genera en `dist/taquilla-cine-web/browser`. La compilación de producción usa
`src/environments/environment.ts`; `ng serve` reemplaza ese archivo por
`environment.development.ts`.

## Pruebas

```powershell
# Modo interactivo (watch)
npm test

# Ejecución única, apta para verificación automatizada
npm run test:ci
```

Las pruebas usan **Vitest + jsdom**, el runner que Angular 21 incluye por defecto. No se
instalaron frameworks de pruebas adicionales.

**Cobertura actual (92 pruebas):**

- `AppComponent`: creación del contenedor y presencia de los cuatro enlaces de navegación.
- `PeliculasComponent`: listado, creación, validaciones, edición, eliminación, errores 409, carga y estados.
- `PeliculaFormComponent`: formulario en modo creación/edición, validaciones, límites, recorte, errores de servidor, botones deshabilitados.
- `FuncionesComponent`: listado, carga de películas en selector, creación, validaciones de campos, edición, eliminación, conflictos 409 (capacidad, compras), errores de conexión, prevención de envíos duplicados, actualización de listado.
- `FuncionFormComponent`: formulario en modo creación/edición, validaciones de todos los campos (película, fecha, hora, sala, precio, cupos), límites, recorte, información de cupos en edición, errores de servidor, botones deshabilitados, no envío de `cuposDisponibles`.
- `ComprasComponent`: carga de funciones, listado de compras, estado sin funciones, validación del formulario, cálculo visual del total, registro exitoso, solicitud POST con campos correctos, actualización del listado y cupos, validación frontend de cupos insuficientes, función agotada, error de conexión, prevención de envíos duplicados.
- `TaquillaComponent`: inicialización con fecha actual de Colombia, consulta de ventas por día y rango, parámetros HTTP correctos, validación de fechas obligatorias, rechazo de rango invertido, visualización de indicadores, visualización de detalle, estado sin ventas, manejo de errores HTTP, manejo de errores de conexión, formato monetario, prevención de consultas duplicadas, botón Hoy.

Las pruebas sustituyen los servicios por dobles de prueba: **no** realizan peticiones
HTTP reales. La verificación real contra Spring Boot y PostgreSQL se describe más abajo.

## Estructura por módulos

```
taquilla-cine-web/
├── src/
│   ├── app/
│   │   ├── app.component.{ts,html,css}      # Contenedor: menú lateral y <router-outlet>
│   │   ├── app.module.ts                    # NgModule raíz
│   │   ├── app-routing.module.ts            # Rutas principales y carga diferida
│   │   ├── models/                          # Interfaces del contrato de la API
│   │   │   ├── pelicula.model.ts
│   │   │   ├── funcion.model.ts
│   │   │   ├── compra.model.ts
│   │   │   ├── reporte.model.ts
│   │   │   ├── api-error.model.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── pelicula.service.ts          # CRUD completo /api/peliculas
│   │   │   ├── funcion.service.ts           # CRUD completo /api/funciones
│   │   │   ├── compra.service.ts            # GET/POST /api/compras
│   │   │   └── reporte.service.ts           # GET /api/reportes/ventas
│   │   ├── shared/
│   │   │   ├── shared.module.ts
│   │   │   └── components/page-header/      # Encabezado reutilizable
│   │   └── modules/
│   │       ├── peliculas/                   # CRUD películas (fase 3.3)
│   │       │   ├── components/pelicula-form/
│   │       │   ├── peliculas.component.ts
│   │       │   ├── peliculas.component.html
│   │   │   ├── peliculas.component.css
│   │       │   ├── peliculas.module.ts
│   │   │   └── peliculas-routing.module.ts
│   │       ├── funciones/                   # CRUD funciones (fase 3.4)
│   │       │   ├── components/funcion-form/
│   │       │   ├── funciones.component.ts
│   │       │   ├── funciones.component.html
│   │       │   ├── funciones.component.css
│   │       │   ├── funciones.module.ts
│   │       │   └── funciones-routing.module.ts
│   │       ├── compras/                     # Registro y listado compras (fase 3.5)
│   │       │   ├── compras.component.ts
│   │       │   ├── compras.component.html
│   │       │   ├── compras.component.css
│   │       │   ├── compras.module.ts
│   │       │   └── compras-routing.module.ts
│   │       ├── taquilla/                    # Reporte de ventas (fase 3.6)
│   │       │   ├── taquilla.component.ts
│   │       │   ├── taquilla.component.html
│   │   │   ├── taquilla.component.css
│   │       │   ├── taquilla.module.ts
│   │   │   └── taquilla-routing.module.ts
│   ├── environments/
│   │   ├── environment.ts                   # Producción
│   │   └── environment.development.ts       # Desarrollo (ng serve)
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── .agents/skills/modern-web-guidance/      # Skill instalada a nivel de proyecto
├── docs/
│   ├── evidencias-fase-3.2/                 # Capturas PNG fase 3.2
│   ├── evidencias-fase-3.3/                 # Capturas PNG fase 3.3
│   ├── evidencias-fase-3.4/                 # Capturas PNG fase 3.4
│   ├── evidencias-fase-3.5/                 # Capturas PNG fase 3.5 (pendientes E2E)
│   └── evidencias-fase-3.6/                 # Capturas PNG fase 3.6 (pendientes E2E)
├── skills-lock.json
├── angular.json
├── package.json
└── README.md
```

Cada módulo funcional tiene su propio `*.module.ts`, `*-routing.module.ts`, componente,
plantilla y hoja de estilos.

## Rutas configuradas

| Ruta | Módulo | Estado |
|---|---|---|
| `/` | — | Redirige a `/peliculas` |
| `/peliculas` | `PeliculasModule` | CRUD completo (fase 3.3) |
| `/funciones` | `FuncionesModule` | CRUD completo (fase 3.4) |
| `/compras` | `ComprasModule` | Registro y listado (fase 3.5) |
| `/taquilla` | `TaquillaModule` | Reporte de ventas (fase 3.6) |
| `**` | — | Redirige a `/peliculas` |

## Diseño visual

El armazón se compone de un **menú lateral fijo** con el nombre del sistema, un icono de
cine y los cuatro enlaces, y un **área principal** con el encabezado de cada sección más
`<router-outlet>`. `AppComponent` solo aporta estructura; no contiene lógica de negocio.

En `styles.css` se definen las variables de color y los estilos reutilizables:

| Uso | Variable | Valor |
|---|---|---|
| Menú lateral | `--color-menu` | `#1E293B` |
| Fondo general | `--color-fondo` | `#F8FAFC` |
| Superficies | `--color-superficie` | `#FFFFFF` |
| Color principal | `--color-primario` | `#2563EB` |
| Texto principal | `--color-texto` | `#1E293B` |
| Texto secundario | `--color-texto-suave` | `#64748B` |
| Bordes | `--color-borde` | `#E2E8F0` |
| Éxito | `--color-exito` | `#15803D` |
| Error y eliminación | `--color-error` | `#DC2626` |

Clases globales preparadas y usadas:

- Botones: `.boton`, `.boton--primario`, `.boton--secundario`, `.boton--editar`,
  `.boton--eliminar`, `.boton--peligro`, `.boton--pequeno`.
- Mensajes y estados: `.mensaje--error`, `.mensaje--exito`, `.estado-carga`, `.estado-vacio`.
- Tablas: `.tabla-contenedor`, `table`, `.celda-id`.
- Formularios: `.formulario`, `.campo`, `.campo__ayuda`, `.campo__error`.
- Contenedores y etiquetas: `.pagina`, `.panel`, `.panel-cabecera`, `.etiqueta`, `.ficha`.
- Cargadores: `.cargador`, `.cargador--pequeno`.

La opción activa del menú se marca con `routerLinkActive` y `aria-current="page"`, y se
distingue por color de fondo **y** peso tipográfico, no solo por color.

### Adaptación y accesibilidad

- Escritorio y portátil: menú lateral de 16.5rem y contenido flexible.
- Hasta 900 px: el menú pasa a la parte superior con enlaces en una fila que se ajusta;
  no se oculta ninguna opción.
- Hasta 480 px: los enlaces se organizan en dos columnas y el contenido usa una sola columna.
- Enlace «Saltar al contenido principal», foco visible de 3 px y áreas de pulsación de al
  menos 2.75rem en móvil.
- Las tablas se desplazan horizontalmente dentro de `.tabla-contenedor`, sin desbordar la
  página (`grid-template-columns: minmax(0, 1fr)` en `.pagina`).
- Contraste comprobado: texto secundario 4.55:1 sobre el fondo, color principal 5.17:1
  sobre blanco.

## Evidencias de la fase 3.6

En `docs/evidencias-fase-3.6/` se guardarán capturas reales tomadas con Chrome headless
**tras la ejecución de la integración E2E** (pendiente en el momento de redacción).

| Archivo | Contenido |
|---|---|
| `01-filtros-fechas.png` | Filtros con fecha de hoy preseleccionada |
| `02-resumen-ventas.png` | Tres tarjetas: compras, boletos, total recaudado |
| `03-detalle-ventas.png` | Tabla con detalle de cada venta |
| `04-validaciones-fechas.png` | Validación de rango invertido y campos obligatorios |
| `05-sin-ventas.png` | Estado vacío cuando no hay ventas en el período |
| `06-error-conexion.png` | Mensaje de error al caer el backend |
| `07-boton-hoy.png` | Botón "Hoy" restableciendo filtros |
| `08-vista-movil.png` | Vista adaptada a 390×844 |

> **Nota:** Las capturas se generarán durante la ejecución real del flujo E2E contra
> Spring Boot y PostgreSQL local. Al momento de esta versión del README, la integración
> E2E está **pendiente de ejecución**; la carpeta existe pero está vacía.

## Configuración de la URL del backend

La URL base se define **una sola vez** en los archivos de entorno:

```ts
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://[::1]:8080/api',
};
```

`environment.ts` contiene el mismo valor para la compilación de producción. Los servicios
construyen sus rutas a partir de `environment.apiUrl`; los componentes no repiten la URL.

## Uso de Modern Web Guidance

La skill oficial se instaló únicamente en este proyecto, con el método oficial de Skills CLI:

```powershell
$env:DISABLE_TELEMETRY='1'
npx skills add GoogleChrome/modern-web-guidance --agent opencode --yes
```

- Ubicación: `.agents/skills/modern-web-guidance/`
- Registro: `skills-lock.json`
- Ámbito: proyecto (no global)
- Agentes detectados: incluye OpenCode

Se utilizó como orientación para HTML semántico, accesibilidad básica, jerarquía de
encabezados, navegación con `aria-current`, tablas con `caption`/`scope`, foco visible y
diseño adaptable con CSS. En la fase 3.6 se consultaron además las guías de formularios
reactivos, validación, accesibilidad, tablas adaptables y manejo de zonas horarias,
siempre con la telemetría deshabilitada. No se adoptaron APIs experimentales ni se modificó
la arquitectura solicitada por el profesor.

## Integración con Spring Boot y PostgreSQL

### Separación obligatoria de entornos (backend)

El frontend consume la API en `http://localhost:8080`. El backend mantiene **dos entornos de base de datos separados**:

| Entorno | Base de datos | Uso |
|---------|---------------|-----|
| **Local (automatizado)** | `taquilla_cine_test` (PostgreSQL local) | **Solo pruebas automatizadas** (`mvn test`) |
| **Remoto / Usuario (Neon)** | `taquilla_cine` en **Neon** | **Ejecución habitual, pruebas manuales, desarrollo** |

**Para el usuario (Neon - funcionamiento habitual):**
- El backend ya incluye `application-local.properties` (no versionado) con la configuración de Neon.
- Inicio recomendado (incluido en `../taquilla-cine-api/iniciar.bat`):
  ```powershell
  cd ..\taquilla-cine-api
  .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local" "-Dspring-boot.run.arguments=--spring.config.additional-location=file:./application-local.properties"
  ```
- Verificación:
  ```powershell
  curl.exe http://localhost:8080/actuator/health
  # {"groups":["liveness","readiness"],"status":"UP"}
  ```

**Para pruebas automatizadas (local):**
- Requiere variables de entorno locales y base `taquilla_cine_test`.
- Ver `../taquilla-cine-api/README.md` sección "Configuración de PostgreSQL → Local (solo pruebas automatizadas)".

> **Regla:** Después de ejecutar `mvn test` (que usa PostgreSQL local), si se reinicia la aplicación para el usuario, **debe arrancarse con el perfil `local` y `application-local.properties` para conectar a Neon**.

### Arranque del backend para desarrollo/usuario (Neon)

```powershell
cd ..\taquilla-cine-api
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local" "-Dspring-boot.run.arguments=--spring.config.additional-location=file:./application-local.properties"
```

### Comprobación de salud

```powershell
curl.exe http://localhost:8080/actuator/health
# Respuesta: {"groups":["liveness","readiness"],"status":"UP"}
```

Flujo a verificar en la fase 3.6 (integración real, **pendiente de ejecución**):

1. Verificar que existan compras registradas (creadas en fase 3.5).
2. Navegar a `/taquilla` y verificar que ambas fechas se inicializan con la fecha actual de Colombia.
3. Consultar ventas del día actual; verificar indicadores y detalle.
4. Cambiar el rango de fechas y consultar; verificar que los parámetros HTTP son correctos.
5. Invertir el rango de fechas → validación frontend.
6. Dejar una fecha vacía → validación frontend.
7. Simular error de conexión (detener Spring Boot) → mensaje amigable.
8. Presionar botón "Hoy" → fechas se restablecen a hoy.
9. Verificar que una respuesta 200 sin registros muestra estado vacío (no error).

**Limpieza selectiva**: no se crean registros en esta fase (solo lectura), por lo que no
hay limpieza pendiente.

El contrato completo está en
`..\taquilla-cine-api\docs\API_CONTRACT.md` y es la única fuente de nombres, tipos y
formatos.

## Interfaces del contrato

Definidas en `src/app/models/`:

- `PeliculaRequest`, `PeliculaResponse`
- `FuncionRequest`, `FuncionResponse`
- `CompraRequest`, `CompraResponse`
- `DetalleVentaResponse`, `ReporteVentasResponse`
- `ErrorResponse`, `ValidationErrorResponse`

No se usa `any` como solución general. Los formatos respetan el contrato: fechas
`YYYY-MM-DD`, horas `HH:mm`/`HH:mm:ss`, importes numéricos y `fechaCompra` en ISO 8601.

## Resultados de compilación y pruebas

**Compilación de producción (`npm run build`):**
- Initial total: 284.35 kB raw / 76.44 kB transfer
- Lazy chunks: `funciones-module` 27.95 kB (7.20 kB), `peliculas-module` 20.24 kB (5.42 kB), `compras-module` 18.05 kB (5.12 kB), `taquilla-module` 12.13 kB (3.87 kB)

**Pruebas unitarias (`npm run test:ci`):**
- 7 test files passed
- 92 tests passed
- Duración aprox. 8.5s

**Integración E2E real:** *Pendiente de ejecución (Fase 3.8).*

## Fase 3.7 - Auditoría Final

**Estado:** ✅ Completada.

**Correcciones aplicadas:**
- Corregido error NG0100 (ExpressionChangedAfterItHasBeenCheckedError) en la validación de rango de fechas invertido del módulo Taquilla.
- Eliminada validación duplicada en el template (línea 82-84) que conflictuaba con el signal `error()` del componente.
- El template ahora usa el signal `error()` del componente para mostrar el mensaje de validación de rango invertido.
- Test "debe validar rango de fechas invertido" corregido y funcional (antes pendiente con `expect(true).toBe(true)`).

**Verificación:**
- Rango de fechas invertido → muestra mensaje "La fecha inicial no puede ser posterior a la fecha final" sin enviar HTTP.
- Rango válido → consulta el reporte correctamente.
- Botón "Hoy" restablece fechas a hoy (zona America/Bogota).
- Validaciones de campos obligatorios funcionan.

## Limitaciones conocidas de la fase 3.7

- No hay autenticación ni gestión de sesiones.
- No hay paginación ni filtros en los listados (contrato actual de la API).
- Los reportes son de solo lectura (GET); no hay exportación a Excel/PDF.
- Los precios se formatean en el frontend con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })`; los cálculos monetarios oficiales son del backend.
- El filtrado oficial de fechas corresponde al backend; el frontend solo envía los parámetros.

## Restricciones respetadas

- No se modificó `taquilla-cine-db`, `taquilla-cine-api`, el esquema PostgreSQL ni el
  contrato de la API.
- No se reconstruyó el módulo de películas, funciones ni compras.
- No se incorporó autenticación.
- No se utilizó Tailwind, Bootstrap ni Angular Material.
- No se introdujeron dependencias innecesarias.
- No se usaron bases remotas.
- No se instalaron herramientas globales.
- No se realizaron commits, push ni despliegues.
- No se guardaron credenciales en archivos ni logs.
- No se ejecutaron operaciones de limpieza masiva (`DELETE` sin condiciones, `DROP`, `TRUNCATE`).

## Fase 4.1 - Integración Local

**Estado:** ✅ Completada (26/26 pruebas manuales aprobadas, servicios activos).

### Servicios activos

| Servicio | Puerto | Verificación |
|----------|--------|--------------|
| PostgreSQL | 5432 | `taquilla_cine_test` (2 películas, 2 funciones, 2 compras) |
| Spring Boot | 8080 | `{"status":"UP"}` |
| Angular | 4200 | `ng serve --port 4200 --host 0.0.0.0` |
| CORS | - | `Access-Control-Allow-Origin: http://localhost:4200` |

### Cómo iniciar

```powershell
# Spring Boot
$env:DB_URL="jdbc:postgresql://localhost:5432/taquilla_cine_test"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="desyerb1234"
$env:SERVER_PORT="8080"
$env:APP_CORS_ALLOWED_ORIGINS="http://localhost:4200,http://127.0.0.1:4200,http://[::1]:4200"
java -jar .\taquilla-cine-api\target\api-0.0.1-SNAPSHOT.jar

# Angular
cd .\taquilla-cine-web
npx ng serve --port 4200 --host 0.0.0.0
```

### Resultados de pruebas

| Componente | Comando | Resultado |
|------------|---------|-----------|
| Backend | `mvn test` | **142/142** pasan, BUILD SUCCESS |
| Frontend | `npm run test:ci` | **92/92** pasan (7 files) |
| Frontend | `npm run build` | SUCCESS (284.35 kB raw / 76.44 kB gzip) |

### Pruebas manuales end-to-end (usuario)

| Categoría | Pruebas | Estado |
|-----------|---------|--------|
| Películas | 4/4 | ✅ |
| Funciones | 4/4 | ✅ |
| Compras | 7/7 | ✅ |
| Taquilla y reportes | 8/8 | ✅ |
| Integridad y persistencia | 3/3 | ✅ |
| **Total** | **26/26** | **✅ Aprobado** |

### Corrección aplicada: Formulario de Compras

**Problema:** El botón "Registrar compra" no ejecutaba el registro (formulario se limpiaba sin efecto).

**Causa raíz:** `ComprasModule` importaba solo `ReactiveFormsModule`, pero el formulario usa `(ngSubmit)` (template-driven forms) con binding manual via signals, requiriendo `FormsModule`.

**Archivo modificado:** `src/app/modules/compras/compras.module.ts`
```diff
- import { ReactiveFormsModule } from '@angular/forms';
+ import { FormsModule, ReactiveFormsModule } from '@angular/forms';

  imports: [SharedModule, FormsModule, ReactiveFormsModule, ComprasRoutingModule],
```

**Verificación post-fix:** 92/92 tests pasan, build SUCCESS, prueba manual funcional.

### Fase 4.2 - Integración con PostgreSQL Remoto (Neon)

**Estado:** ✅ Completada (14/14 comprobaciones manuales + 16/16 validación remota final aprobadas).

### Configuración

| Entorno | Base de datos | Uso |
|---------|---------------|-----|
| **Local (automatizado)** | `taquilla_cine_test` (PostgreSQL local) | Solo `mvn test` |
| **Remoto / Usuario (Neon)** | `taquilla_cine` en **Neon** | Desarrollo, pruebas manuales, ejecución habitual |

### Configuración Neon (backend)

Archivo `application-local.properties` (no versionado, creado por el usuario):
```properties
spring.datasource.url=jdbc:postgresql://ep-green-cherry-bdufmccf.c-8.us-east-2.aws.neon.tech:5432/taquilla_cine?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.password=***
```

### Arranque para desarrollo/usuario (Neon)

```powershell
cd ..\taquilla-cine-api
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local" "-Dspring-boot.run.arguments=--spring.config.additional-location=file:./application-local.properties"
```

### Verificación de salud

```powershell
curl.exe http://localhost:8080/actuator/health
# Respuesta: {"groups":["liveness","readiness"],"status":"UP"}
```

### Corrección aplicada: Formulario de Compras (Reactive Forms)

**Problema:** El selector de funciones no actualizaba el valor seleccionado (binding manual con signals fallaba al comparar number vs string).

**Causa raíz:** Binding manual `[value]` / `(change)` con signals + comparación `number === string` fallaba silenciosamente.

**Solución:** Refactor completo a **Reactive Forms** consistente con el resto del proyecto:
- `FormGroup` + `FormControl` + `Validators`
- `formControlName` + `[ngValue]="f.id"` (valor numérico real)
- Validadores personalizados: `noSoloEspacios`, `enteroPositivo`
- Getters públicos para controles y mensajes de error

**Archivos modificados:**
- `src/app/modules/compras/compras.component.ts` — Refactor completo a Reactive Forms
- `src/app/modules/compras/compras.component.html` — Template Reactive Forms (`[formGroup]`, `formControlName`, `[ngValue]`)
- `src/app/modules/compras/compras.component.spec.ts` — Tests actualizados + 4 tests de regresión DOM

**Verificación post-fix:** 96/96 tests pasan (4 nuevos de regresión DOM), build SUCCESS, prueba manual con Neon funcional.

### Pruebas manuales con Neon (usuario)

| Categoría | Pruebas | Estado |
|-----------|---------|--------|
| Corrección selector compras | 14/14 | ✅ |
| Validación remota final (Neon) | 16/16 | ✅ |
| **Total fase 4.2** | **30/30** | **✅ Aprobado** |

### Resumen acumulado de pruebas

| Fase | Automatizadas | Manuales | Estado |
|------|---------------|----------|--------|
| Backend (mvn test) | 142/142 | — | ✅ |
| Frontend (npm run test:ci) | 96/96 | — | ✅ |
| Integración local (Fase 4.1) | — | 26/26 | ✅ |
| Integración Neon (Fase 4.2) | — | 30/30 | ✅ |
| **Total acumulado** | **238/238** | **56/56** | **✅** |

---

## Fase 5 - Preparación de Repositorios y Documentación Final

**Estado:** 🔄 En preparación.

### Documentación pendiente

- Actualizar `taquilla-cine-db/README.md`
- Actualizar `taquilla-cine-api/README.md`
- Actualizar `docs/PRUEBAS_INTEGRACION.md` con resultados finales

### Seguridad y repositorios

- Revisión de credenciales y `.gitignore`
- Preparación para commit inicial (sin push)
- Verificación de `.gitignore` y archivos excluidos