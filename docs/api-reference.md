# 🔌 Referencia de API — Autos Colombia

**Versión:** 1.0  
**Iteración:** 1  
**Fecha:** Octubre 2026  
**Base URL:** `http://localhost:3001`

---

## 1. Convenciones

### 1.1 URL base

Todos los endpoints se sirven bajo el prefijo `/api`:

```
http://localhost:3001/api/{recurso}
```

### 1.2 Formato de datos

- **Content-Type:** `application/json`
- **Codificación:** UTF-8
- **Fechas:** ISO 8601 (`2026-10-25T08:15:00.000Z`)
- **IDs:** UUID v4

### 1.3 Formato de respuesta exitosa

```json
{
  "success": true,
  "data": { ... }
}
```

Para listas:

```json
{
  "success": true,
  "data": [ ... ],
  "count": 10
}
```

### 1.4 Formato de respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descripción del error",
    "details": { ... }
  }
}
```

### 1.5 Códigos de estado HTTP utilizados

| Código | Significado | Uso |
|--------|------------|-----|
| `200` | OK | Operación exitosa (GET, POST salida) |
| `201` | Created | Recurso creado exitosamente (POST entrada) |
| `400` | Bad Request | Error de validación en parámetros o body |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto de estado (vehículo ya dentro, celda ocupada) |
| `500` | Internal Server Error | Error interno del servidor |

---

## 2. Endpoints

### Índice rápido

| # | Método | Endpoint | Descripción |
|---|--------|----------|-------------|
| 1 | GET | `/api/health` | Estado del servidor |
| 2 | GET | `/api/dashboard/summary` | Indicadores del parqueadero |
| 3 | GET | `/api/vehiculos` | Buscar vehículos por placa |
| 4 | GET | `/api/celdas` | Consultar celdas por estado |
| 5 | GET | `/api/movimientos/abiertos` | Vehículos dentro del parqueadero |
| 6 | GET | `/api/movimientos` | Historial de movimientos con filtros |
| 7 | GET | `/api/movimientos/:id` | Detalle de un movimiento |
| 8 | POST | `/api/movimientos/entrada` | Registrar entrada de vehículo |
| 9 | POST | `/api/movimientos/:id/salida` | Registrar salida de vehículo |

---

### 2.1 Estado del servidor

Verifica que el servidor está en funcionamiento.

```
GET /api/health
```

#### Parámetros

Ninguno.

#### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-10-25T12:00:00.000Z",
    "uptime": 3600
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `status` | `string` | Siempre `"ok"` |
| `timestamp` | `string` | Fecha/hora actual del servidor (ISO 8601) |
| `uptime` | `number` | Segundos desde que el servidor inició |

---

### 2.2 Dashboard — Indicadores del parqueadero

Retorna los indicadores de ocupación del parqueadero para el dashboard.

```
GET /api/dashboard/summary
```

#### Parámetros

Ninguno.

#### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "data": {
    "totalCeldas": 20,
    "celdasLibres": 14,
    "celdasOcupadas": 5,
    "celdasMantenimiento": 1,
    "porcentajeOcupacion": 25.0,
    "vehiculosDentro": 5,
    "movimientosHoy": 3,
    "vehiculosEnParqueadero": [
      {
        "id": "m1a2b3c4-...",
        "placa": "ABC123",
        "tipoVehiculo": "CARRO",
        "marca": "Chevrolet",
        "modelo": "Spark",
        "color": "Blanco",
        "codigoCelda": "A-01",
        "fechaEntrada": "2026-10-25T08:15:00.000Z",
        "tiempoTranscurrido": "3h 45min"
      }
    ]
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `totalCeldas` | `number` | Total de celdas del parqueadero (excluyendo mantenimiento) |
| `celdasLibres` | `number` | Celdas con estado LIBRE |
| `celdasOcupadas` | `number` | Celdas con estado OCUPADA |
| `celdasMantenimiento` | `number` | Celdas con estado MANTENIMIENTO |
| `porcentajeOcupacion` | `number` | Porcentaje de ocupación (ocupadas / (total - mantenimiento) × 100) |
| `vehiculosDentro` | `number` | Cantidad de vehículos actualmente dentro |
| `movimientosHoy` | `number` | Entradas registradas en el día actual |
| `vehiculosEnParqueadero` | `array` | Lista de vehículos dentro con datos resumidos |

---

### 2.3 Buscar vehículos por placa

Busca vehículos registrados cuya placa contenga el texto proporcionado.

```
GET /api/vehiculos?placa={texto}
```

#### Parámetros de consulta (query)

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|:-----------:|-------------|
| `placa` | `string` | ✅ | Texto de búsqueda. Mínimo 2 caracteres. Búsqueda parcial (contiene), no sensible a mayúsculas. |

#### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "v1a2b3c4-...",
      "placa": "ABC123",
      "tipo": "CARRO",
      "marca": "Chevrolet",
      "modelo": "Spark",
      "color": "Blanco",
      "activo": true,
      "clienteId": "c1a2b3c4-...",
      "fechaCreacion": "2026-01-15T08:30:00.000Z",
      "cliente": {
        "id": "c1a2b3c4-...",
        "nombre": "María",
        "apellido": "González Rodríguez",
        "documento": "1012345678",
        "tipoDocumento": "CC"
      }
    }
  ],
  "count": 1
}
```

#### Errores posibles

| Código | Error | Descripción |
|--------|-------|-------------|
| `400` | `VALIDATION_ERROR` | El parámetro `placa` tiene menos de 2 caracteres o no fue proporcionado. |

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El parámetro 'placa' debe tener al menos 2 caracteres."
  }
}
```

---

### 2.4 Consultar celdas por estado

Retorna las celdas del parqueadero, opcionalmente filtradas por estado.

```
GET /api/celdas?estado={estado}
```

#### Parámetros de consulta (query)

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|:-----------:|-------------|
| `estado` | `string` | ❌ | Filtrar por estado: `LIBRE`, `OCUPADA`, `MANTENIMIENTO`. Si se omite, retorna todas. |

#### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "ce1a2b3c-...",
      "codigo": "A-01",
      "tipo": "CARRO",
      "ubicacion": "Piso 1 - Zona A",
      "estado": "LIBRE"
    },
    {
      "id": "ce2b3c4d-...",
      "codigo": "A-02",
      "tipo": "CARRO",
      "ubicacion": "Piso 1 - Zona A",
      "estado": "LIBRE"
    }
  ],
  "count": 2
}
```

#### Errores posibles

| Código | Error | Descripción |
|--------|-------|-------------|
| `400` | `VALIDATION_ERROR` | El valor del parámetro `estado` no es válido. |

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Estado inválido. Valores permitidos: LIBRE, OCUPADA, MANTENIMIENTO."
  }
}
```

---

### 2.5 Vehículos dentro del parqueadero (movimientos abiertos)

Retorna todos los movimientos con estado ABIERTO, enriquecidos con datos del vehículo, celda y cliente.

```
GET /api/movimientos/abiertos
```

#### Parámetros

Ninguno.

#### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "m1a2b3c4-...",
      "vehiculoId": "v1a2b3c4-...",
      "celdaId": "ce1a2b3c-...",
      "usuarioId": "u1a2b3c4-...",
      "fechaEntrada": "2026-10-25T08:15:00.000Z",
      "fechaSalida": null,
      "duracion": null,
      "observacionesEntrada": "Vehículo en buen estado.",
      "observacionesSalida": null,
      "estado": "ABIERTO",
      "vehiculo": {
        "id": "v1a2b3c4-...",
        "placa": "ABC123",
        "tipo": "CARRO",
        "marca": "Chevrolet",
        "modelo": "Spark",
        "color": "Blanco"
      },
      "celda": {
        "id": "ce1a2b3c-...",
        "codigo": "A-01",
        "tipo": "CARRO",
        "ubicacion": "Piso 1 - Zona A"
      },
      "cliente": {
        "nombre": "María",
        "apellido": "González Rodríguez"
      },
      "tiempoTranscurrido": "3h 45min"
    }
  ],
  "count": 1
}
```

---

### 2.6 Historial de movimientos con filtros

Retorna el historial de movimientos con opciones de filtrado.

```
GET /api/movimientos?placa={placa}&fechaDesde={fecha}&fechaHasta={fecha}&estado={estado}
```

#### Parámetros de consulta (query)

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|:-----------:|-------------|
| `placa` | `string` | ❌ | Filtrar por placa (búsqueda parcial, no sensible a mayúsculas). |
| `fechaDesde` | `string` | ❌ | Fecha de inicio del rango (ISO 8601, ej: `2026-10-01`). |
| `fechaHasta` | `string` | ❌ | Fecha de fin del rango (ISO 8601, ej: `2026-10-31`). |
| `estado` | `string` | ❌ | Filtrar por estado: `ABIERTO` o `CERRADO`. |

> **Nota:** Los filtros se combinan con operador AND. Si no se proporcionan filtros, se retornan todos los movimientos.

#### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "m2b3c4d5-...",
      "vehiculoId": "v2b3c4d5-...",
      "celdaId": "ce2b3c4d-...",
      "usuarioId": "u1a2b3c4-...",
      "fechaEntrada": "2026-10-24T14:30:00.000Z",
      "fechaSalida": "2026-10-24T18:45:00.000Z",
      "duracion": "4h 15min",
      "observacionesEntrada": "Rayón en puerta trasera derecha.",
      "observacionesSalida": "Sin novedades adicionales.",
      "estado": "CERRADO",
      "vehiculo": {
        "placa": "DEF456",
        "tipo": "MOTO",
        "marca": "Yamaha",
        "modelo": "FZ 250"
      },
      "celda": {
        "codigo": "M-03",
        "tipo": "MOTO"
      }
    }
  ],
  "count": 1
}
```

#### Errores posibles

| Código | Error | Descripción |
|--------|-------|-------------|
| `400` | `VALIDATION_ERROR` | Formato de fecha inválido o estado no reconocido. |

---

### 2.7 Detalle de un movimiento

Retorna la información completa de un movimiento específico, incluyendo datos del vehículo, celda, cliente y operador.

```
GET /api/movimientos/:id
```

#### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string (UUID)` | ID del movimiento a consultar. |

#### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "m1a2b3c4-...",
    "vehiculoId": "v1a2b3c4-...",
    "celdaId": "ce1a2b3c-...",
    "usuarioId": "u1a2b3c4-...",
    "fechaEntrada": "2026-10-25T08:15:00.000Z",
    "fechaSalida": null,
    "duracion": null,
    "observacionesEntrada": "Vehículo en buen estado. Sin novedades.",
    "observacionesSalida": null,
    "estado": "ABIERTO",
    "vehiculo": {
      "id": "v1a2b3c4-...",
      "placa": "ABC123",
      "tipo": "CARRO",
      "marca": "Chevrolet",
      "modelo": "Spark",
      "color": "Blanco",
      "activo": true
    },
    "celda": {
      "id": "ce1a2b3c-...",
      "codigo": "A-01",
      "tipo": "CARRO",
      "ubicacion": "Piso 1 - Zona A",
      "estado": "OCUPADA"
    },
    "cliente": {
      "id": "c1a2b3c4-...",
      "nombre": "María",
      "apellido": "González Rodríguez",
      "documento": "1012345678",
      "tipoDocumento": "CC",
      "telefono": "3101234567"
    },
    "usuario": {
      "id": "u1a2b3c4-...",
      "nombre": "Carlos",
      "apellido": "Ramírez",
      "rol": "OPERADOR"
    },
    "tiempoTranscurrido": "3h 45min"
  }
}
```

#### Errores posibles

| Código | Error | Descripción |
|--------|-------|-------------|
| `404` | `NOT_FOUND` | No existe un movimiento con el ID proporcionado. |

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Movimiento no encontrado."
  }
}
```

---

### 2.8 Registrar entrada de vehículo

Registra la entrada de un vehículo al parqueadero, creando un movimiento ABIERTO y ocupando la celda seleccionada.

```
POST /api/movimientos/entrada
```

#### Cuerpo de la petición (request body)

```json
{
  "vehiculoId": "v1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "celdaId": "ce1a2b3c-d5e6-7890-abcd-ef1234567890",
  "observacionesEntrada": "Vehículo en buen estado. Sin novedades."
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `vehiculoId` | `string (UUID)` | ✅ | ID del vehículo que ingresa. |
| `celdaId` | `string (UUID)` | ✅ | ID de la celda a asignar. |
| `observacionesEntrada` | `string` | ❌ | Observaciones sobre el estado del vehículo. Máximo 500 caracteres. |

#### Respuesta exitosa — `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "m-nuevo-uuid-...",
    "vehiculoId": "v1a2b3c4-...",
    "celdaId": "ce1a2b3c-...",
    "usuarioId": "u1a2b3c4-...",
    "fechaEntrada": "2026-10-25T12:30:00.000Z",
    "fechaSalida": null,
    "duracion": null,
    "observacionesEntrada": "Vehículo en buen estado. Sin novedades.",
    "observacionesSalida": null,
    "estado": "ABIERTO",
    "vehiculo": {
      "placa": "ABC123",
      "tipo": "CARRO",
      "marca": "Chevrolet",
      "modelo": "Spark"
    },
    "celda": {
      "codigo": "A-01",
      "ubicacion": "Piso 1 - Zona A"
    }
  }
}
```

#### Errores posibles

| Código | Error | Mensaje |
|--------|-------|---------|
| `400` | `VALIDATION_ERROR` | "El campo 'vehiculoId' es obligatorio." |
| `400` | `VALIDATION_ERROR` | "El campo 'celdaId' es obligatorio." |
| `400` | `VALIDATION_ERROR` | "Las observaciones no pueden exceder 500 caracteres." |
| `404` | `NOT_FOUND` | "Vehículo no encontrado." |
| `404` | `NOT_FOUND` | "Celda no encontrada." |
| `409` | `CONFLICT` | "El vehículo no se encuentra activo." |
| `409` | `CONFLICT` | "El vehículo ya se encuentra dentro del parqueadero." |
| `409` | `CONFLICT` | "La celda no está disponible." |
| `409` | `CONFLICT` | "El tipo de celda no es compatible con el tipo de vehículo." |

**Ejemplo de error:**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "El vehículo ya se encuentra dentro del parqueadero.",
    "details": {
      "movimientoActual": "m-existente-uuid-...",
      "celda": "A-03",
      "fechaEntrada": "2026-10-25T08:15:00.000Z"
    }
  }
}
```

---

### 2.9 Registrar salida de vehículo

Registra la salida de un vehículo, cerrando el movimiento abierto y liberando la celda.

```
POST /api/movimientos/:id/salida
```

#### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string (UUID)` | ID del movimiento abierto. |

#### Cuerpo de la petición (request body)

```json
{
  "observacionesSalida": "Sin novedades. Vehículo retirado sin novedad."
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `observacionesSalida` | `string` | ❌ | Observaciones sobre el estado del vehículo a la salida. Máximo 500 caracteres. |

#### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "m1a2b3c4-...",
    "vehiculoId": "v1a2b3c4-...",
    "celdaId": "ce1a2b3c-...",
    "usuarioId": "u1a2b3c4-...",
    "fechaEntrada": "2026-10-25T08:15:00.000Z",
    "fechaSalida": "2026-10-25T12:30:00.000Z",
    "duracion": "4h 15min",
    "observacionesEntrada": "Vehículo en buen estado. Sin novedades.",
    "observacionesSalida": "Sin novedades. Vehículo retirado sin novedad.",
    "estado": "CERRADO",
    "vehiculo": {
      "placa": "ABC123",
      "tipo": "CARRO",
      "marca": "Chevrolet",
      "modelo": "Spark"
    },
    "celda": {
      "codigo": "A-01",
      "ubicacion": "Piso 1 - Zona A"
    }
  }
}
```

#### Errores posibles

| Código | Error | Mensaje |
|--------|-------|---------|
| `400` | `VALIDATION_ERROR` | "Las observaciones no pueden exceder 500 caracteres." |
| `404` | `NOT_FOUND` | "Movimiento no encontrado." |
| `409` | `CONFLICT` | "Este movimiento ya ha sido cerrado." |

**Ejemplo de error:**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Este movimiento ya ha sido cerrado.",
    "details": {
      "fechaSalida": "2026-10-25T10:00:00.000Z",
      "estado": "CERRADO"
    }
  }
}
```

---

## 3. Ejemplos con cURL

### 3.1 Verificar estado del servidor

```bash
curl http://localhost:3001/api/health
```

### 3.2 Obtener dashboard

```bash
curl http://localhost:3001/api/dashboard/summary
```

### 3.3 Buscar vehículo por placa

```bash
curl "http://localhost:3001/api/vehiculos?placa=ABC"
```

### 3.4 Obtener celdas libres

```bash
curl "http://localhost:3001/api/celdas?estado=LIBRE"
```

### 3.5 Obtener vehículos dentro

```bash
curl http://localhost:3001/api/movimientos/abiertos
```

### 3.6 Consultar historial con filtros

```bash
curl "http://localhost:3001/api/movimientos?placa=ABC&estado=CERRADO&fechaDesde=2026-10-01&fechaHasta=2026-10-31"
```

### 3.7 Ver detalle de movimiento

```bash
curl http://localhost:3001/api/movimientos/m1a2b3c4-d5e6-7890-abcd-ef1234567890
```

### 3.8 Registrar entrada

```bash
curl -X POST http://localhost:3001/api/movimientos/entrada \
  -H "Content-Type: application/json" \
  -d '{
    "vehiculoId": "v1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "celdaId": "ce1a2b3c-d5e6-7890-abcd-ef1234567890",
    "observacionesEntrada": "Vehículo en buen estado."
  }'
```

### 3.9 Registrar salida

```bash
curl -X POST http://localhost:3001/api/movimientos/m1a2b3c4-d5e6-7890-abcd-ef1234567890/salida \
  -H "Content-Type: application/json" \
  -d '{
    "observacionesSalida": "Sin novedades."
  }'
```

---

## 4. Códigos de Error del Dominio

| Código | HTTP Status | Descripción |
|--------|:-----------:|-------------|
| `VALIDATION_ERROR` | 400 | Error de validación en los datos de entrada. |
| `NOT_FOUND` | 404 | El recurso solicitado no existe. |
| `CONFLICT` | 409 | Conflicto de estado de negocio (vehículo ya dentro, celda ocupada, movimiento cerrado). |
| `INTERNAL_ERROR` | 500 | Error interno inesperado del servidor. |
