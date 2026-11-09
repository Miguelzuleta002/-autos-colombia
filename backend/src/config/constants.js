// Configuración central de la aplicación Autos Colombia - Iteración 1 y 2

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Puerto del servidor
export const PORT = process.env.PORT || 3001;

// Rutas de archivos de datos
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');

export const FILE_PATHS = {
  CLIENTES: path.join(DATA_DIR, 'clientes.json'),
  VEHICULOS: path.join(DATA_DIR, 'vehiculos.json'),
  CELDAS: path.join(DATA_DIR, 'celdas.json'),
  USUARIOS: path.join(DATA_DIR, 'usuarios.json'),
  MOVIMIENTOS: path.join(DATA_DIR, 'movimientos.json'),
  AUDITORIAS_CELDA: path.join(DATA_DIR, 'auditorias_celda.json'),
};

// Estados posibles de una celda
export const ESTADO_CELDA = {
  LIBRE: 'LIBRE',
  OCUPADA: 'OCUPADA',
  MANTENIMIENTO: 'MANTENIMIENTO',
};

// Estados posibles de un movimiento
export const ESTADO_MOVIMIENTO = {
  ABIERTO: 'ABIERTO',
  CERRADO: 'CERRADO',
};

// Tipos de vehículo permitidos
export const TIPO_VEHICULO = {
  CARRO: 'CARRO',
  MOTO: 'MOTO',
  CAMIONETA: 'CAMIONETA',
};

// Tipos de celda / compatibilidad permitidos
export const TIPO_CELDA = {
  CARRO: 'CARRO',
  MOTO: 'MOTO',
  CAMIONETA: 'CAMIONETA',
  GENERAL: 'GENERAL',
};

// Roles de usuario (Iteración 2)
export const ROL_USUARIO = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  OPERADOR: 'OPERADOR',
  // Alias de compatibilidad
  ADMIN: 'ADMINISTRADOR',
};

// Estados de usuario
export const ESTADO_USUARIO = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
};

// Tipos de documento permitidos
export const TIPO_DOCUMENTO = {
  CC: 'CC',
  CE: 'CE',
  PASAPORTE: 'PASAPORTE',
  TI: 'TI',
};
