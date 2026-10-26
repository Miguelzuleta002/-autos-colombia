// Repositorio de movimientos - operaciones CRUD sobre movimientos.json

import { readJsonFile, writeJsonFile } from '../fileManager.js';
import { FILE_PATHS, ESTADO_MOVIMIENTO } from '../../config/constants.js';

/**
 * Obtiene todos los movimientos.
 * @returns {Promise<Array>} Lista de movimientos
 */
export async function findAll() {
  return readJsonFile(FILE_PATHS.MOVIMIENTOS);
}

/**
 * Busca un movimiento por su ID.
 * @param {string} id - ID del movimiento
 * @returns {Promise<object|null>} Movimiento encontrado o null
 */
export async function findById(id) {
  const movimientos = await findAll();
  return movimientos.find((m) => m.id === id) || null;
}

/**
 * Obtiene todos los movimientos abiertos.
 * @returns {Promise<Array>} Lista de movimientos abiertos
 */
export async function findAbiertos() {
  const movimientos = await findAll();
  return movimientos.filter((m) => m.estado === ESTADO_MOVIMIENTO.ABIERTO);
}

/**
 * Busca un movimiento abierto para un vehículo dado.
 * @param {string} vehiculoId - ID del vehículo
 * @returns {Promise<object|null>} Movimiento abierto o null
 */
export async function findAbiertoByVehiculoId(vehiculoId) {
  const movimientos = await findAll();
  return movimientos.find(
    (m) => m.vehiculoId === vehiculoId && m.estado === ESTADO_MOVIMIENTO.ABIERTO
  ) || null;
}

/**
 * Crea un nuevo movimiento.
 * @param {object} movimiento - Datos del movimiento
 * @returns {Promise<object>} Movimiento creado
 */
export async function create(movimiento) {
  const movimientos = await findAll();
  movimientos.push(movimiento);
  await saveAll(movimientos);
  return movimiento;
}

/**
 * Actualiza un movimiento existente por su ID.
 * @param {string} id - ID del movimiento
 * @param {object} updates - Campos a actualizar
 * @returns {Promise<object|null>} Movimiento actualizado o null si no existe
 */
export async function updateById(id, updates) {
  const movimientos = await findAll();
  const index = movimientos.findIndex((m) => m.id === id);
  if (index === -1) return null;

  movimientos[index] = { ...movimientos[index], ...updates };
  await saveAll(movimientos);
  return movimientos[index];
}

/**
 * Guarda la lista completa de movimientos.
 * @param {Array} movimientos - Lista de movimientos a persistir
 */
export async function saveAll(movimientos) {
  await writeJsonFile(FILE_PATHS.MOVIMIENTOS, movimientos);
}
