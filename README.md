# 🚗 Autos Colombia — Gestión de Parqueadero

Sistema de gestión de entradas y salidas de vehículos para parqueaderos por mensualidad.

## 📋 Descripción

**Autos Colombia** es una aplicación web diseñada para operadores de parqueaderos que necesitan gestionar el ingreso y egreso de vehículos, controlar la ocupación de celdas, registrar observaciones sobre el estado de los vehículos y consultar el historial de movimientos.

### Iteración 1 — Alcance

Esta primera versión incluye:
- ✅ Registro de entradas de vehículos
- ✅ Registro de salidas de vehículos
- ✅ Consulta de vehículos dentro del parqueadero
- ✅ Asignación y liberación automática de celdas
- ✅ Observaciones independientes en entrada y salida
- ✅ Historial de movimientos con filtros
- ✅ Dashboard con indicadores de ocupación
- ✅ Validaciones completas en frontend y backend

**No incluye** (previsto para iteraciones posteriores):
- ❌ Gestión de pagos y mensualidades
- ❌ Autenticación de usuarios
- ❌ Administración de clientes y vehículos
- ❌ Base de datos MySQL

## 🏗️ Arquitectura

```
Frontend (React + Vite) → API REST (Express) → Servicios → Repositorios → Archivos JSON
```

### Estructura del proyecto

```
autos-colombia/
├── README.md
├── docs/                          # Documentación funcional
│   ├── especificacion-funcional.md
│   ├── historias-usuario.md
│   ├── casos-uso.md
│   ├── arquitectura.md
│   ├── modelo-datos.md
│   └── api-reference.md
├── backend/
│   ├── package.json
│   ├── data/                      # Almacenamiento JSON (auto-generado)
│   └── src/
│       ├── index.js               # Punto de entrada
│       ├── app.js                 # Configuración Express
│       ├── config/                # Constantes
│       ├── api/                   # Rutas, controladores, middlewares
│       ├── application/           # Servicios de negocio
│       ├── domain/                # Entidades y errores
│       └── persistence/           # Repositorios y gestión de archivos
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/                   # Cliente API
        ├── hooks/                 # Hooks personalizados
        ├── components/            # Componentes reutilizables
        └── pages/                 # Páginas de la aplicación
```

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Vite 5, React Router 6, Lucide Icons |
| Backend | Node.js, Express 4 |
| Comunicación | API REST (JSON) |
| Almacenamiento | Archivos JSON en disco |
| Estilos | CSS personalizado (sin frameworks) |

## 📦 Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior

## 🚀 Instalación y ejecución

### 1. Clonar o descargar el proyecto

```bash
git clone <url-del-repositorio>
cd autos-colombia
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd frontend
npm install
```

### 4. Ejecutar el backend

```bash
cd backend
npm run dev
```

El servidor se inicia en `http://localhost:3001`. En el primer inicio, se crean automáticamente los datos de demostración en la carpeta `data/`.

### 5. Ejecutar el frontend (en otra terminal)

```bash
cd frontend
npm run dev
```

La aplicación se abre en `http://localhost:5173`.

## 🔑 Datos de demostración

El sistema se inicializa con datos ficticios para facilitar las pruebas:

- **5 clientes** con datos colombianos realistas
- **8 vehículos** (6 activos, 1 inactivo para probar validaciones)
- **20 celdas** (carros, motos, camionetas; una en mantenimiento)
- **2 usuarios** (operador de demostración: Carlos Ramírez)
- **Movimientos de ejemplo** (abiertos y cerrados)

> ⚠️ El operador de demostración se utiliza automáticamente. No representa autenticación real; la gestión de usuarios se implementará en una iteración posterior.

## 📱 Pantallas

1. **Resumen** — Dashboard con indicadores, accesos rápidos y tabla de vehículos dentro.
2. **Registrar Entrada** — Búsqueda de vehículo, selección de celda, observaciones y confirmación.
3. **Registrar Salida** — Lista de vehículos dentro, detalle de estancia y confirmación de salida.
4. **Movimientos** — Historial completo con filtros por placa, fechas y estado.

## 🔌 API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/dashboard/summary` | Indicadores del parqueadero |
| GET | `/api/vehiculos?placa=` | Buscar vehículos por placa |
| GET | `/api/celdas?estado=LIBRE` | Consultar celdas por estado |
| GET | `/api/movimientos/abiertos` | Vehículos dentro (movimientos abiertos) |
| GET | `/api/movimientos` | Historial con filtros |
| GET | `/api/movimientos/:id` | Detalle de un movimiento |
| POST | `/api/movimientos/entrada` | Registrar entrada |
| POST | `/api/movimientos/:id/salida` | Registrar salida |

## 📝 Notas

- Los datos se almacenan en archivos JSON en `backend/data/`. Si se eliminan, se regeneran al reiniciar el servidor.
- Para reiniciar con datos limpios, basta con eliminar la carpeta `backend/data/` y reiniciar.
- La arquitectura está preparada para sustituir los repositorios JSON por MySQL sin modificar los componentes de React ni la lógica de negocio.
