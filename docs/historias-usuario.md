# 📖 Historias de Usuario — Autos Colombia

**Versión:** 2.0  
**Iteraciones:** 1 y 2  
**Fecha:** Noviembre 2026

---

## Resumen de Historias de Usuario

| ID | Título | Rol Principal | Iteración | Estado |
|----|--------|---------------|-----------|--------|
| **HU01** | Registrar entrada de vehículo | Operador / Administrador | Iteración 1 | ✅ Implementada |
| **HU02** | Consultar vehículos dentro del parqueadero | Operador / Administrador | Iteración 1 | ✅ Implementada |
| **HU03** | Registrar salida de vehículo | Operador / Administrador | Iteración 1 | ✅ Implementada |
| **HU04** | Consultar historial de movimientos | Operador / Administrador | Iteración 1 | ✅ Implementada |
| **HU05** | Registrar observaciones independientes | Operador / Administrador | Iteración 1 | ✅ Implementada |
| **HU06** | Validar operaciones y mostrar errores | Operador / Administrador | Iteración 1 | ✅ Implementada |
| **HU07** | Consultar y buscar usuarios | Administrador | Iteración 2 | ✅ Implementada |
| **HU08** | Registrar usuario | Administrador | Iteración 2 | ✅ Implementada |
| **HU09** | Actualizar usuario y rol | Administrador | Iteración 2 | ✅ Implementada |
| **HU10** | Activar o desactivar usuario | Administrador | Iteración 2 | ✅ Implementada |
| **HU11** | Consultar y filtrar celdas | Administrador / Operador | Iteración 2 | ✅ Implementada |
| **HU12** | Registrar celda | Administrador | Iteración 2 | ✅ Implementada |
| **HU13** | Actualizar información de celda | Administrador | Iteración 2 | ✅ Implementada |
| **HU14** | Gestionar mantenimiento de celdas | Administrador | Iteración 2 | ✅ Implementada |

---

## Iteración 1 — Gestión de Entradas, Salidas y Movimientos

### HU01: Registrar entrada de vehículo
**Como** operador del parqueadero,  
**quiero** buscar un vehículo por su placa, consultar sus datos, asignarle una celda libre y registrar su entrada,  
**para** conocer su ubicación exacta dentro de las instalaciones.

**Criterios de aceptación:**
- [x] El vehículo debe existir en el registro y encontrarse activo.
- [x] Si el vehículo ya tiene una entrada abierta, el sistema impide la operación con mensaje explicativo.
- [x] Se valida la disponibilidad de la celda seleccionada (estado `LIBRE`).
- [x] Se valida la compatibilidad entre el tipo de vehículo y el tipo de celda (RF25).
- [x] Se registra la fecha y hora oficial generada por el backend y el operador responsable.
- [x] Permite registrar una observación opcional de entrada.
- [x] Al registrar, la celda pasa automáticamente a estado `OCUPADA`.

### HU02: Consultar vehículos dentro
**Como** operador del parqueadero,  
**quiero** visualizar los vehículos que permanecen dentro,  
**para** conocer la ocupación en tiempo real y localizar cualquier vehículo.

**Criterios de aceptación:**
- [x] Lista únicamente movimientos con estado `ABIERTO`.
- [x] Muestra placa, vehículo (marca, modelo, color), celda asignada, hora de ingreso y observación.
- [x] Permite filtrar y buscar vehículos en tiempo real por placa.

### HU03: Registrar salida de vehículo
**Como** operador del parqueadero,  
**quiero** localizar un vehículo dentro del parqueadero y registrar su salida,  
**para** cerrar su estancia y liberar automáticamente la celda asignada.

**Criterios de aceptación:**
- [x] Solo permite registrar salida si existe un movimiento abierto.
- [x] Muestra el resumen de la estancia y el tiempo transcurrido.
- [x] Registra fecha, hora y operador de salida.
- [x] Permite registrar una observación de salida independiente.
- [x] El movimiento pasa a estado `CERRADO` y la celda vuelve automáticamente a `LIBRE`.

### HU04: Consultar historial de movimientos
**Como** operador o administrador,  
**quiero** consultar las entradas y salidas anteriores mediante filtros,  
**para** revisar el historial de estancias de cualquier vehículo.

**Criterios de aceptación:**
- [x] Filtros por placa, rango de fechas (desde/hasta) y estado (`ABIERTO`/`CERRADO`).
- [x] Diferencia visual clara entre movimientos abiertos y cerrados.
- [x] Muestra celdas, operadores y permite consultar el detalle completo con observaciones.

### HU05: Registrar observaciones independientes
**Como** operador del parqueadero,  
**quiero** registrar novedades durante el ingreso y el egreso,  
**para** conservar constancia del estado físico del vehículo.

**Criterios de aceptación:**
- [x] Las observaciones de entrada y salida son campos independientes.
- [x] La observación de salida nunca sobreescribe ni modifica la de entrada.

### HU06: Validar operaciones y mostrar errores
**Como** operador del parqueadero,  
**quiero** recibir mensajes comprensibles y oportunos cuando una operación no proceda,  
**para** corregir inconsistencias y conservar la integridad de los datos.

**Criterios de aceptación:**
- [x] Impide entradas duplicadas, vehículos inexistentes o inactivos, y celdas no disponibles.
- [x] Si una operación falla, no se generan estados parciales ni contradictorios (rollback).

---

## Iteración 2 — Gestión de Usuarios y Gestión de Celdas

### HU07: Consultar y buscar usuarios
**Como** Administrador,  
**quiero** consultar y filtrar los usuarios del sistema,  
**para** localizar su información, roles y estados de actividad.

**Criterios de aceptación:**
- [x] Visualiza nombres, apellidos, tipo y número de documento, correo, teléfono, rol y estado.
- [x] Búsqueda predictiva por nombre, documento o correo electrónico.
- [x] Filtros por rol (`ADMINISTRADOR`, `OPERADOR`) y estado (`ACTIVO`, `INACTIVO`).
- [x] Modal de consulta de detalle completo con fechas de creación y actualización.
- [x] Indicadores numéricos de total de usuarios, administradores, operadores e inactivos.
- [x] Muestra mensaje informativo cuando no hay coincidencias con los filtros.

### HU08: Registrar usuario
**Como** Administrador,  
**quiero** registrar nuevos usuarios en el sistema,  
**para** habilitar e identificar al personal operativo y administrativo del parqueadero.

**Criterios de aceptación:**
- [x] Formulario con: tipo de documento (`CC`, `CE`, `PASAPORTE`, `TI`), número de documento, nombres, apellidos, correo, teléfono y rol.
- [x] Valida campos obligatorios y formato de correo electrónico.
- [x] Valida unicidad de documento y correo (rechaza duplicados con error claro).
- [x] No solicita ni almacena contraseñas (desarrollo local).
- [x] Todo usuario nuevo se crea en estado `ACTIVO`.

### HU09: Actualizar usuario y rol
**Como** Administrador,  
**quiero** actualizar los datos y roles de los usuarios,  
**para** mantener la información vigente y reasignar responsabilidades.

**Criterios de aceptación:**
- [x] Permite editar datos de contacto, documento y rol.
- [x] Valida que el documento o correo modificado no pertenezca a otro usuario.
- [x] Impide retirar el rol de Administrador al último Administrador activo del sistema.
- [x] Conserva el historial de movimientos asociados al usuario sin alterarlo.

### HU10: Activar o desactivar usuario
**Como** Administrador,  
**quiero** controlar el estado de acceso de los usuarios sin eliminar sus registros históricos,  
**para** impedir que usuarios inactivos operen sin perder la trazabilidad.

**Criterios de aceptación:**
- [x] Permite alternar entre estado `ACTIVO` e `INACTIVO`.
- [x] Modal de confirmación explicativo antes de cambiar el estado.
- [x] Impide que usuarios inactivos registren nuevas entradas o salidas.
- [x] Impide desactivar al usuario de demostración actualmente en uso.
- [x] Impide desactivar al último Administrador activo del parqueadero.

### HU11: Consultar y filtrar celdas
**Como** Administrador u Operador,  
**quiero** consultar el inventario de celdas,  
**para** conocer la disponibilidad, ubicación y compatibilidad de cada espacio.

**Criterios de aceptación:**
- [x] Visualiza código, ubicación, tipo/compatibilidad y estado (`LIBRE`, `OCUPADA`, `MANTENIMIENTO`).
- [x] Para celdas ocupadas, muestra el vehículo asociado, placa y tiempo transcurrido.
- [x] Filtros por código/búsqueda, tipo (`CARRO`, `MOTO`, `CAMIONETA`, `GENERAL`) y estado.
- [x] Indicadores en tiempo real de celdas totales, libres, ocupadas y en mantenimiento.
- [x] El operador solo tiene permisos de lectura (no ve botones de edición ni mantenimiento).

### HU12: Registrar celda
**Como** Administrador,  
**quiero** registrar nuevas celdas de parqueadero,  
**para** ampliar la capacidad física del establecimiento.

**Criterios de aceptación:**
- [x] Formulario con código único, ubicación, tipo/compatibilidad y descripción opcional.
- [x] Valida que el código de la celda no exista previamente en el sistema.
- [x] Toda celda nueva se crea obligatoriamente en estado `LIBRE`.
- [x] Registra automáticamente evento de auditoría de creación con fecha y responsable.

### HU13: Actualizar información de celda
**Como** Administrador,  
**quiero** modificar los datos de ubicación, tipo y descripción de las celdas,  
**para** reflejar cambios físicos en las instalaciones.

**Criterios de aceptación:**
- [x] Permite modificar ubicación, tipo/compatibilidad y descripción.
- [x] El código de la celda permanece inmutable.
- [x] No permite cambiar manualmente el estado desde el formulario de edición general.
- [x] Impide modificar la compatibilidad/tipo de una celda si está `OCUPADA`.
- [x] Registra evento de auditoría de edición con detalle de los campos modificados.

### HU14: Gestionar mantenimiento de celdas
**Como** Administrador,  
**quiero** enviar celdas libres a mantenimiento y habilitarlas de nuevo cuando concluyan las obras,  
**para** controlar la disponibilidad operativa de las plazas.

**Criterios de aceptación:**
- [x] Permite la transición `LIBRE` → `MANTENIMIENTO` solicitando obligatoriamente el motivo.
- [x] Permite la transición `MANTENIMIENTO` → `LIBRE` con motivo u observación.
- [x] Impide enviar a mantenimiento una celda con estado `OCUPADA`.
- [x] Impide liberar manualmente una celda `OCUPADA` desde la gestión administrativa.
- [x] Registra trazabilidad histórica en auditoría con fecha, responsable y motivo del mantenimiento.
