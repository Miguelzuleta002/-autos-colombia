// Repositorio de usuarios - operaciones CRUD sobre usuarios.json

import { readJsonFile, writeJsonFile } from '../fileManager.js';
import { FILE_PATHS } from '../../config/constants.js';

/**
 * Obtiene todos los usuarios.
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function findAll() {
  return readJsonFile(FILE_PATHS.USUARIOS);
}

/**
 * Busca un usuario por su ID.
 * @param {string} id - ID del usuario
 * @returns {Promise<object|null>} Usuario encontrado o null
 */
export async function findById(id) {
  const usuarios = await findAll();
  return usuarios.find((u) => u.id === id) || null;
}

/**
 * Obtiene el operador por defecto (primer OPERADOR activo).
 * @returns {Promise<object|null>} Usuario operador o null
 */
export async function findDefaultOperador() {
  const usuarios = await findAll();
  return usuarios.find((u) => u.rol === 'OPERADOR' && u.activo) || null;
}

/**
 * Guarda la lista completa de usuarios.
 * @param {Array} usuarios - Lista de usuarios a persistir
 */
export async function saveAll(usuarios) {
  await writeJsonFile(FILE_PATHS.USUARIOS, usuarios);
}
