// Configuración central de la aplicación Autos Colombia

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Puerto del servidor
export const PORT = 3001;

// Rutas de archivos de datos
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');

export const FILE_PATHS = {
  CLIENTES: path.join(DATA_DIR, 'clientes.json'),
  VEHICULOS: path.join(DATA_DIR, 'vehiculos.json'),
  CELDAS: path.join(DATA_DIR, 'celdas.json'),
  USUARIOS: path.join(DATA_DIR, 'usuarios.json'),
  MOVIMIENTOS: path.join(DATA_DIR, 'movimientos.json'),
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

// Tipos de celda permitidos
export const TIPO_CELDA = {
  CARRO: 'CARRO',
  MOTO: 'MOTO',
  GENERAL: 'GENERAL',
};

// Roles de usuario
export const ROL_USUARIO = {
  OPERADOR: 'OPERADOR',
  ADMIN: 'ADMIN',
};
