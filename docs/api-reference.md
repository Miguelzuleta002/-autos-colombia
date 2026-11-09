# 🔌 Referencia de la API REST — Autos Colombia

**Versión:** 2.0 (Iteraciones 1 y 2)  
**Base URL:** `http://localhost:3001/api`  
**Formato de Intercambio:** `application/json`

---

## Formato Estándar de Respuesta

### Éxito (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Controlado (HTTP 400 / 401 / 403 / 404 / 409)
```json
{
  "success": false,
  "error": {
    "message": "Descripción clara del problema",
    "code": "VALIDATION_ERROR | NOT_FOUND | CONFLICT_ERROR | FORBIDDEN_ERROR | UNAUTHORIZED_ERROR"
  }
}
```

---

## Resumen de Endpoints Disponibles

| Método | Endpoint | Rol Requerido | Descripción |
|--------|----------|:-------------:|-------------|
| **GET** | `/health` | Público | Estado del servicio y tiempo activo |
| **GET** | `/sesion/actual` | Cualquiera | Información del usuario demo activo y lista de alternancia |
| **POST**| `/sesion/cambiar-demo` | Cualquiera | Alterna en caliente el usuario demo en memoria |
| **GET** | `/dashboard/summary` | Operador / Admin | Indicadores de celdas y movimientos |
| **GET** | `/vehiculos?placa=` | Operador / Admin | Buscar vehículos activos por coincidencia de placa |
| **GET** | `/movimientos/abiertos` | Operador / Admin | Lista de vehículos actualmente dentro del parqueadero |
| **GET** | `/movimientos` | Operador / Admin | Historial con filtros por placa, fecha y estado |
| **GET** | `/movimientos/:id` | Operador / Admin | Detalle completo de un movimiento |
| **POST**| `/movimientos/entrada` | Operador / Admin | Registrar ingreso de vehículo y ocupar celda (valida compatibilidad) |
| **POST**| `/movimientos/:id/salida` | Operador / Admin | Registrar salida de vehículo y liberar celda |
| **GET** | `/usuarios` | **Administrador** | Consultar y filtrar lista de usuarios |
| **GET** | `/usuarios/:id` | **Administrador** | Consultar detalle de un usuario |
| **POST**| `/usuarios` | **Administrador** | Registrar nuevo usuario en estado ACTIVO |
| **PATCH**| `/usuarios/:id` | **Administrador** | Actualizar información o rol de un usuario |
| **PATCH**| `/usuarios/:id/estado` | **Administrador** | Activar o desactivar usuario (protege demo y último admin) |
| **GET** | `/celdas` | Operador / Admin | Consultar y filtrar celdas con ocupación poblada |
| **GET** | `/celdas/:id` | Operador / Admin | Detalle de celda con ocupación e historial de auditoría |
| **POST**| `/celdas` | **Administrador** | Registrar nueva celda en estado LIBRE |
| **PATCH**| `/celdas/:id` | **Administrador** | Actualizar ubicación, tipo o descripción de celda |
| **POST**| `/celdas/:id/mantenimiento` | **Administrador** | Poner celda LIBRE en estado MANTENIMIENTO con motivo |
| **POST**| `/celdas/:id/habilitar` | **Administrador** | Habilitar celda en mantenimiento volviéndola a LIBRE |

---

## Detalle de Nuevos Endpoints (Iteración 2)

### 1. `GET /api/sesion/actual`
Devuelve la información del usuario demo activo y la lista de perfiles disponibles para testing.

**Respuesta 200 OK:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "0832007f-e744-4eb7-aa89-9994b35e8974",
      "nombres": "Ana",
      "apellidos": "Morales",
      "nombre": "Ana Morales",
      "rol": "ADMINISTRADOR",
      "estado": "ACTIVO"
    },
    "esAdmin": true,
    "esOperador": false,
    "usuariosDemo": [ ... ]
  }
}
```

### 2. `POST /api/usuarios`
Crea un nuevo usuario en el sistema.

**Headers requeridos:**
- `Content-Type: application/json`
- Rol Administrador activo en la sesión.

**Cuerpo de la petición (Body):**
```json
{
  "tipoDocumento": "CC",
  "numeroDocumento": "1040506070",
  "nombres": "Laura",
  "apellidos": "Gómez",
  "correo": "laura.gomez@autoscolombia.com",
  "telefono": "3004445566",
  "rol": "OPERADOR"
}
```

**Respuesta 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "e2c3b4a5-...",
    "tipoDocumento": "CC",
    "numeroDocumento": "1040506070",
    "nombres": "Laura",
    "apellidos": "Gómez",
    "correo": "laura.gomez@autoscolombia.com",
    "rol": "OPERADOR",
    "estado": "ACTIVO",
    "activo": true,
    "fechaCreacion": "2026-11-09T02:00:00.000Z"
  }
}
```

### 3. `PATCH /api/usuarios/:id/estado`
Activa o desactiva un usuario.

**Cuerpo de la petición:**
```json
{
  "activo": false
}
```

### 4. `POST /api/celdas`
Registra una nueva celda. Comienza siempre en `LIBRE`.

**Cuerpo de la petición:**
```json
{
  "codigo": "B-06",
  "tipo": "CARRO",
  "ubicacion": "Piso 1 - Zona B",
  "descripcion": "Celda cubierta para automóvil"
}
```

### 5. `POST /api/celdas/:id/mantenimiento`
Envía una celda libre a mantenimiento.

**Cuerpo de la petición:**
```json
{
  "motivo": "Demarcación y pintura de líneas",
  "detalle": "Pintura reflectiva en bordes"
}
```

### 6. `POST /api/celdas/:id/habilitar`
Habilita una celda en mantenimiento devolviéndola al estado `LIBRE`.

**Cuerpo de la petición:**
```json
{
  "motivo": "Mantenimiento finalizado a satisfacción"
}
```
