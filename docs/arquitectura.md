# 🏗️ Arquitectura del Sistema — Autos Colombia

**Versión:** 2.0 (Iteración 1 e Iteración 2)  
**Fecha:** Noviembre 2026

---

## 1. Arquitectura Lógica en Capas

El sistema implementa una arquitectura en capas desacopladas que garantiza la separación de responsabilidades:

```mermaid
flowchart TD
    subgraph Frontend["Capa de Presentación (React + Vite)"]
        UI_Pages["Páginas: Resumen, Entrada, Salida, Movimientos, Usuarios, Celdas"]
        UI_Comp["Componentes UI: Sidebar, Modal, Alert, StatCard, CeldaSelector, MovimientosTable"]
        UI_Context["Contexto de Sesión: AuthContext (Roles y Demo Switch)"]
        UI_Client["Cliente API HTTP: fetch con JSON estructurado"]
    end

    subgraph API["Capa API REST (Express.js)"]
        Router["Enrutador Principal (/api)"]
        AuthMiddleware["Middleware attachUserContext & requireRole(ADMINISTRADOR)"]
        Controllers["Controladores: Dashboard, Vehículos, Celdas, Movimientos, Usuarios, Sesión"]
        ErrorHandler["Middleware Centralizado de Errores"]
    end

    subgraph Application["Capa de Aplicación (Servicios de Negocio)"]
        MovService["MovimientoService (Entradas, Salidas, Rollback, Compatibilidad RF25)"]
        CeldaService["CeldaService (Gestión, Mantenimiento, Trazabilidad)"]
        UsuarioService["UsuarioService (Usuarios, Roles, Protección Último Admin y Demo)"]
        DashService["DashboardService (Indicadores y Métricas)"]
    end

    subgraph Domain["Capa de Dominio"]
        Entities["Entidades: Cliente, Vehículo, Celda, Usuario, Movimiento, AuditoriaCelda"]
        Errors["Errores: NotFoundError, ValidationError, ConflictError, ForbiddenError, UnauthorizedError"]
        Constants["Constantes y Enums: Estados, Tipos, Roles"]
    end

    subgraph Persistence["Capa de Persistencia"]
        Repos["Repositorios: cliente, vehiculo, celda, usuario, movimiento, auditoriaCelda"]
        FileManager["FileManager (Mutex en memoria + Escritura Atómica .tmp)"]
        Seed["Seed & Migración Automática Idempotente"]
        DataFiles[("Archivos JSON en Disco (/backend/data)")]
    end

    UI_Pages --> UI_Client
    UI_Comp --> UI_Client
    UI_Context --> UI_Client
    UI_Client -->|HTTP / JSON| Router
    Router --> AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers --> MovService
    Controllers --> CeldaService
    Controllers --> UsuarioService
    Controllers --> DashService
    Controllers -.-> ErrorHandler

    MovService --> Domain
    CeldaService --> Domain
    UsuarioService --> Domain
    DashService --> Domain

    MovService --> Repos
    CeldaService --> Repos
    UsuarioService --> Repos
    DashService --> Repos

    Repos --> FileManager
    FileManager --> DataFiles
    Seed --> FileManager
```

---

## 2. Diagrama de Secuencia: Registrar Entrada con Validación de Compatibilidad (RF25)

```mermaid
sequenceDiagram
    autonumber
    actor Operador as Operador / Admin
    participant UI as Frontend (React)
    participant Ctrl as MovimientosController
    participant MovServ as MovimientoService
    participant VehRepo as VehiculoRepository
    participant CelRepo as CeldaRepository
    participant MovRepo as MovimientoRepository

    Operador->>UI: Ingresa placa, selecciona celda libre y observación
    UI->>Ctrl: POST /api/movimientos/entrada { placa, celdaId, observacionEntrada }
    Ctrl->>MovServ: registrarEntrada(datos)
    MovServ->>VehRepo: findByPlaca(placa)
    VehRepo-->>MovServ: vehiculo (activo: true, tipo: 'MOTO')
    MovServ->>MovRepo: findAbiertoByVehiculoId(vehiculo.id)
    MovRepo-->>MovServ: null (no tiene entrada abierta)
    MovServ->>CelRepo: findById(celdaId)
    CelRepo-->>MovServ: celda (estado: 'LIBRE', tipo: 'CARRO')
    Note over MovServ: Valida compatibilidad (RF25): MOTO vs CARRO -> Incompatible!
    alt Incompatible
        MovServ-->>Ctrl: throw ValidationError("Incompatibilidad de tipo")
        Ctrl-->>UI: HTTP 400 Bad Request
        UI-->>Operador: Alerta: El vehículo MOTO requiere celda MOTO o GENERAL
    else Compatible
        MovServ->>MovRepo: create(movimiento ABIERTO)
        MovServ->>CelRepo: updateById(celdaId, estado: 'OCUPADA')
        MovServ-->>Ctrl: movimiento poblado
        Ctrl-->>UI: HTTP 201 Created { success: true, data }
        UI-->>Operador: Notificación de ingreso exitoso y celda OCUPADA
    end
```

---

## 3. Diagrama de Secuencia: Enviar Celda a Mantenimiento (Iteración 2)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador
    participant UI as Frontend (CeldasPage)
    participant Auth as requireRole(ADMINISTRADOR)
    participant Ctrl as CeldasController
    participant CelServ as CeldaService
    participant CelRepo as CeldaRepository
    participant AudRepo as AuditoriaCeldaRepository

    Admin->>UI: Selecciona celda e ingresa motivo de mantenimiento
    UI->>Ctrl: POST /api/celdas/:id/mantenimiento { motivo }
    Ctrl->>Auth: Valida rol del usuario actual
    alt No es Administrador
        Auth-->>UI: HTTP 403 Forbidden ("Acción no autorizada")
    else Es Administrador
        Ctrl->>CelServ: enviarAMantenimiento(celdaId, { motivo }, usuario)
        CelServ->>CelRepo: findById(celdaId)
        CelRepo-->>CelServ: celda
        alt Celda está OCUPADA
            CelServ-->>Ctrl: throw ConflictError("No se puede enviar celda ocupada")
            Ctrl-->>UI: HTTP 409 Conflict
        else Celda está LIBRE
            CelServ->>CelRepo: updateById(celdaId, estado: 'MANTENIMIENTO')
            CelServ->>AudRepo: create(Auditoria 'MANTENIMIENTO_INICIO')
            CelServ-->>Ctrl: celda actualizada
            Ctrl-->>UI: HTTP 200 OK
            UI-->>Admin: Celda actualizada a MANTENIMIENTO
        end
    end
```

---

## 4. Estrategia de Migración Futura a Base de Datos Relacional (MySQL)

Gracias al patrón repositorio implementado:
1. Las entidades de negocio y la lógica de validación se encuentran en `application/` y `domain/`.
2. Para cambiar de archivos JSON a MySQL, solo se reemplazarán las implementaciones internas de los repositorios en `persistence/repositories/*.js` por consultas SQL mediante `mysql2` o un ORM (Prisma / Sequelize / Knex).
3. **Ni una sola línea de los componentes React ni de los controladores Express tendrá que modificarse.**
