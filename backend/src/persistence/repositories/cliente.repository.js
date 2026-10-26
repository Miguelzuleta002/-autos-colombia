// Repositorio de clientes - operaciones CRUD sobre clientes.json

import { readJsonFile, writeJsonFile } from '../fileManager.js';
import { FILE_PATHS } from '../../config/constants.js';

/**
 * Obtiene todos los clientes.
 * @returns {Promise<Array>} Lista de clientes
 */
export async function findAll() {
  return readJsonFile(FILE_PATHS.CLIENTES);
}

/**
 * Busca un cliente por su ID.
 * @param {string} id - ID del cliente
 * @returns {Promise<object|null>} Cliente encontrado o null
 */
export async function findById(id) {
  const clientes = await findAll();
  return clientes.find((c) => c.id === id) || null;
}

/**
 * Busca un cliente por su cédula.
 * @param {string} cedula - Número de cédula
 * @returns {Promise<object|null>} Cliente encontrado o null
 */
export async function findByCedula(cedula) {
  const clientes = await findAll();
  return clientes.find((c) => c.cedula === cedula) || null;
}

/**
 * Guarda la lista completa de clientes.
 * @param {Array} clientes - Lista de clientes a persistir
 */
export async function saveAll(clientes) {
  await writeJsonFile(FILE_PATHS.CLIENTES, clientes);
}
