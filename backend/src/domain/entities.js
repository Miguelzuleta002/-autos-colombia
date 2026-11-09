// Fábricas de entidades del dominio Autos Colombia - Iteración 1 y 2

import { v4 as uuidv4 } from 'uuid';
import { ROL_USUARIO, ESTADO_USUARIO, ESTADO_CELDA } from '../config/constants.js';

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
 * Crea una nueva celda de parqueadero (Iteración 2).
 * @param {{ codigo: string, ubicacion: string, tipo: string, descripcion?: string, estado?: string }} datos
 * @returns {object} Entidad Celda
 */
export function crearCelda({ codigo, ubicacion, tipo, descripcion = '', estado = ESTADO_CELDA.LIBRE }) {
  const ahora = new Date().toISOString();
  return {
    id: uuidv4(),
    codigo: codigo.toUpperCase().trim(),
    ubicacion: ubicacion.trim(),
    tipo: tipo.toUpperCase().trim(),
    descripcion: descripcion ? descripcion.trim() : `Celda para vehículos tipo ${tipo.toUpperCase()}`,
    estado,
    fechaCreacion: ahora,
    fechaActualizacion: ahora,
  };
}

/**
 * Crea un nuevo usuario del sistema (Iteración 2).
 * @param {{ tipoDocumento?: string, numeroDocumento: string, nombres: string, apellidos?: string, correo: string, telefono?: string, rol: string, activo?: boolean }} datos
 * @returns {object} Entidad Usuario
 */
export function crearUsuario({
  tipoDocumento = 'CC',
  numeroDocumento,
  nombres,
  apellidos = '',
  correo,
  telefono = '',
  rol = ROL_USUARIO.OPERADOR,
  activo = true,
}) {
  const ahora = new Date().toISOString();
  const nombresLimpios = nombres.trim();
  const apellidosLimpios = apellidos ? apellidos.trim() : '';
  const nombreCompleto = apellidosLimpios ? `${nombresLimpios} ${apellidosLimpios}` : nombresLimpios;
  const rolNormalizado = rol === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : rol;

  return {
    id: uuidv4(),
    tipoDocumento: tipoDocumento.toUpperCase().trim(),
    numeroDocumento: String(numeroDocumento).trim(),
    nombres: nombresLimpios,
    apellidos: apellidosLimpios,
    nombre: nombreCompleto, // compatibilidad con Iteración 1
    correo: correo.toLowerCase().trim(),
    telefono: telefono ? String(telefono).trim() : '',
    rol: rolNormalizado,
    activo: Boolean(activo), // compatibilidad con Iteración 1
    estado: activo ? ESTADO_USUARIO.ACTIVO : ESTADO_USUARIO.INACTIVO,
    fechaCreacion: ahora,
    fechaActualizacion: ahora,
  };
}

/**
 * Crea un registro de auditoría para una celda (Iteración 2 - RF27).
 * @param {{ celdaId: string, codigoCelda: string, accion: string, usuarioResponsableId: string, usuarioResponsableNombre?: string, motivo?: string, detalle?: string }} datos
 * @returns {object} Entidad AuditoriaCelda
 */
export function crearAuditoriaCelda({
  celdaId,
  codigoCelda,
  accion,
  usuarioResponsableId,
  usuarioResponsableNombre = 'Sistema',
  motivo = '',
  detalle = '',
}) {
  return {
    id: uuidv4(),
    celdaId,
    codigoCelda,
    accion,
    usuarioResponsableId,
    usuarioResponsableNombre,
    fecha: new Date().toISOString(),
    motivo: motivo ? motivo.trim() : '',
    detalle: detalle ? detalle.trim() : '',
  };
}

/**
 * Crea un nuevo movimiento vehicular (entrada al parqueadero - Iteración 1).
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
