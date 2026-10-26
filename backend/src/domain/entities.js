// Fábricas de entidades del dominio Autos Colombia

import { v4 as uuidv4 } from 'uuid';

/**
 * Crea un nuevo cliente.
 * @param {{ nombre: string, cedula: string, telefono: string, email: string }} datos
 * @returns {object} Entidad Cliente
 */
export function crearCliente({ nombre, cedula, telefono, email }) {
  return {
    id: uuidv4(),
    nombre,
    cedula,
    telefono,
    email,
  };
}

/**
 * Crea un nuevo vehículo.
 * @param {{ placa: string, tipo: string, marca: string, modelo: string, color: string, clienteId: string, activo?: boolean }} datos
 * @returns {object} Entidad Vehiculo
 */
export function crearVehiculo({ placa, tipo, marca, modelo, color, clienteId, activo = true }) {
  return {
    id: uuidv4(),
    placa: placa.toUpperCase().trim(),
    tipo,
    marca,
    modelo,
    color,
    clienteId,
    activo,
  };
}

/**
 * Crea una nueva celda de parqueadero.
 * @param {{ codigo: string, ubicacion: string, tipo: string, estado?: string }} datos
 * @returns {object} Entidad Celda
 */
export function crearCelda({ codigo, ubicacion, tipo, estado = 'LIBRE' }) {
  return {
    id: uuidv4(),
    codigo,
    ubicacion,
    tipo,
    estado,
  };
}

/**
 * Crea un nuevo usuario del sistema.
 * @param {{ nombre: string, rol: string, activo?: boolean }} datos
 * @returns {object} Entidad Usuario
 */
export function crearUsuario({ nombre, rol, activo = true }) {
  return {
    id: uuidv4(),
    nombre,
    rol,
    activo,
  };
}

/**
 * Crea un nuevo movimiento vehicular (entrada al parqueadero).
 * @param {{ vehiculoId: string, celdaId: string, operadorEntradaId: string, observacionEntrada?: string|null }} datos
 * @returns {object} Entidad MovimientoVehiculo
 */
export function crearMovimiento({ vehiculoId, celdaId, operadorEntradaId, observacionEntrada = null }) {
  return {
    id: uuidv4(),
    vehiculoId,
    celdaId,
    operadorEntradaId,
    operadorSalidaId: null,
    fechaHoraEntrada: new Date().toISOString(),
    fechaHoraSalida: null,
    observacionEntrada,
    observacionSalida: null,
    estado: 'ABIERTO',
  };
}
