# Pruebas de Integración Manual — Taquilla de Cine

Documento de referencia para la validación manual del sistema completo (frontend Angular + backend Spring Boot + PostgreSQL Neon).

## 1. Requisitos Previos

- Node.js 24.x y npm.
- Java 21.
- PostgreSQL 17 (local `taquilla_cine_test` para pruebas automatizadas).
- Angular CLI 21 (vía `npx`).
- Cuenta Neon con base `taquilla_cine` y archivo `application-local.properties` configurado.

## 2. Inicio de los Servicios

### 2.1 PostgreSQL Local (solo para `mvn test`)

```powershell
Start-Service postgresql*
```

### 2.2 Backend (Neon — funcionamiento habitual)

```powershell
cd taquilla-cine-api
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local" "-Dspring-boot.run.arguments=--spring.config.additional-location=file:./application-local.properties"
```

Verificar: `curl http://localhost:8080/actuator/health` → `{"status":"UP"}`.

### 2.3 Frontend

```powershell
cd taquilla-cine-web
npm start
```

Abrir: `http://localhost:4200` (redirige a `/peliculas`).

---

## 3. Pruebas Automatizadas

| Componente | Comando | Resultado |
|------------|---------|-----------|
| Base de Datos (64 pruebas iniciales) | Integradas en backend | 64/64 ✅ |
| Backend (`mvn test`) | Requiere BD local `taquilla_cine_test` | 142/142 ✅ |
| Frontend (`npm run test:ci`) | Vitest + jsdom | 96/96 ✅ |
| Build Frontend | `npm run build` | SUCCESS (284 kB / 76 kB gzip) |

---

## 4. Pruebas Manuales — Integración Local (PostgreSQL Local)

Ejecutadas contra `taquilla_cine_test` antes de conectar a Neon.

| # | Categoría | Prueba | Estado |
|---|---|---|---|
| 1 | Películas | Crear película | ✅ |
| 2 | Películas | Consultar y editar película | ✅ |
| 3 | Funciones | Crear función | ✅ |
| 4 | Compras | Registrar compra 1 (3 boletos, $45.000) | ✅ |
| 5 | Compras | Registrar compra 2 (2 boletos, $30.000) | ✅ |
| 6 | Compras | Rechazo por cupos insuficientes (96 boletos > 95 disponibles) | ✅ |
| 7 | Taquilla | Consultar ventas del día (2 compras, 5 boletos, $75.000) | ✅ |
| 8 | Taquilla | Validación rango invertido y campo obligatorio | ✅ |
| 9 | Taquilla | Botón "Hoy" | ✅ |
| 10 | Taquilla | Rango sin ventas (indicadores en 0) | ✅ |
| 11 | Taquilla | Error de conexión (backend detenido) | ✅ |
| 12 | Integridad | Eliminación bloqueada (función con compras) | ✅ |
| 13 | Integridad | Eliminación bloqueada (película con funciones) | ✅ |
| 14 | Persistencia | Recarga F5 y navegación entre módulos | ✅ |
| **Total** | | **14/14** | **✅** |

### Resumen por categoría (Integración Local)

| Categoría | Pruebas | Estado |
|-----------|---------|--------|
| Películas | 4/4 | ✅ |
| Funciones | 4/4 | ✅ |
| Compras | 7/7 | ✅ |
| Taquilla y reportes | 8/8 | ✅ |
| Integridad y persistencia | 3/3 | ✅ |
| **Total** | **26/26** | **✅** |

---

## 5. Pruebas Manuales — Integración Remota (Neon)

Ejecutadas contra `taquilla_cine` en Neon tras conectar el backend con `application-local.properties`.

### 5.1 Corrección del Selector de Compras (Reactive Forms)

| # | Prueba | Estado |
|---|---|---|
| 1 | Seleccionar función existente → precio y cupos se muestran | ✅ |
| 2 | Ingresar cliente y boletos → total estimado se calcula | ✅ |
| 3 | Clic "Registrar compra" → POST /api/compras ejecutado | ✅ |
| 4 | Mensaje de éxito con total oficial | ✅ |
| 5 | Formulario se limpia tras éxito | ✅ |
| 6 | Listado de compras actualizado | ✅ |
| 7 | Cupos disponibles se descuentan | ✅ |
| 8 | Segunda compra en misma función → cupos se descuentan | ✅ |
| 9 | Tercera compra en otra función → cupos independientes | ✅ |
| 10 | Intento de compra > cupos → rechazado (409), sin cambios | ✅ |
| 11 | Compra válida tras rechazo → funciona | ✅ |
| 12 | Navegar entre módulos → datos persistentes | ✅ |
| 13 | Recargar F5 → datos se mantienen | ✅ |
| 14 | Reiniciar backend → datos persisten en Neon | ✅ |
| **Total** | **14/14** | **✅** |

### 5.2 Validación Remota Final

| # | Prueba | Estado |
|---|---|---|
| 1 | Arranque con `iniciar.bat` (backend Neon + frontend) | ✅ |
| 2 | Health check backend → `{"status":"UP"}` | ✅ |
| 3 | CORS `http://localhost:4200` permitido | ✅ |
| 4 | CRUD Películas completo (4 operaciones) | ✅ |
| 5 | CRUD Funciones completo (4 operaciones) | ✅ |
| 6 | Registro de compras múltiples (3 compras) | ✅ |
| 7 | Cupos descuentan correctamente en cada compra | ✅ |
| 8 | Rechazo por cupos insuficientes sin cambios en BD | ✅ |
| 9 | Reporte Taquilla: indicadores y detalle correctos | ✅ |
| 10 | Filtros de fecha (hoy, rango, invertido, vacío) | ✅ |
| 11 | Botón "Hoy" restablece filtros | ✅ |
| 12 | Error de conexión amigable al detener backend | ✅ |
| 13 | Eliminación bloqueada por integridad referencial | ✅ |
| 14 | Persistencia tras recarga y navegación | ✅ |
| 15 | Reinicio completo (backend + frontend) → datos intactos | ✅ |
| 16 | Verificación `iniciar.bat` funcional | ✅ |
| **Total** | **16/16** | **✅** |

---

## 6. Resumen Acumulado de Pruebas y Comprobaciones

| Categoría | Automatizadas | Manuales | Total | Estado |
|-----------|---------------|----------|-------|--------|
| **Base de Datos (64 pruebas iniciales)** | 64 | — | 64 | ✅ |
| **Backend (142 pruebas)** | 142 | — | 142 | ✅ |
| **Frontend (96 pruebas)** | 96 | — | 96 | ✅ |
| **Integración Local (manual)** | — | 26 | 26 | ✅ |
| **Integración Neon (manual)** | — | 30 | 30 | ✅ |
| **TOTAL** | **302** | **56** | **358** | **✅** |

> **Nota:** Las 358 pruebas y comprobaciones reportadas distinguen su naturaleza y alcance:
> - **302 automatizadas** (64 BD + 142 backend + 96 frontend).
> - **56 manuales** (26 integración local + 30 integración Neon).
> No todas son "pruebas automatizadas independientes"; la mayoría son comprobaciones manuales de usuario final.

---

## 7. Limpieza Selectiva (Pendiente de Autorización)

```sql
-- Orden por dependencias (FK)
DELETE FROM compras WHERE id IN (<ids-compras-prueba>);
DELETE FROM funciones WHERE id IN (<ids-funciones-prueba>);
DELETE FROM peliculas WHERE id IN (<ids-peliculas-prueba>);
```

Verificar:
```sql
SELECT count(*) FROM compras;
SELECT count(*) FROM funciones;
SELECT count(*) FROM peliculas;
```

---

## 8. Repositorios

- **Base de Datos**: https://github.com/yeydersha/taquilla-cine-db
- **API REST (Spring Boot)**: https://github.com/yeydersha/taquilla-cine-api
- **Frontend (Angular 21)**: https://github.com/yeydersha/taquilla-cine-web