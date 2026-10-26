// Servicio de movimientos - lógica de negocio para entradas y salidas de vehículos

import * as vehiculoRepo from '../persistence/repositories/vehiculo.repository.js';
import * as celdaRepo from '../persistence/repositories/celda.repository.js';
import * as movimientoRepo from '../persistence/repositories/movimiento.repository.js';
import * as usuarioRepo from '../persistence/repositories/usuario.repository.js';
import * as clienteRepo from '../persistence/repositories/cliente.repository.js';
import { crearMovimiento } from '../domain/entities.js';
import { NotFoundError, ValidationError, ConflictError } from '../domain/errors.js';
import { ESTADO_CELDA, ESTADO_MOVIMIENTO } from '../config/constants.js';

/**
 * Resuelve el ID del operador: usa el proporcionado o el operador por defecto.
 * @param {string|undefined} operadorId
 * @returns {Promise<string>} ID del operador válido
 */
async function resolverOperadorId(operadorId) {
  if (operadorId) {
    const operador = await usuarioRepo.findById(operadorId);
    if (!operador) {
      throw new NotFoundError(`Operador con ID "${operadorId}" no encontrado`);
    }
    return operador.id;
  }

  const operadorDefault = await usuarioRepo.findDefaultOperador();
  if (!operadorDefault) {
    throw new NotFoundError('No se encontró un operador por defecto en el sistema');
  }
  return operadorDefault.id;
}

/**
 * Poblar un movimiento con los datos relacionados (vehículo, cliente, celda, operadores).
 * @param {object} movimiento - Movimiento a poblar
 * @returns {Promise<object>} Movimiento con datos poblados
 */
export async function poblarMovimiento(movimiento) {
  const [vehiculo, celda, operadorEntrada, operadorSalida] = await Promise.all([
    vehiculoRepo.findById(movimiento.vehiculoId),
    celdaRepo.findById(movimiento.celdaId),
    usuarioRepo.findById(movimiento.operadorEntradaId),
    movimiento.operadorSalidaId
      ? usuarioRepo.findById(movimiento.operadorSalidaId)
      : Promise.resolve(null),
  ]);

  // Poblar cliente del vehículo
  let cliente = null;
  if (vehiculo) {
    cliente = await clienteRepo.findById(vehiculo.clienteId);
  }

  return {
    ...movimiento,
    vehiculo: vehiculo ? { ...vehiculo, cliente } : null,
    celda: celda || null,
    operadorEntrada: operadorEntrada || null,
    operadorSalida: operadorSalida || null,
  };
}

/**
 * Registra la entrada de un vehículo al parqueadero.
 * @param {{ placa: string, celdaId: string, observacionEntrada?: string, operadorId?: string }} datos
 * @returns {Promise<object>} Movimiento creado con datos poblados
 */
export async function registrarEntrada({ placa, celdaId, observacionEntrada, operadorId }) {
  // Validar placa
  if (!placa || typeof placa !== 'string' || placa.trim() === '') {
    throw new ValidationError('La placa del vehículo es requerida');
  }

  const placaNorm = placa.toUpperCase().trim();

  // Validar que el vehículo exista
  const vehiculo = await vehiculoRepo.findByPlaca(placaNorm);
  if (!vehiculo) {
    throw new NotFoundError(`No se encontró un vehículo con placa "${placaNorm}"`);
  }

  // Validar que el vehículo esté activo
  if (!vehiculo.activo) {
    throw new ValidationError(`El vehículo con placa "${placaNorm}" está inactivo`);
  }

  // Validar que no tenga un movimiento abierto
  const movimientoAbierto = await movimientoRepo.findAbiertoByVehiculoId(vehiculo.id);
  if (movimientoAbierto) {
    throw new ConflictError(`El vehículo con placa "${placaNorm}" ya tiene un ingreso activo`);
  }

  // Validar celda
  if (!celdaId || typeof celdaId !== 'string' || celdaId.trim() === '') {
    throw new ValidationError('El ID de la celda es requerido');
  }

  const celda = await celdaRepo.findById(celdaId);
  if (!celda) {
    throw new NotFoundError(`No se encontró la celda con ID "${celdaId}"`);
  }

  if (celda.estado !== ESTADO_CELDA.LIBRE) {
    throw new ConflictError(`La celda "${celda.codigo}" no está disponible (estado actual: ${celda.estado})`);
  }

  // Resolver operador
  const operadorResueldoId = await resolverOperadorId(operadorId);

  // Crear movimiento
  const nuevoMovimiento = crearMovimiento({
    vehiculoId: vehiculo.id,
    celdaId: celda.id,
    operadorEntradaId: operadorResueldoId,
    observacionEntrada: observacionEntrada || null,
  });

  // Guardar movimiento y actualizar celda a OCUPADA
  // Si algún paso falla, el otro no se ejecuta (secuencial para rollback)
  try {
    await movimientoRepo.create(nuevoMovimiento);
    await celdaRepo.updateById(celda.id, { estado: ESTADO_CELDA.OCUPADA });
  } catch (error) {
    // Rollback: intentar eliminar el movimiento creado si la celda falló
    try {
      const movimientos = await movimientoRepo.findAll();
      const sinNuevo = movimientos.filter((m) => m.id !== nuevoMovimiento.id);
      await movimientoRepo.saveAll(sinNuevo);
      // Restaurar estado de celda si ya se había cambiado
      await celdaRepo.updateById(celda.id, { estado: ESTADO_CELDA.LIBRE });
    } catch {
      // Si el rollback también falla, loguear para depuración
      console.error('Error en rollback de entrada:', error);
    }
    throw error;
  }

  return poblarMovimiento(nuevoMovimiento);
}

/**
 * Registra la salida de un vehículo del parqueadero.
 * @param {string} movimientoId - ID del movimiento a cerrar
 * @param {{ observacionSalida?: string, operadorId?: string }} datos
 * @returns {Promise<object>} Movimiento actualizado con datos poblados
 */
export async function registrarSalida(movimientoId, { observacionSalida, operadorId }) {
  // Validar que el movimiento exista
  const movimiento = await movimientoRepo.findById(movimientoId);
  if (!movimiento) {
    throw new NotFoundError(`No se encontró el movimiento con ID "${movimientoId}"`);
  }

  // Validar que esté abierto
  if (movimiento.estado !== ESTADO_MOVIMIENTO.ABIERTO) {
    throw new ConflictError('Este movimiento ya fue cerrado (el vehículo ya salió)');
  }

  // Resolver operador
  const operadorResueldoId = await resolverOperadorId(operadorId);

  // Datos de cierre
  const datosSalida = {
    operadorSalidaId: operadorResueldoId,
    fechaHoraSalida: new Date().toISOString(),
    observacionSalida: observacionSalida || null,
    estado: ESTADO_MOVIMIENTO.CERRADO,
  };

  // Actualizar movimiento y liberar celda
  try {
    const movimientoActualizado = await movimientoRepo.updateById(movimientoId, datosSalida);
    await celdaRepo.updateById(movimiento.celdaId, { estado: ESTADO_CELDA.LIBRE });
    return poblarMovimiento(movimientoActualizado);
  } catch (error) {
    // Rollback: restaurar el movimiento a su estado original
    try {
      await movimientoRepo.updateById(movimientoId, {
        operadorSalidaId: null,
        fechaHoraSalida: null,
        observacionSalida: null,
        estado: ESTADO_MOVIMIENTO.ABIERTO,
      });
      await celdaRepo.updateById(movimiento.celdaId, { estado: ESTADO_CELDA.OCUPADA });
    } catch {
      console.error('Error en rollback de salida:', error);
    }
    throw error;
  }
}

/**
 * Obtiene los movimientos abiertos con datos poblados.
 * @returns {Promise<Array>} Lista de movimientos abiertos poblados
 */
export async function obtenerAbiertos() {
  const abiertos = await movimientoRepo.findAbiertos();
  return Promise.all(abiertos.map(poblarMovimiento));
}

/**
 * Obtiene todos los movimientos con filtros opcionales, poblados y ordenados.
 * @param {{ placa?: string, fechaDesde?: string, fechaHasta?: string, estado?: string }} filtros
 * @returns {Promise<Array>} Lista de movimientos filtrados y poblados
 */
export async function obtenerTodos(filtros = {}) {
  let movimientos = await movimientoRepo.findAll();

  // Filtrar por estado
  if (filtros.estado) {
    movimientos = movimientos.filter((m) => m.estado === filtros.estado.toUpperCase());
  }

  // Filtrar por fecha desde
  if (filtros.fechaDesde) {
    movimientos = movimientos.filter((m) => m.fechaHoraEntrada >= filtros.fechaDesde);
  }

  // Filtrar por fecha hasta
  if (filtros.fechaHasta) {
    movimientos = movimientos.filter((m) => m.fechaHoraEntrada <= filtros.fechaHasta);
  }

  // Poblar todos los movimientos
  let poblados = await Promise.all(movimientos.map(poblarMovimiento));

  // Filtrar por placa (parcial, case-insensitive) — se filtra después de poblar
  if (filtros.placa) {
    const term = filtros.placa.toUpperCase().trim();
    poblados = poblados.filter((m) => m.vehiculo && m.vehiculo.placa.includes(term));
  }

  // Ordenar por fecha de entrada descendente (más reciente primero)
  poblados.sort((a, b) => new Date(b.fechaHoraEntrada) - new Date(a.fechaHoraEntrada));

  return poblados;
}

/**
 * Obtiene un movimiento por su ID con datos poblados.
 * @param {string} id - ID del movimiento
 * @returns {Promise<object>} Movimiento poblado
 */
export async function obtenerPorId(id) {
  const movimiento = await movimientoRepo.findById(id);
  if (!movimiento) {
    throw new NotFoundError(`No se encontró el movimiento con ID "${id}"`);
  }
  return poblarMovimiento(movimiento);
}
