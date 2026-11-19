# Taquilla de Cine — Frontend Angular 21

Frontend del sistema de taquilla de cine, desarrollado con **Angular 21** para la asignatura **Programación Basada en Componentes**.

## Descripción

Interfaz web para la gestión de películas, funciones, compras y reportes de ventas. Consume la API REST del backend Spring Boot (`taquilla-cine-api`).

## Tecnologías

| Tecnología | Versión |
|------------|---------|
| Angular | 21.2.26 |
| Angular CLI | 21.2.30 |
| TypeScript | 5.9.3 |
| Node.js | 24.15.0 (LTS) |
| npm | 12.2.0 |
| RxJS | 7.8.2 |
| Vitest | 4.1.12 (runner incluido) |

**Características:**
- Arquitectura **NgModule** (no standalone).
- **Angular Router** con carga diferida por módulo funcional.
- **HttpClient** con `provideHttpClient(withFetch())`.
- **Reactive Forms** para todos los formularios.
- **Signals** para estado de UI y detección de cambios zoneless.
- CSS convencional, sin frameworks (Tailwind, Bootstrap, Angular Material).
- Archivos separados `.ts`, `.html`, `.css`.

## Funcionalidades Principales

| Módulo | Funcionalidad |
|--------|---------------|
| **Películas** | CRUD completo: listado, creación, consulta, edición, eliminación, validaciones, errores 409. |
| **Funciones** | CRUD completo: listado, creación, consulta, edición, eliminación, validaciones de campos, gestión de cupos, errores 409. |
| **Compras** | Registro y listado: selección de función, validación de cliente y boletos, cálculo de total estimado, registro con descuento de cupos, rechazo por cupos insuficientes, listado con detalle. |
| **Taquilla** | Reporte de ventas: filtros de fecha (hoy, rango), indicadores (compras, boletos, total COP), detalle tabular, validaciones de rango, botón "Hoy", manejo de errores de conexión. |

## Arquitectura

Arquitectura basada en **NgModule** con carga diferida por módulo funcional:

```
taquilla-cine-web/
├── src/
│   ├── app/
│   │   ├── app.component.{ts,html,css}      # Contenedor: menú lateral + <router-outlet>
│   │   ├── app.module.ts                    # NgModule raíz
│   │   ├── app-routing.module.ts            # Rutas principales + carga diferida
│   │   ├── models/                          # Interfaces del contrato (Pelicula, Funcion, Compra, Reporte)
│   │   ├── services/                        # Servicios HTTP (Pelicula, Funcion, Compra, Reporte)
│   │   ├── shared/                          # SharedModule + PageHeaderComponent
│   │   └── modules/
│   │       ├── peliculas/                   # CRUD películas
│   │       ├── funciones/                   # CRUD funciones
│   │       ├── compras/                     # Registro y listado compras
│   │       └── taquilla/                    # Reporte de ventas
│   ├── environments/
│   │   ├── environment.ts                   # Producción
│   │   └── environment.development.ts       # Desarrollo (ng serve)
│   ├── index.html
│   ├── main.ts
│   └── styles.css
```

Cada módulo funcional tiene su propio `*.module.ts`, `*-routing.module.ts`, componente, plantilla y estilos.

## Rutas Configuradas

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/` | — | Redirige a `/peliculas` |
| `/peliculas` | `PeliculasModule` | CRUD películas |
| `/funciones` | `FuncionesModule` | CRUD funciones |
| `/compras` | `ComprasModule` | Registro y listado compras |
| `/taquilla` | `TaquillaModule` | Reporte de ventas |
| `**` | — | Redirige a `/peliculas` |

## Requisitos Previos

1. **Node.js 24.x** (probado con 24.15.0) y npm.
2. **Angular CLI 21** — se usa vía `npx` (no requiere instalación global).
3. **Backend Spring Boot** (`taquilla-cine-api`) ejecutándose en puerto `8080`.

> El frontend **no** se conecta a PostgreSQL; solo consume la API REST.

## Instalación

```powershell
cd taquilla-cine-web
npm install
```
> `package-lock.json` se conserva para instalaciones reproducibles.

## Configuración de la API

La URL base se define en los archivos de entorno:

```ts
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://[::1]:8080/api',
};
```

`environment.ts` (producción) usa el mismo valor. Los servicios construyen sus rutas a partir de `environment.apiUrl`.

## Comandos de Desarrollo

```powershell
npm start          # Inicia en modo desarrollo (http://localhost:4200)
npx ng serve       # Equivalente usando CLI local
```

## Compilación

```powershell
npm run build
```
Resultado en `dist/taquilla-cine-web/browser`. La compilación de producción usa `environment.ts`.

## Pruebas

```powershell
# Modo interactivo (watch)
npm test

# Ejecución única (CI)
npm run test:ci
```

**Runner:** Vitest + jsdom (incluido en Angular 21). Sin frameworks de prueba adicionales.

### Resumen de Pruebas (96/96 ✅)

| Componente | Pruebas | Cobertura |
|------------|---------|-----------|
| `AppComponent` | Contenedor, navegación | 4 enlaces |
| `PeliculasComponent` | Listado, CRUD, validaciones, 409 | 25 |
| `PeliculaFormComponent` | Creación/edición, validaciones, límites, botones | 18 |
| `FuncionesComponent` | Listado, CRUD, cupos, 409, duplicados | 28 |
| `FuncionFormComponent` | Creación/edición, validaciones, límites, cupos en edición | 22 |
| `ComprasComponent` | Carga, formulario, validaciones, registro, cupos, duplicados | 24 |
| `TaquillaComponent` | Filtros, indicadores, detalle, validaciones, botón Hoy, errores | 19 |

**Total: 96 pruebas (7 archivos), 0 fallidas.**

### Resumen de Compilación
- **Initial total:** 284.35 kB raw / 76.44 kB gzip
- **Lazy chunks:** funciones (27.95 kB), peliculas (20.24 kB), compras (18.05 kB), taquilla (11.99 kB)

## Limitaciones Funcionales

- No hay autenticación ni gestión de sesiones.
- No hay paginación, filtros ni ordenamiento configurable en listados.
- No hay devoluciones, modificaciones ni eliminación de compras.
- No hay exportación de reportes (Excel/PDF).
- Precios formateados en frontend (`Intl.NumberFormat('es-CO', {style:'currency', currency:'COP'})`); cálculos oficiales en backend.

## Repositorios Relacionados

- **Base de Datos (PostgreSQL)**: https://github.com/yeydersha/taquilla-cine-db
- **API REST (Spring Boot)**: https://github.com/yeydersha/taquilla-cine-api

## Licencia

Proyecto académico — Taquilla de Cine.