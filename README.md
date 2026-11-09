# 🚗 Autos Colombia — Sistema de Gestión de Parqueadero

Sistema web para la administración y operación de parqueaderos por mensualidad, desarrollado con **React + Vite** en el frontend, **Node.js + Express** en el backend y persistencia atómica en archivos JSON.

---

## 📋 Alcance del Proyecto

### ✅ Iteración 1 — Gestión de Entradas, Salidas y Movimientos
- Registro de entradas con asignación automática de celda libre.
- Consulta de vehículos actualmente dentro del parqueadero en tiempo real.
- Registro de salida con cálculo de tiempo de estancia y liberación inmediata de la celda.
- Observaciones de entrada y salida independientes (la salida nunca sobreescribe la de entrada).
- Historial de movimientos con filtros combinados por placa, fechas y estado (`ABIERTO` / `CERRADO`).
- Dashboard con indicadores de ocupación, celdas libres, entradas y salidas del día.
- Validaciones completas y robustas en el backend.

### ✅ Iteración 2 — Gestión de Usuarios y Gestión de Celdas
- **Gestión de Usuarios:**
  - Consulta y búsqueda predictiva por nombre, documento o correo.
  - Filtros por rol (`ADMINISTRADOR`, `OPERADOR`) y estado (`ACTIVO`, `INACTIVO`).
  - Registro de usuarios con validación de unicidad de documento y correo.
  - Actualización de información personal y reasignación de roles.
  - Activación y desactivación de usuarios (conservando la integridad del historial).
  - Reglas de seguridad: protección del usuario demo actual y del último Administrador activo.
- **Gestión de Celdas y Mantenimiento:**
  - Inventario de celdas con visualización de vehículo ocupante y tiempo de estancia.
  - Filtros por código, ubicación, tipo/compatibilidad y estado.
  - Registro de nuevas celdas (inician en estado `LIBRE`).
  - Actualización de ubicación, compatibilidad y descripción.
  - Control de mantenimiento: transición de `LIBRE` a `MANTENIMIENTO` y de `MANTENIMIENTO` a `LIBRE` con registro obligatorio de motivo.
  - Prohibición de liberar manualmente celdas ocupadas desde la administración.
  - Validación de compatibilidad entre tipo de vehículo (`CARRO`, `MOTO`, `CAMIONETA`) y tipo de celda (`CARRO`, `MOTO`, `CAMIONETA`, `GENERAL`).
  - Trazabilidad histórica completa con cronología de auditoría de cada celda.
- **Control de Roles y Sesión Demo:**
  - Rol **Administrador:** acceso total a todos los módulos.
  - Rol **Operador:** acceso a Resumen, Entradas, Salidas, Movimientos y consulta de Celdas (sin permisos de edición ni gestión de usuarios).
  - Selector interactivo en la barra lateral para alternar en caliente entre Administrador y Operador en desarrollo local.

---

## 🏗️ Arquitectura

```
Frontend (React + Vite) → API REST (Express) → Controladores → Servicios → Repositorios → Archivos JSON
```

### Estructura del Repositorio

```
├── .env.example                     # Variables de entorno de ejemplo
├── package.json                     # Scripts unificados en la raíz
├── start-dev.js                     # Script para iniciar backend y frontend concurrentemente
├── README.md                        # Documentación principal
├── docs/                            # Documentación técnica completa
│   ├── especificacion-funcional.md  # RF01-RF27, RNF01-RNF06 y reglas de negocio
│   ├── historias-usuario.md         # HU01-HU14 con criterios de aceptación
│   ├── casos-uso.md                 # Casos de uso y diagramas Mermaid
│   ├── arquitectura.md              # Arquitectura en capas y diagramas de secuencia
│   ├── modelo-datos.md              # Modelo conceptual, ER Mermaid y DDL futuro MySQL
│   ├── api-reference.md             # Referencia de todos los endpoints REST
│   ├── plan_pruebas_iteracion_2.md  # Matriz de 34 casos de prueba ejecutados
│   └── plan_pruebas_iteracion_2.csv # Versión CSV del plan de pruebas
│
├── backend/                         # Servidor Node.js + Express
│   ├── .env.example
│   ├── package.json
│   ├── test-direct.js               # Suite automatizada de 37 pruebas unitarias/integración
│   ├── data/                        # Persistencia JSON atómica (auto-gestionada)
│   │   ├── clientes.json
│   │   ├── vehiculos.json
│   │   ├── celdas.json
│   │   ├── usuarios.json
│   │   ├── movimientos.json
│   │   └── auditorias_celda.json
│   └── src/
│       ├── index.js                 # Punto de entrada (Puerto 3001)
│       ├── app.js                   # Configuración de Express, CORS y rutas
│       ├── config/constants.js      # Enums y constantes del sistema
│       ├── domain/                  # Fábricas de entidades y errores personalizados
│       ├── persistence/             # FileManager con Mutex y repositorios desacoplados
│       ├── application/             # Lógica de negocio (MovimientoService, UsuarioService, CeldaService)
│       └── api/                     # Controladores, rutas y middlewares de autorización
│
└── frontend/                        # Aplicación React 18 + Vite
    ├── package.json
    ├── vite.config.js               # Proxy hacia backend en http://localhost:3001
    └── src/
        ├── main.jsx                 # Entry point con BrowserRouter
        ├── App.jsx                  # Layout y enrutador principal
        ├── context/AuthContext.jsx  # Proveedor de sesión y roles demo
        ├── api/client.js            # Cliente HTTP estructurado hacia la API
        ├── components/
        │   ├── layout/              # Sidebar (#172A46, responsive, selector de roles)
        │   ├── ui/                  # StatCard, Badge, Modal, Alert, SearchInput, etc.
        │   └── shared/              # CeldaSelector con compatibilidad, MovimientosTable, VehiculoInfo
        └── pages/                   # Vistas principales
            ├── Resumen/             # Dashboard con indicadores y vehículos dentro
            ├── RegistrarEntrada/    # Búsqueda, compatibilidad y registro de entrada
            ├── RegistrarSalida/     # Salida, cálculo de estancia y liberación de celda
            ├── Movimientos/         # Historial y filtros
            ├── Celdas/              # Gestión de celdas, mantenimiento y auditoría
            └── Usuarios/            # Gestión de usuarios, roles y estados (solo Admin)
```

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18, Vite 5, React Router 6, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express 4 |
| **Persistencia** | JSON atómico en disco con control de concurrencia en memoria (Mutex) |
| **Estilos** | CSS moderno organizado, variables CSS y diseño responsive |
| **Pruebas** | Suite automatizada en Node.js (37 pruebas de reglas de negocio) |

---

## 📦 Requisitos Previos

- **Node.js** v18 o superior instalado.
- **npm** v9 o superior.

---

## 🚀 Instalación y Ejecución

### 1. Clonar o ubicarse en la carpeta del proyecto
```bash
cd "c:\Users\migue\Downloads\Nueva carpeta"
```

### 2. Instalar dependencias
Puedes instalar todas las dependencias con el comando en la raíz:
```bash
npm run install:all
```
*(O ejecutar `npm install` dentro de `backend` y `frontend` por separado).*

### 3. Iniciar Backend y Frontend simultáneamente
Desde la raíz del proyecto, ejecuta:
```bash
npm run dev
```
Este comando levantará concurrentemente:
- **Backend API:** `http://localhost:3001` (con auto-recarga y seed inicial).
- **Frontend Web:** `http://localhost:5173`.

---

## 👤 Usuario de Demostración y Roles

El sistema implementa un mecanismo de demostración local **sin contraseñas**:
- **Administrador predeterminado:** Ana Morales (`0832007f-e744-4eb7-aa89-9994b35e8974`).
- **Operador predeterminado:** Carlos Ramírez (`527877e3-a9a4-486d-a367-2b274fecff67`).

### Cómo alternar entre roles:
1. **Directamente en la interfaz:** En la parte inferior de la barra lateral (Sidebar), utiliza el selector desplegable **"Cambiar usuario demo"** para alternar al instante entre **Ana Morales (Admin)** y **Carlos Ramírez (Operador)**.
2. **Mediante variable de entorno:** En `backend/.env`, configura:
   ```env
   DEMO_USER_ID=0832007f-e744-4eb7-aa89-9994b35e8974
   ```

> ⚠️ **Aviso de seguridad:** Este mecanismo es exclusivamente para desarrollo local y fines académicos. No constituye un sistema de autenticación de producción.

---

## 🧪 Ejecución de Pruebas Automatizadas

Para ejecutar la suite automatizada de pruebas de reglas de negocio y regresión:

```bash
npm test
```
*(O `npm test --prefix backend`)*

**Resultado obtenido:**
`TOTAL DE PRUEBAS AUTOMATIZADAS: 37 PASADAS, 0 FALLADAS`

---

## 📄 Limitaciones Conocidas

1. **Persistencia JSON:** Los archivos JSON son almacenamiento temporal para desarrollo local y no una base de datos para entornos multi-instancia en producción. La arquitectura por repositorios permite sustituir esta capa por MySQL sin tocar la lógica de negocio ni la UI.
2. **Autenticación:** No se solicitan ni almacenan contraseñas; el control de acceso se basa en el usuario demo activo en el contexto.
3. **Módulos futuros:** Los pagos, mensualidades y facturación detallada quedan previstos para iteraciones posteriores.
