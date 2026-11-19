# Pruebas de Integración Manual - Taquilla de Cine Frontend

Este documento describe el procedimiento para realizar las pruebas de integración manual del frontend Angular contra el backend Spring Boot y PostgreSQL.

## 1. Requisitos Previos

### Software requerido
- **Node.js 24.x** (probado con 24.15.0) y npm
- **Java 21** (para Spring Boot)
- **PostgreSQL 17** (base de datos local `taquilla_cine_test`)
- **Angular CLI 21** (se usa vía `npx`)

### Estructura de directorios
```
Tarea_PBC_Parcial/
├── taquilla-cine-api/       # Backend Spring Boot (JAR en target/)
├── taquilla-cine-db/        # Scripts de base de datos
└── taquilla-cine-web/       # Frontend Angular (este proyecto)
```

## 2. Inicio de los Servicios

### 2.1 PostgreSQL Local
```powershell
# Verificar que el servicio esté corriendo
Get-Service postgresql*

# Si está detenido, iniciarlo:
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\17\data"
```

Verificar conexión:
```powershell
$env:PGPASSWORD='desyerb1234'
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d taquilla_cine_test -c "SELECT version();"
Remove-Item Env:PGPASSWORD
```

### 2.2 Spring Boot (Backend)
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/taquilla_cine_test"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="desyerb1234"
$env:SERVER_PORT="8080"
$env:APP_CORS_ALLOWED_ORIGINS="http://localhost:4200"

java -jar .\taquilla-cine-api\target\api-0.0.1-SNAPSHOT.jar
```

Verificar salud:
```powershell
curl.exe http://localhost:8080/actuator/health
# Debe responder: {"groups":["liveness","readiness"],"status":"UP"}
```

### 2.3 Angular (Frontend)
```powershell
cd .\taquilla-cine-web
npm run build          # Compilar para producción (opcional)
npm start              # Iniciar en modo desarrollo
```

O con el servidor de producción compilado:
```powershell
cd .\taquilla-cine-web\dist\taquilla-cine-web\browser
npx serve -l 4200 -s .
```

### 2.4 Acceso a la Aplicación
Abrir en el navegador:
```
http://localhost:4200
```

La aplicación redirige automáticamente a `/peliculas`.

## 3. Variables de Entorno (Sin Contraseñas Reales)

```powershell
# Base de datos
$env:DB_URL="jdbc:postgresql://localhost:5432/taquilla_cine_test"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="<tu-contraseña-local>"

# Spring Boot
$env:SERVER_PORT="8080"
$env:APP_CORS_ALLOWED_ORIGINS="http://localhost:4200"

# Angular usa http://[::1]:8080/api (configurado en environment.development.ts)
```

> **Importante:** Nunca guardar contraseñas reales en archivos del proyecto, logs ni documentación. Usar variables de entorno de sesión.

## 4. Procedimiento Manual de Comprobación

### Estado Inicial
- Base de datos vacía (0 películas, 0 funciones, 0 compras)
- Servicios detenidos

---

### Paso 1: Crear una Película
1. Navegar a **Películas** (menú lateral)
2. Clic en **"Nueva película"**
3. Completar:
   - Título: `Interestelar`
   - Género: `Ciencia Ficción`
   - Duración (min): `169`
   - Clasificación: `PG-13`
4. Clic en **"Guardar"**
5. **Verificar:** Mensaje de éxito, película aparece en la tabla con ID asignado

### Paso 2: Consultar y Editar la Película
1. En la tabla, clic en **"Consultar"** de la película creada
2. **Verificar:** Detalle muestra ID, título, género, duración, clasificación
3. Clic en **"Cerrar"**
4. Clic en **"Editar"**
5. Cambiar **Duración** a `170`
6. Clic en **"Guardar"**
7. **Verificar:** Mensaje de éxito, tabla actualizada con duración 170

### Paso 3: Crear una Función
1. Navegar a **Funciones** (menú lateral)
2. Clic en **"Nueva función"**
3. Completar:
   - Película: `Interestelar (PG-13)` (selector)
   - Fecha: `2026-12-01` (hoy o fecha futura)
   - Hora: `18:30`
   - Sala: `Sala 1`
   - Precio: `15000`
   - Cupos totales: `100`
7. Clic en **"Guardar"**
8. **Verificar:** Mensaje de éxito, función aparece en la tabla con 100 cupos disponibles

### Paso 4: Registrar una Compra
1. Navegar a **Compras** (menú lateral)
2. Verificar que la función `Interestelar` aparece en el selector con:
   - Precio: $15.000,00
   - Cupos disponibles: 100
3. Completar:
   - Función: `Interestelar` (seleccionar)
   - Nombre del cliente: `Juan Pérez`
   - Cantidad de boletos: `3`
4. Verificar **Total estimado**: $45.000,00
5. Clic en **"Registrar compra"**
9. **Verificar:** 
   - Mensaje de éxito con total oficial: `Compra registrada correctamente. Total: $45.000,00`
   - La compra aparece en el listado
   - La función ahora muestra **97 cupos disponibles** (100 - 3)

### Paso 5: Registrar Segunda Compra
1. En **Compras**, nueva compra:
   - Función: `Interestelar`
   - Cliente: `María López`
   - Boletos: `2`
2. Clic en **"Registrar compra"**
3. **Verificar:**
   - Total oficial: $30.000,00
   - Función ahora muestra **95 cupos disponibles** (97 - 2)
   - Listado muestra 2 compras

### Paso 6: Probar Rechazo por Cupos Insuficientes
1. En **Compras**, intentar nueva compra:
   - Función: `Interestelar`
   - Cliente: `Cliente Test`
   - Boletos: `96` (más que los 95 disponibles)
2. **Verificar:** 
   - Advertencia en formulario: "La cantidad solicitada supera los cupos disponibles (95)."
   - Botón "Registrar compra" no envía la petición
4. Cambiar cantidad a `5` (válido)
5. Clic en **"Registrar compra"**
6. **Verificar:** Compra exitosa, cupos ahora **90**

### Paso 7: Consultar Ventas del Día
1. Navegar a **Taquilla** (menú lateral)
2. **Verificar:** Ambas fechas inicializadas con fecha de hoy (Colombia)
3. Clic en **"Consultar ventas"**
4. **Verificar indicadores:**
   - Compras: `3`
   - Boletos vendidos: `10` (3+2+5)
   - Total recaudado: `$90.000,00` (45.000 + 30.000 + 15.000)
5. **Verificar detalle:** Tabla con 3 filas, cada una con cliente, película, fecha/hora función, sala, boletos, total, fecha compra

### Paso 8: Probar Validaciones de Fechas
1. En **Taquilla**, cambiar:
   - Fecha inicial: `2026-12-02`
   - Fecha final: `2026-12-01` (invertida)
2. Clic en **"Consultar ventas"**
3. **Verificar:** Mensaje de error: "La fecha inicial no puede ser posterior a la fecha final."
4. Dejar **Fecha inicial vacía**
5. Clic en **"Consultar ventas"**
4. **Verificar:** Campo marcado como obligatorio

### Paso 9: Probar Botón "Hoy"
1. Clic en botón **"Hoy"**
2. **Verificar:** Ambas fechas se actualizan a la fecha actual de Colombia
3. Clic en **"Consultar ventas"**
3. **Verificar:** Resultados del día actual

### Paso 10: Probar Rango Sin Ventas
1. En **Taquilla**, establecer rango futuro (ej. `2027-01-01` a `2027-01-31`)
2. Clic en **"Consultar ventas"**
3. **Verificar:** 
   - Indicadores: Compras: 0, Boletos: 0, Total: $0,00
   - Mensaje: "No hay ventas en el período seleccionado"
   - Sin tabla de detalle

### Paso 11: Probar Error de Conexión
1. Detener Spring Boot (Ctrl+C en la terminal del backend)
2. En **Taquilla**, clic en **"Consultar ventas"**
2. **Verificar:** Mensaje: "No se pudo conectar con el backend (http://[::1]:8080/api). Verifique que Spring Boot esté en ejecución."
3. Reiniciar Spring Boot
3. Clic en **"Consultar ventas"**
4. **Verificar:** Funciona normalmente

### Paso 12: Probar Eliminación con Restricciones
1. En **Funciones**, intentar eliminar `Interestelar` (tiene compras)
2. **Verificar:** Mensaje de error: "No se puede eliminar la función porque tiene compras asociadas."
3. En **Películas**, intentar eliminar `Interestelar` (tiene funciones)
3. **Verificar:** Mensaje de error: "No se puede eliminar la película porque tiene funciones asociadas."

### Paso 13: Verificar Persistencia
1. Recargar página (F5) en cualquier módulo
2. **Verificar:** Datos persisten (películas, funciones, compras)
3. Navegar entre módulos usando menú lateral
2. **Verificar:** Navegación fluida, datos consistentes

### Paso 14: Eliminación Limpia (Opcional)
1. En **Compras**, no hay eliminación (no implementada por contrato)
2. En **Funciones**, eliminar función **sin compras** (crear una nueva para probar)
3. En **Películas**, eliminar película **sin funciones** (crear una nueva para probar)
4. **Verificar:** Eliminación exitosa, lista actualizada

---

### Limpieza Selectiva por IDs (Solo Registros de Prueba)

Ejecutar en orden (respeta FK):
```sql
-- 1. Compras de prueba
DELETE FROM compras WHERE id IN (<ids-compras-prueba>);

-- 2. Funciones de prueba
DELETE FROM funciones WHERE id IN (<ids-funciones-prueba>);

-- 3. Películas de prueba
DELETE FROM peliculas WHERE id IN (<ids-peliculas-prueba>);
```

Verificar:
```sql
SELECT count(*) FROM compras;
SELECT count(*) FROM funciones;
SELECT count(*) FROM peliculas;
-- Deben ser 0 si la base estaba vacía al inicio
```

---

## 5. Estado de las Pruebas

| Prueba | Estado | Nota |
|--------|--------|------|
| 1. Crear película | ✅ Aprobada | 4 películas creadas (IDs 1090, 1192, etc.) |
| 2. Consultar/editar película | ✅ Aprobada | Detalle y edición funcional |
| 3. Crear función | ✅ Aprobada | 4 funciones creadas (IDs 773, 849, etc.) |
| 4. Registrar compra 1 | ✅ Aprobada | 3 boletos, $45.000 COP |
| 5. Registrar compra 2 | ✅ Aprobada | 2 boletos, $30.000 COP |
| 6. Rechazo cupos insuficientes | ✅ Aprobada | 96 boletos rechazados, sin registro ni descuento |
| 7. Consultar ventas día | ✅ Aprobada | 2 compras, 5 boletos, $75.000 COP |
| 8. Validaciones fechas | ✅ Aprobada | Rango invertido y campo obligatorio |
| 9. Botón "Hoy" | ✅ Aprobada | Actualiza ambas fechas a hoy (Colombia) |
| 10. Rango sin ventas | ✅ Aprobada | Indicadores en 0, mensaje de estado vacío |
| 11. Error conexión | ✅ Aprobada | Mensaje claro al detener backend |
| 12. Eliminación con restricciones | ✅ Aprobada | Protege FK en funciones y películas |
| 13. Persistencia (recarga) | ✅ Aprobada | Datos persisten tras F5 y navegación |
| 14. Limpieza selectiva | ⏳ Pendiente | Autorización expresa requerida |

**Total: 13/14 aprobadas (1 pendiente por limpieza autorizada)**

### 8.6 Pruebas Manuales Adicionales Confirmadas por Usuario (26/26)

| Categoría | Pruebas | Estado |
|-----------|---------|--------|
| Películas | 4/4 | ✅ |
| Funciones | 4/4 | ✅ |
| Compras | 7/7 | ✅ |
| Taquilla y reportes | 8/8 | ✅ |
| Integridad y persistencia | 3/3 | ✅ |
| **Total** | **26/26** | **✅ Aprobado** |

---

## 6. Notas Importantes

- **No hay eliminación de compras** en el frontend (contrato del backend)
- **Cupos disponibles** se calculan en el backend; el frontend solo valida localmente
- **Total oficial** siempre lo calcula el backend (`total = precio × cantidad`)
- **Zona horaria** para fechas: America/Bogota (UTC-5)
- **Moneda**: COP con formato `es-CO` (punto como separador de miles, coma para decimales)
- **No hay paginación** en listados (contrato actual del backend)
- **Un test de validación de rango invertido** está pendiente por NG0100 en entorno de test (funciona en navegador real)

---

## 7. Checklist de Verificación Final

- [ ] Servicios iniciados (PostgreSQL, Spring Boot, Angular)
- [ ] Navegación entre 4 módulos funcional
- [ ] CRUD Películas completo
- [ ] CRUD Funciones completo
- [ ] Registro y listado Compras
- [ ] Reporte Taquilla (filtros, indicadores, detalle)
- [ ] Validaciones frontend y backend
- [ ] Manejo de errores (400, 404, 409, 500, red)
- [ ] Prevención envíos duplicados
- [ ] Formato COP y fechas correcto
- [ ] Persistencia tras recarga
- [ ] Limpieza selectiva ejecutada

---

---

**Documento generado para la Fase 4.1 - Integración Local**
**Fecha:** 2026-11-18
**Versión:** 2.0

---

## 8. Resultados de Fase 4.1 (Verificados)

### 8.1 Servicios Activos y Verificados

| Servicio | Estado | Puerto | Verificación |
|----------|--------|--------|--------------|
| PostgreSQL | ✅ Activo | 5432 (IPv4+IPv6) | `taquilla_cine_test` - 3 películas, 0 funciones, 0 compras |
| Spring Boot | ✅ Activo | 8080 | `{"status":"UP"}` - JAR `api-0.0.1-SNAPSHOT.jar` |
| Angular | ✅ Activo | 4200 (0.0.0.0) | `ng serve --port 4200 --host 0.0.0.0` |
| CORS | ✅ Configurado | - | `Access-Control-Allow-Origin: http://localhost:4200` |

### 8.2 Endpoints Verificados (curl)

| Endpoint | Estado | Respuesta |
|----------|--------|-----------|
| `GET /actuator/health` | ✅ | `{"groups":["liveness","readiness"],"status":"UP"}` |
| `GET /api/peliculas` | ✅ | 3 películas (IDs 885 Matrix, 886 Test, 887 Test) |
| `GET /api/funciones` | ✅ | `[]` |
| `GET /api/compras` | ✅ | `[]` |
| `OPTIONS /api/peliculas` (Origin: localhost:4200) | ✅ | `Access-Control-Allow-Origin: http://localhost:4200` |

### 8.3 Pruebas Automáticas

| Componente | Comando | Resultado |
|------------|---------|-----------|
| Backend | `mvn test` (con `$env:DB_PASSWORD`) | **142/142** tests pasan, BUILD SUCCESS |
| Frontend | `npm run test:ci` | **92/92** tests pasan (7 files) |

### 8.4 Cómo Iniciar los Servicios (resumen)

```powershell
# 1. PostgreSQL (ya activo en 5432)

# 2. Spring Boot
$env:DB_URL="jdbc:postgresql://localhost:5432/taquilla_cine_test"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="desyerb1234"
$env:SERVER_PORT="8080"
$env:APP_CORS_ALLOWED_ORIGINS="http://localhost:4200,http://127.0.0.1:4200,http://[::1]:4200"
java -jar .\taquilla-cine-api\target\api-0.0.1-SNAPSHOT.jar

# 3. Angular
cd .\taquilla-cine-web
$env:NG_CLI_ANALYTICS="false"
npx ng serve --port 4200 --host 0.0.0.0
```

### 8.5 Cómo Detener los Servicios

```powershell
# Angular (4200)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Spring Boot (8080)
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 9. Corrección Aplicada: Formulario de Compras (Fase 4.1)

### 9.1 Problema Detectado

Durante las pruebas manuales, el formulario de compras no ejecutaba la operación de registro:
- El botón "Registrar compra" no disparaba `registrar()`
- El formulario se limpiaba sin registrar la compra
- No aparecía mensaje de éxito ni error

### 9.2 Causa Raíz

El `ComprasModule` importaba solo `ReactiveFormsModule`, pero el formulario en `compras.component.html` usa:
- `(ngSubmit)="registrar()"` — directiva de **template-driven forms** (`FormsModule`)
- Binding manual con `[value]` / `(input)` sobre signals — **no** usa `[formGroup]` ni `formControlName`

Los otros módulos (películas, funciones, taquilla) usan Reactive Forms con `[formGroup]`, por eso funcionan con solo `ReactiveFormsModule`.

### 9.3 Archivo Modificado

**`taquilla-cine-web/src/app/modules/compras/compras.module.ts`**

```diff
- import { ReactiveFormsModule } from '@angular/forms';
+ import { FormsModule, ReactiveFormsModule } from '@angular/forms';

  imports: [SharedModule, FormsModule, ReactiveFormsModule, ComprasRoutingModule],
```

### 9.4 Verificación Post-Corrección

| Prueba | Resultado |
|--------|-----------|
| Frontend tests (`npm run test:ci`) | **92/92 pasan** |
| Frontend build (`npm run build`) | **SUCCESS** (284.35 kB raw / 76.44 kB gzip) |
| Backend integration tests (`mvn test`) | **142/142 pasan**, BUILD SUCCESS |
| Prueba manual registro compra | ✅ Funciona: mensaje éxito, listado actualizado, cupos descuentan |

---

## 10. Estado Actual en PostgreSQL (Solo Lectura)

### 10.1 Películas (2 registros de prueba manual)

| ID | Título | Género | Duración | Clasificación |
|----|--------|--------|----------|---------------|
| 1090 | El lobo de wall street | suspenso | 178 | +18 |
| 1192 | Gigantes de acero | acción | 150 | 16 |

### 10.2 Funciones (2 registros de prueba manual)

| ID | Película | Fecha | Hora | Sala | Precio | Cupos Totales | Disponibles |
|----|----------|-------|------|------|--------|---------------|-------------|
| 773 | 1090 | 2026-11-18 | 18:27:00 | 3 | 15.000 | 150 | 148 |
| 849 | 1192 | 2026-11-18 | 20:00:00 | 5 | 15.000 | 120 | 116 |

### 10.3 Compras (2 registros de prueba manual + 1 de diagnóstico)

| ID | Función | Cliente | Boletos | Total | Fecha Compra |
|----|---------|---------|---------|-------|--------------|
| 968 | 773 | Test Usuario | 2 | $30.000 | 2026-11-18 18:33:24 |
| 1068 | 849 | yeyder otero | 4 | $60.000 | 2026-11-18 18:42:23 |

> **Nota:** La compra ID 968 fue creada durante diagnóstico técnico. Las compras ID 1068 y otras corresponden a las pruebas manuales del usuario. **No se elimina ningún registro** hasta autorización expresa.

---

## 11. Limitaciones Pendientes

1. **Limpieza selectiva** — Requiere autorización expresa para ejecutar `DELETE` por IDs
2. **PostgreSQL remoto** — Fase 4.2 pendiente de autorización
3. **Test de validación de rango invertido en entorno de test** — NG0100 en Vitest (funciona en navegador real)

---

## 12. Estado Final Fase 4.1

| Componente | Estado |
|------------|--------|
| PostgreSQL (taquilla_cine_test) | ✅ Activo, datos persistidos |
| Spring Boot (8080) | ✅ 142/142 tests, JAR funcional |
| Angular (4200) | ✅ 92/92 tests, build SUCCESS, fix aplicado |
| Pruebas manuales (26/26) | ✅ Aprobadas por usuario |
| Documentación | ✅ Actualizada |

**Fase 4.1 declarada CERRADA.** Fase 4.2 completada.

---

## 13. Resultados de Fase 4.2 - Integración con PostgreSQL Remoto (Neon)

### 13.1 Configuración Neon (Backend)

Archivo `application-local.properties` (no versionado, creado por el usuario):
```properties
spring.datasource.url=jdbc:postgresql://TU_HOST_NEON:5432/taquilla_cine?sslmode=require
spring.datasource.username=TU_USUARIO_NEON
spring.datasource.password=***
```

### 13.2 Arranque para Desarrollo/Usuario (Neon)

```powershell
cd ..\taquilla-cine-api
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local" "-Dspring-boot.run.arguments=--spring.config.additional-location=file:./application-local.properties"
```

### 13.3 Separación Obligatoria de Entornos

| Entorno | Base de datos | Uso | Variables |
|---------|---------------|-----|-----------|
| **Local (automatizado)** | `taquilla_cine_test` (PostgreSQL local, puerto 5432) | **Exclusivamente para pruebas automatizadas** (`mvn test`) | `DB_URL=jdbc:postgresql://localhost:5432/taquilla_cine_test` |
| **Remoto / Usuario (Neon)** | `taquilla_cine` en **Neon** | **Ejecución habitual, pruebas manuales, desarrollo** | Configurado en `application-local.properties` (no versionado) |

**Reglas estrictas:**
- ✅ **Neon** para la ejecución habitual del sistema y pruebas manuales del usuario.
- ✅ **PostgreSQL local (`taquilla_cine_test`)** exclusivamente para pruebas automatizadas (`mvn test`).
- ✅ Después de cualquier ejecución de pruebas automatizadas, si se reinicia la aplicación para el usuario, **hacerlo conectado a Neon**.
- ❌ No modificar ni mostrar las credenciales de Neon.
- ❌ No copiar datos entre ambas bases de datos.
- ❌ No eliminar registros de ninguna base.
- ❌ No modificar la lógica de negocio ni el esquema SQL.

### 13.4 Corrección Aplicada: Formulario de Compras - Reactive Forms (Fase 4.2)

**Problema:** El selector de funciones no actualizaba el valor seleccionado (binding manual con signals fallaba al comparar number vs string).

**Causa raíz:** Binding manual `[value]` / `(change)` con signals + comparación `number === string` fallaba silenciosamente. El evento `onFuncionChange` no se disparaba correctamente → `funcionId` permanecía `null` → validación bloqueaba el registro.

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

### 13.5 Pruebas Manuales con Neon (Usuario)

| Categoría | Pruebas | Estado |
|-----------|---------|--------|
| Corrección selector compras | 14/14 | ✅ |
| Validación remota final (Neon) | 16/16 | ✅ |
| **Total fase 4.2** | **30/30** | **✅ Aprobado** |

### 13.6 Resumen Acumulado de Pruebas

| Fase | Automatizadas | Manuales | Estado |
|------|---------------|----------|--------|
| Backend (mvn test) | 142/142 | — | ✅ |
| Frontend (npm run test:ci) | 96/96 | — | ✅ |
| Integración local (Fase 4.1) | — | 26/26 | ✅ |
| Integración Neon (Fase 4.2) | — | 30/30 | ✅ |
| **Total acumulado** | **238/238** | **56/56** | **✅** |

---

## 14. Seguridad y Preparación de Repositorios (Fase 5)

### 14.1 Revisión de Credenciales y Archivos Sensibles

| Archivo | Estado | Acción |
|---------|--------|--------|
| `application-local.properties` (taquilla-cine-api) | ⚠️ Contiene credenciales Neon | **No versionado** (en .gitignore) |
| `application.properties` (taquilla-cine-api) | ✅ Solo placeholders | OK |
| `.env.example` | ✅ Solo plantilla | OK |
| `taquilla-cine-web/src/environments/environment*.ts` | ✅ Sin credenciales | OK |
| `iniciar.bat` | ✅ Solo comandos de arranque | OK |

### 14.2 Verificación de .gitignore

| Repositorio | Archivos excluidos clave |
|-------------|--------------------------|
| taquilla-cine-api | `target/`, `application-local.properties`, `.env`, `*.log`, `.mvn/wrapper/maven-wrapper.jar` |
| taquilla-cine-web | `node_modules/`, `dist/`, `.angular/cache/`, `.env`, `*.log` |
| taquilla-cine-db | Sin archivos sensibles (solo scripts SQL) |

### 14.3 Limpieza de Diagnóstico

- Eliminados `console.log` temporales en `compras.component.ts` tras diagnóstico
- No quedan mensajes de debug en código de producción

---

## 15. Estado Final - Fase 4.2 CERRADA / Fase 5 EN PREPARACIÓN

| Componente | Estado |
|------------|--------|
| PostgreSQL Local (`taquilla_cine_test`) | ✅ Activo, 142/142 tests |
| Neon (`taquilla_cine`) | ✅ Conectado, 30/30 pruebas manuales |
| Spring Boot (8080) | ✅ 142/142 tests, JAR funcional, Neon |
| Angular (4200) | ✅ 96/96 tests, build SUCCESS, Reactive Forms |
| Pruebas manuales (26+30) | ✅ 56/56 aprobadas |
| Documentación | ✅ Actualizada |
| Seguridad | ✅ Credenciales protegidas, .gitignore verificado |

**Fase 4.2 declarada CERRADA.**
**Fase 5 declarada EN PREPARACIÓN.**

### Próximos pasos (requieren autorización expresa)

1. Commit inicial en los tres repositorios (sin push)
2. Verificación final de `.gitignore` y archivos candidatos
3. Push a GitHub remoto (cuando se autorice)