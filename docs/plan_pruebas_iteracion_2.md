# 📋 Plan de Pruebas — Autos Colombia (Iteración 2 y Regresión)

**Proyecto:** Autos Colombia — Gestión de Parqueadero  
**Versión:** 2.0  
**Fecha:** Noviembre 2026  
**Responsable:** Equipo de QA / Automatización  

---

## 1. Resumen Ejecutivo de Ejecución

| Módulo / Categoría | Total Casos | Aprobados (Pass) | Fallidos (Fail) | Pendientes |
|--------------------|:-----------:|:----------------:|:---------------:|:----------:|
| **Gestión de Usuarios (HU07 - HU10)** | 11 | 11 | 0 | 0 |
| **Gestión de Celdas (HU11 - HU14)** | 13 | 13 | 0 | 0 |
| **Regresión Iteración 1 (HU01 - HU06)** | 10 | 10 | 0 | 0 |
| **TOTAL** | **34** | **34** | **0** | **0** |

---

## 2. Detalle de Casos de Prueba

### Módulo: Gestión de Usuarios

| ID | Historia | Precondiciones | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|---|:---:|
| **TC-USR-01** | HU07 | Sesión con rol ADMINISTRADOR activa | 1. Consultar `GET /api/usuarios`<br>2. Evaluar arreglo recibido | Retorna lista de usuarios con atributos de Iteración 2 | 200 OK con nómina completa de usuarios | ✅ Aprobado |
| **TC-USR-02** | HU07 | Usuarios registrados en el sistema | 1. Filtrar por `rol=ADMINISTRADOR`<br>2. Filtrar por `busqueda=Carlos` | Filtra exactamente usuarios coincidentes | Coincidencias exactas obtenidas | ✅ Aprobado |
| **TC-USR-03** | HU08 | Sesión ADMINISTRADOR | 1. Enviar `POST /api/usuarios` con datos válidos y únicos | HTTP 201 y usuario creado en estado ACTIVO | 201 Created con entidad poblada | ✅ Aprobado |
| **TC-USR-04** | HU08 | Usuario existente con documento X | 1. Enviar `POST /api/usuarios` con documento X duplicado | HTTP 409 Conflict indicando documento duplicado | 409 Conflict con mensaje descriptivo | ✅ Aprobado |
| **TC-USR-05** | HU08 | Usuario existente con correo Y | 1. Enviar `POST /api/usuarios` con correo Y duplicado | HTTP 409 Conflict indicando correo duplicado | 409 Conflict con mensaje descriptivo | ✅ Aprobado |
| **TC-USR-06** | HU09 | Usuario existente | 1. Enviar `PATCH /api/usuarios/:id` actualizando teléfono y rol | Información actualizada y fechaActualizacion renovada | 200 OK con campos modificados | ✅ Aprobado |
| **TC-USR-07** | HU10 | Usuario activo de prueba | 1. Enviar `PATCH /api/usuarios/:id/estado` con `{ activo: false }`<br>2. Reactivar con `{ activo: true }` | Alterna entre INACTIVO y ACTIVO correctamente | 200 OK en ambas transiciones | ✅ Aprobado |
| **TC-USR-08** | HU10 | Usuario inactivo | 1. Intentar registrar entrada usando id de usuario inactivo como operador | Rechaza operación indicando que el usuario está inactivo | 400 ValidationError por usuario inactivo | ✅ Aprobado |
| **TC-USR-09** | HU10 | Solo 1 Administrador activo en el sistema | 1. Intentar desactivar o degradar a Operador al único Administrador | HTTP 409 impidiendo dejar el sistema sin Administrador | 409 Conflict protector activado | ✅ Aprobado |
| **TC-USR-10** | HU07 | Sesión activa de Operador | 1. Con usuario Operador, consultar `GET /api/usuarios` o `POST /api/usuarios` | HTTP 403 Forbidden | 403 Forbidden bloqueando acceso | ✅ Aprobado |
| **TC-USR-11** | HU10 | Usuario con historial de movimientos pasados | 1. Desactivar usuario y consultar movimientos pasados | El nombre y referencia del operador en movimientos se mantiene intacto | Integridad y referencias conservadas | ✅ Aprobado |

---

### Módulo: Gestión de Celdas y Mantenimiento

| ID | Historia | Precondiciones | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|---|:---:|
| **TC-CEL-01** | HU11 | Celdas pobladas en el sistema | 1. Consultar `GET /api/celdas`<br>2. Consultar `GET /api/celdas/:id` | Retorna inventario completo y detalle con ocupación | 200 OK con celdas y ocupación poblada | ✅ Aprobado |
| **TC-CEL-02** | HU11 | Inventario de celdas | 1. Filtrar por `tipo=MOTO`<br>2. Filtrar por `estado=LIBRE` | Filtra solo las celdas coincidentes | Coincidencias exactas obtenidas | ✅ Aprobado |
| **TC-CEL-03** | HU12 | Sesión ADMINISTRADOR | 1. Enviar `POST /api/celdas` con código nuevo | Celda creada con estado inicial LIBRE | 201 Created en estado LIBRE | ✅ Aprobado |
| **TC-CEL-04** | HU12 | Celda existente con código A-01 | 1. Enviar `POST /api/celdas` con código A-01 | HTTP 409 Conflict por código duplicado | 409 Conflict con mensaje de rechazo | ✅ Aprobado |
| **TC-CEL-05** | HU13 | Celda existente | 1. Enviar `PATCH /api/celdas/:id` con nueva ubicación | Ubicación modificada exitosamente | 200 OK con ubicación actualizada | ✅ Aprobado |
| **TC-CEL-06** | HU13 | Celda con estado OCUPADA | 1. Intentar modificar el tipo/compatibilidad de la celda ocupada | HTTP 409 Conflict impidiendo cambiar tipo a celda ocupada | 409 Conflict protegiendo ocupación | ✅ Aprobado |
| **TC-CEL-07** | HU14 | Celda en estado LIBRE | 1. Enviar `POST /api/celdas/:id/mantenimiento` con motivo | Celda pasa a estado MANTENIMIENTO y registra auditoría | 200 OK en estado MANTENIMIENTO | ✅ Aprobado |
| **TC-CEL-08** | HU14 | Celda en MANTENIMIENTO | 1. Enviar `POST /api/celdas/:id/habilitar` | Celda vuelve al estado LIBRE y registra auditoría | 200 OK en estado LIBRE | ✅ Aprobado |
| **TC-CEL-09** | HU14 | Celda con estado OCUPADA | 1. Intentar enviar a mantenimiento celda ocupada | HTTP 409 Conflict impidiendo poner en mantenimiento celda con vehículo | 409 Conflict bloqueando transición | ✅ Aprobado |
| **TC-CEL-10** | HU14 | Celda con estado OCUPADA | 1. Intentar llamar a endpoint de habilitar en celda ocupada | HTTP 409 Conflict impidiendo liberar celda ocupada administrativamente | 409 Conflict protegiendo salida oficial | ✅ Aprobado |
| **TC-CEL-11** | HU01 / RF25 | Vehículo CARRO y Celda MOTO | 1. Intentar registrar entrada de CARRO en celda MOTO | HTTP 400 ValidationError por incompatibilidad | 400 ValidationError rechazando ingreso | ✅ Aprobado |
| **TC-CEL-12** | HU14 / RF27 | Celda con eventos de creación y mantenimiento | 1. Consultar `GET /api/celdas/:id` y revisar `historialAuditoria` | Cronología histórica completa con fechas, usuario y motivos | Trazabilidad histórica verificada | ✅ Aprobado |
| **TC-CEL-13** | HU12-14 | Sesión activa de Operador | 1. Con usuario Operador, enviar POST/PATCH a `/api/celdas` | HTTP 403 Forbidden en todas las mutaciones | 403 Forbidden bloqueando mutaciones | ✅ Aprobado |

---

### Módulo: Regresión de Iteración 1

| ID | Historia | Precondiciones | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|---|:---:|
| **TC-REG-01** | HU01 | Vehículo activo y celda libre compatible | 1. `POST /api/movimientos/entrada` | Movimiento creado en ABIERTO y celda pasa a OCUPADA | 201 Created y celda OCUPADA | ✅ Aprobado |
| **TC-REG-02** | HU06 | Vehículo ya dentro | 1. Intentar registrar segunda entrada con la misma placa | HTTP 409 Conflict por entrada duplicada | 409 Conflict rechazando duplicado | ✅ Aprobado |
| **TC-REG-03** | HU06 | Celda ocupada o en mantenimiento | 1. Intentar asignar celda no libre en entrada | HTTP 409 Conflict indicando celda no disponible | 409 Conflict indicando no disponibilidad | ✅ Aprobado |
| **TC-REG-04** | HU03 | Movimiento con estado ABIERTO | 1. `POST /api/movimientos/:id/salida` | Movimiento pasa a CERRADO y celda queda LIBRE | 200 OK y celda LIBRE | ✅ Aprobado |
| **TC-REG-05** | HU06 | Movimiento ya CERRADO | 1. Intentar registrar salida sobre movimiento cerrado | HTTP 409 Conflict | 409 Conflict impidiendo doble salida | ✅ Aprobado |
| **TC-REG-06** | HU05 | Registro de entrada y salida con notas | 1. Registrar entrada con obs A.<br>2. Registrar salida con obs B. | Obs A y Obs B se guardan en campos independientes | Ambas observaciones preservadas | ✅ Aprobado |
| **TC-REG-07** | HU04 | Movimientos registrados | 1. Consultar `GET /api/movimientos` con filtro de placa y estado | Retorna historial ordenado por fecha descendente | Historial filtrado correctamente | ✅ Aprobado |
| **TC-REG-08** | HU02 / RF07 | Movimientos en curso | 1. Consultar `GET /api/dashboard/summary` | Indicadores de celdas y movimientos calculados | Métricas en tiempo real coherentes | ✅ Aprobado |
| **TC-REG-09** | RNF04 | Datos persistidos en JSON | 1. Detener e iniciar servidor backend.<br>2. Consultar entidades. | Los datos y estados se mantienen intactos | Persistencia JSON verificada | ✅ Aprobado |
| **TC-REG-10** | RNF05 | Permisos por rol configurado | 1. Operar como Operador y como Administrador | Diferenciación estricta de permisos comprobada | Comportamiento verificado en backend | ✅ Aprobado |
