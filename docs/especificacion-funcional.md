# 📋 Especificación Funcional — Autos Colombia

**Sistema de Gestión de Parqueadero por Mensualidad**  
**Versión:** 2.0 (Iteraciones 1 y 2)  
**Fecha:** Noviembre 2026  

---

## 1. Alcance y Contexto General

**Autos Colombia** es una plataforma web para la operación integral de parqueaderos por mensualidad.
- **Iteración 1:** Gestión de ingresos, egresos, consulta de vehículos dentro, historial de movimientos, observaciones independientes e indicadores de ocupación.
- **Iteración 2:** Gestión integral de usuarios (roles, estados, protección de administradores), gestión de celdas (compatibilidad, trazabilidad histórica) y control de mantenimiento de celdas.

---

## 2. Requerimientos Funcionales

### Iteración 1: Entradas, Salidas y Movimientos
- **RF01:** Registrar la entrada de un vehículo previamente registrado y activo.
- **RF02:** Consultar los vehículos que permanecen dentro del parqueadero en tiempo real.
- **RF03:** Registrar la salida de un vehículo con una entrada abierta.
- **RF04:** Asignar automáticamente la ocupación de una celda (`LIBRE` → `OCUPADA`) al registrar una entrada y liberarla (`OCUPADA` → `LIBRE`) al registrar la salida.
- **RF05:** Consultar el historial de movimientos mediante filtros por placa, fechas y estado.
- **RF06:** Guardar observaciones independientes durante la entrada y la salida.
- **RF07:** Mostrar indicadores de ocupación, celdas libres, entradas de hoy y salidas de hoy.
- **RF08:** Validar operaciones críticas y presentar mensajes de error comprensibles.

### Iteración 2: Gestión de Usuarios
- **RF09:** Listar todos los usuarios registrados en el sistema.
- **RF10:** Buscar y filtrar usuarios por nombre, documento, correo, rol y estado.
- **RF11:** Consultar los detalles completos de un usuario (incluyendo fechas de auditoría).
- **RF12:** Registrar nuevos usuarios con tipo y número de documento, nombres, apellidos, correo, teléfono y rol.
- **RF13:** Actualizar información personal, de contacto y reasignación de roles.
- **RF14:** Activar y desactivar usuarios sin eliminar sus registros históricos.
- **RF15:** Validar la unicidad de número de documento y correo electrónico en el backend.
- **RF16:** Impedir desactivar o degradar al último Administrador activo y proteger al usuario demo actual.

### Iteración 2: Gestión de Celdas y Mantenimiento
- **RF17:** Listar el inventario total de celdas del parqueadero.
- **RF18:** Buscar y filtrar celdas por código, ubicación, tipo/compatibilidad y estado.
- **RF19:** Consultar detalle de cada celda, incluyendo vehículo ocupante (si aplica) e historial de mantenimiento.
- **RF20:** Registrar nuevas celdas con código único, ubicación, tipo y descripción (inician en `LIBRE`).
- **RF21:** Actualizar información de ubicación, tipo y descripción de celdas existentes.
- **RF22:** Enviar celdas libres a estado `MANTENIMIENTO` registrando el motivo obligatorio.
- **RF23:** Habilitar celdas en mantenimiento devolviéndolas al estado `LIBRE`.
- **RF24:** Gestionar automáticamente la transición de ocupación con las entradas y salidas de la Iteración 1.
- **RF25:** Validar compatibilidad entre el tipo de vehículo (`CARRO`, `MOTO`, `CAMIONETA`) y el tipo de celda.
- **RF26:** Mostrar indicadores de celdas totales, libres, ocupadas y en mantenimiento.
- **RF27:** Conservar la trazabilidad histórica de auditoría de los cambios de las celdas.

---

## 3. Requerimientos No Funcionales

- **RNF01 (Usabilidad y Responsive):** Interfaz intuitiva, adaptada a escritorio y dispositivos móviles con paleta institucional (#172A46, #0E9F96, #F5F7FB).
- **RNF02 (Modularidad y Mantenibilidad):** Separación limpia en capas (Controladores, Servicios, Repositorios) desacopladas de la persistencia física.
- **RNF03 (Validaciones en Servidor):** Validaciones obligatorias ejecutadas en el backend, evitando depender únicamente del frontend.
- **RNF04 (Persistencia Atómica):** Persistencia en archivos JSON con control de concurrencia en memoria (Mutex) y escritura atómica temporal para evitar corrupción de datos.
- **RNF05 (API REST Consistente):** Respuestas estándar en formato `{ success: boolean, data?: any, error?: { message, code } }` y códigos HTTP acordes a la semántica REST.
- **RNF06 (Preparación para Escalabilidad):** Repositorios listos para sustitución futura por un ORM/SQL (MySQL) sin modificar componentes de React ni servicios de negocio.

---

## 4. Actores y Matriz de Permisos

| Módulo / Acción | Operador | Administrador |
|-----------------|:--------:|:-------------:|
| Consultar Dashboard y Resumen | ✅ | ✅ |
| Registrar Entrada de Vehículo | ✅ | ✅ |
| Registrar Salida de Vehículo | ✅ | ✅ |
| Consultar Historial de Movimientos | ✅ | ✅ |
| Consultar Disponibilidad de Celdas | ✅ | ✅ |
| Ver Detalle de Celda y Vehículo Ocupante | ✅ | ✅ |
| Crear Nueva Celda | ❌ | ✅ |
| Editar Celda Existente | ❌ | ✅ |
| Enviar Celda a Mantenimiento | ❌ | ✅ |
| Habilitar Celda de Mantenimiento | ❌ | ✅ |
| Consultar Módulo de Usuarios | ❌ | ✅ |
| Crear, Editar y Activar/Desactivar Usuarios | ❌ | ✅ |

---

## 5. Reglas de Negocio

### Reglas de Usuarios
1. **Roles permitidos:** `ADMINISTRADOR` y `OPERADOR`.
2. **Unicidad:** Cada documento y correo debe ser único en la colección de usuarios.
3. **Usuarios inactivos:** No pueden participar como operadores en nuevas entradas ni salidas.
4. **No eliminación física:** Los usuarios no se eliminan físicamente; se desactivan para proteger el historial.
5. **Protección del último Administrador:** No se puede desactivar ni degradar al único administrador activo.
6. **Protección del usuario demo actual:** No se puede desactivar al usuario con el que se está interactuando.
7. **Trazabilidad de movimientos:** Los movimientos anteriores conservan la referencia al operador original.
8. **Fechas oficiales:** Las fechas de creación y actualización de usuarios se generan en el backend.

### Reglas de Celdas
1. **Estados de celda:** `LIBRE`, `OCUPADA` y `MANTENIMIENTO`.
2. **Estado inicial:** Toda celda nueva comienza obligatoriamente como `LIBRE`.
3. **Ocupación automática:** Una entrada válida cambia la celda de `LIBRE` a `OCUPADA`.
4. **Liberación automática:** Una salida válida cambia la celda de `OCUPADA` a `LIBRE`.
5. **Transición manual a mantenimiento:** Solo se permite cambiar manualmente de `LIBRE` a `MANTENIMIENTO`.
6. **Rehabilitación manual:** Solo se permite cambiar manualmente de `MANTENIMIENTO` a `LIBRE`.
7. **Prohibición de liberación manual:** Nunca liberar manualmente una celda `OCUPADA` desde la administración.
8. **Integridad histórica:** No eliminar físicamente celdas que posean historial de movimientos o auditorías.
9. **Inmutabilidad en ocupación:** No se puede modificar el tipo/compatibilidad de una celda `OCUPADA`.
10. **Compatibilidad:** El tipo de vehículo debe ser compatible con el tipo de celda (`CARRO` con `CARRO`/`GENERAL`, `MOTO` con `MOTO`/`GENERAL`, `CAMIONETA` con `CAMIONETA`/`GENERAL`).
11. **Auditoría:** Todo cambio relevante (creación, edición, mantenimiento) genera un registro histórico en `AuditoriaCelda`.
