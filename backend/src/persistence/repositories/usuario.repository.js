// Repositorio de usuarios - operaciones CRUD sobre usuarios.json (Iteración 1 y 2)

import { readJsonFile, writeJsonFile } from '../fileManager.js';
import { FILE_PATHS, ROL_USUARIO } from '../../config/constants.js';

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
 * Busca un usuario por su número de documento.
 * @param {string} numeroDocumento
 * @returns {Promise<object|null>}
 */
export async function findByDocumento(numeroDocumento) {
  if (!numeroDocumento) return null;
  const docLimpio = String(numeroDocumento).trim();
  const usuarios = await findAll();
  return usuarios.find((u) => String(u.numeroDocumento || '').trim() === docLimpio) || null;
}

/**
 * Busca un usuario por su correo electrónico.
 * @param {string} correo
 * @returns {Promise<object|null>}
 */
export async function findByCorreo(correo) {
  if (!correo) return null;
  const correoLimpio = String(correo).toLowerCase().trim();
  const usuarios = await findAll();
  return usuarios.find((u) => String(u.correo || '').toLowerCase().trim() === correoLimpio) || null;
}

/**
 * Obtiene el operador por defecto (primer OPERADOR activo).
 * @returns {Promise<object|null>} Usuario operador o null
 */
export async function findDefaultOperador() {
  const usuarios = await findAll();
  return usuarios.find((u) => (u.rol === ROL_USUARIO.OPERADOR || u.rol === 'OPERADOR') && (u.activo || u.estado === 'ACTIVO')) || null;
}

/**
 * Obtiene el administrador por defecto (primer ADMINISTRADOR activo).
 * @returns {Promise<object|null>} Usuario administrador o null
 */
export async function findDefaultAdmin() {
  const usuarios = await findAll();
  return usuarios.find((u) => (u.rol === ROL_USUARIO.ADMINISTRADOR || u.rol === 'ADMIN' || u.rol === 'ADMINISTRADOR') && (u.activo || u.estado === 'ACTIVO')) || null;
}

/**
 * Cuenta cuántos usuarios activos existen con un rol determinado.
 * @param {string} rol - ADMINISTRADOR u OPERADOR
 * @returns {Promise<number>}
 */
export async function countActivosByRol(rol) {
  const usuarios = await findAll();
  const targetRol = (rol === 'ADMIN' || rol === ROL_USUARIO.ADMINISTRADOR) ? ['ADMIN', 'ADMINISTRADOR'] : [rol];
  return usuarios.filter((u) => targetRol.includes(u.rol) && (u.activo || u.estado === 'ACTIVO')).length;
}

/**
 * Agrega un nuevo usuario a la colección.
 * @param {object} nuevoUsuario
 * @returns {Promise<object>}
 */
export async function create(nuevoUsuario) {
  const usuarios = await findAll();
  usuarios.push(nuevoUsuario);
  await saveAll(usuarios);
  return nuevoUsuario;
}

/**
 * Actualiza un usuario existente por su ID.
 * @param {string} id - ID del usuario
 * @param {object} updates - Datos a actualizar
 * @returns {Promise<object|null>}
 */
export async function updateById(id, updates) {
  const usuarios = await findAll();
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const usuarioActual = usuarios[index];
  const actualizado = {
    ...usuarioActual,
    ...updates,
    fechaActualizacion: new Date().toISOString(),
  };

  // Mantener coherencia entre activo (boolean) y estado (string)
  if (typeof updates.activo !== 'undefined') {
    actualizado.activo = Boolean(updates.activo);
    actualizado.estado = actualizado.activo ? 'ACTIVO' : 'INACTIVO';
  } else if (typeof updates.estado !== 'undefined') {
    actualizado.estado = updates.estado;
    actualizado.activo = updates.estado === 'ACTIVO';
  }

  // Mantener coherencia en nombre completo si se actualizan nombres/apellidos
  if (updates.nombres || updates.apellidos) {
    const nom = (updates.nombres || usuarioActual.nombres || '').trim();
    const ape = (updates.apellidos || usuarioActual.apellidos || '').trim();
    actualizado.nombre = ape ? `${nom} ${ape}` : nom;
  }

  usuarios[index] = actualizado;
  await saveAll(usuarios);
  return actualizado;
}

/**
 * Guarda la lista completa de usuarios.
 * @param {Array} usuarios - Lista de usuarios a persistir
 */
export async function saveAll(usuarios) {
  await writeJsonFile(FILE_PATHS.USUARIOS, usuarios);
}
