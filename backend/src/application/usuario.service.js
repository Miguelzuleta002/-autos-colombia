// Servicio de usuarios - lógica de negocio para gestión de usuarios y roles (Iteración 2)

import * as usuarioRepo from '../persistence/repositories/usuario.repository.js';
import { crearUsuario } from '../domain/entities.js';
import { NotFoundError, ValidationError, ConflictError } from '../domain/errors.js';
import { ROL_USUARIO, ESTADO_USUARIO } from '../config/constants.js';
import { getActiveDemoUserId, setActiveDemoUserId, resolverUsuarioActual } from '../api/middlewares/auth.js';

/**
 * Consulta y filtra la lista de usuarios.
 * @param {{ busqueda?: string, rol?: string, estado?: string }} filtros
 * @returns {Promise<Array>}
 */
export async function obtenerTodos(filtros = {}) {
  let usuarios = await usuarioRepo.findAll();

  // Filtro de búsqueda textual (nombre, apellidos, documento, correo)
  if (filtros.busqueda) {
    const term = filtros.busqueda.toLowerCase().trim();
    usuarios = usuarios.filter((u) => {
      const nombreCompleto = `${u.nombres || ''} ${u.apellidos || ''} ${u.nombre || ''}`.toLowerCase();
      const doc = String(u.numeroDocumento || '').toLowerCase();
      const correo = String(u.correo || '').toLowerCase();
      return nombreCompleto.includes(term) || doc.includes(term) || correo.includes(term);
    });
  }

  // Filtro por rol
  if (filtros.rol) {
    const rolFiltro = filtros.rol === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : filtros.rol.toUpperCase().trim();
    usuarios = usuarios.filter((u) => {
      const rolU = u.rol === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : u.rol;
      return rolU === rolFiltro;
    });
  }

  // Filtro por estado
  if (filtros.estado) {
    const estadoFiltro = filtros.estado.toUpperCase().trim();
    usuarios = usuarios.filter((u) => {
      const estadoU = u.estado || (u.activo ? ESTADO_USUARIO.ACTIVO : ESTADO_USUARIO.INACTIVO);
      return estadoU === estadoFiltro;
    });
  }

  // Ordenar: Administradores primero, luego por nombre alfabético
  usuarios.sort((a, b) => {
    if (a.rol === b.rol) {
      return (a.nombre || a.nombres).localeCompare(b.nombre || b.nombres);
    }
    return a.rol === ROL_USUARIO.ADMINISTRADOR ? -1 : 1;
  });

  return usuarios;
}

/**
 * Obtiene el detalle de un usuario por su ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function obtenerPorId(id) {
  const usuario = await usuarioRepo.findById(id);
  if (!usuario) {
    throw new NotFoundError(`No se encontró el usuario con ID "${id}"`);
  }
  return usuario;
}

/**
 * Registra un nuevo usuario en el sistema.
 * @param {object} datos
 * @returns {Promise<object>}
 */
export async function registrarUsuario(datos) {
  const { tipoDocumento = 'CC', numeroDocumento, nombres, apellidos, correo, telefono, rol } = datos;

  if (!numeroDocumento || String(numeroDocumento).trim() === '') {
    throw new ValidationError('El número de documento es obligatorio');
  }
  if (!nombres || String(nombres).trim() === '') {
    throw new ValidationError('Los nombres del usuario son obligatorios');
  }
  if (!correo || String(correo).trim() === '') {
    throw new ValidationError('El correo electrónico es obligatorio');
  }

  // Validación básica de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(correo).trim())) {
    throw new ValidationError('El formato del correo electrónico no es válido');
  }

  // Validar rol
  const rolNorm = rol === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : (rol || ROL_USUARIO.OPERADOR).toUpperCase().trim();
  if (![ROL_USUARIO.ADMINISTRADOR, ROL_USUARIO.OPERADOR].includes(rolNorm)) {
    throw new ValidationError(`Rol no válido. Permitidos: ${ROL_USUARIO.ADMINISTRADOR}, ${ROL_USUARIO.OPERADOR}`);
  }

  // Unicidad de documento
  const docExistente = await usuarioRepo.findByDocumento(numeroDocumento);
  if (docExistente) {
    throw new ConflictError(`Ya existe un usuario registrado con el documento "${numeroDocumento}"`);
  }

  // Unicidad de correo
  const correoExistente = await usuarioRepo.findByCorreo(correo);
  if (correoExistente) {
    throw new ConflictError(`Ya existe un usuario registrado con el correo "${correo.toLowerCase().trim()}"`);
  }

  const nuevoUsuario = crearUsuario({
    tipoDocumento,
    numeroDocumento,
    nombres,
    apellidos,
    correo,
    telefono,
    rol: rolNorm,
    activo: true,
  });

  return usuarioRepo.create(nuevoUsuario);
}

/**
 * Actualiza los datos o rol de un usuario existente.
 * @param {string} id
 * @param {object} datos
 * @returns {Promise<object>}
 */
export async function actualizarUsuario(id, datos) {
  const usuarioActual = await usuarioRepo.findById(id);
  if (!usuarioActual) {
    throw new NotFoundError(`No se encontró el usuario con ID "${id}"`);
  }

  const updates = {};

  if (datos.tipoDocumento) {
    updates.tipoDocumento = datos.tipoDocumento.toUpperCase().trim();
  }

  if (datos.numeroDocumento && String(datos.numeroDocumento).trim() !== '') {
    const docNorm = String(datos.numeroDocumento).trim();
    if (docNorm !== String(usuarioActual.numeroDocumento).trim()) {
      const otroDoc = await usuarioRepo.findByDocumento(docNorm);
      if (otroDoc && otroDoc.id !== id) {
        throw new ConflictError(`El documento "${docNorm}" ya está registrado por otro usuario`);
      }
      updates.numeroDocumento = docNorm;
    }
  }

  if (datos.correo && String(datos.correo).trim() !== '') {
    const correoNorm = String(datos.correo).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNorm)) {
      throw new ValidationError('El formato del correo electrónico no es válido');
    }
    if (correoNorm !== String(usuarioActual.correo).toLowerCase().trim()) {
      const otroCorreo = await usuarioRepo.findByCorreo(correoNorm);
      if (otroCorreo && otroCorreo.id !== id) {
        throw new ConflictError(`El correo "${correoNorm}" ya está registrado por otro usuario`);
      }
      updates.correo = correoNorm;
    }
  }

  if (datos.nombres) updates.nombres = datos.nombres.trim();
  if (typeof datos.apellidos !== 'undefined') updates.apellidos = datos.apellidos.trim();
  if (typeof datos.telefono !== 'undefined') updates.telefono = String(datos.telefono).trim();

  // Cambio de rol
  if (datos.rol) {
    const nuevoRol = datos.rol === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : datos.rol.toUpperCase().trim();
    if (![ROL_USUARIO.ADMINISTRADOR, ROL_USUARIO.OPERADOR].includes(nuevoRol)) {
      throw new ValidationError(`Rol no válido: ${datos.rol}`);
    }

    const rolAnterior = usuarioActual.rol === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : usuarioActual.rol;
    // Si era Administrador y se le quiere degradar a Operador:
    if (rolAnterior === ROL_USUARIO.ADMINISTRADOR && nuevoRol !== ROL_USUARIO.ADMINISTRADOR) {
      const cantAdminsActivos = await usuarioRepo.countActivosByRol(ROL_USUARIO.ADMINISTRADOR);
      const esteUsuarioEstaActivo = usuarioActual.activo || usuarioActual.estado === 'ACTIVO';
      if (esteUsuarioEstaActivo && cantAdminsActivos <= 1) {
        throw new ConflictError('No se puede retirar el rol de Administrador al único Administrador activo del sistema');
      }
    }
    updates.rol = nuevoRol;
  }

  return usuarioRepo.updateById(id, updates);
}

/**
 * Activa o desactiva un usuario.
 * @param {string} id - ID del usuario a modificar
 * @param {{ activo?: boolean, estado?: string }} param1
 * @param {object} usuarioSolicitante - Usuario que realiza la acción
 * @returns {Promise<object>}
 */
export async function cambiarEstadoUsuario(id, { activo, estado }, usuarioSolicitante) {
  const usuario = await usuarioRepo.findById(id);
  if (!usuario) {
    throw new NotFoundError(`No se encontró el usuario con ID "${id}"`);
  }

  // Determinar si el objetivo es desactivarlo
  let pasarAInactivo = false;
  if (typeof activo !== 'undefined') {
    pasarAInactivo = !Boolean(activo);
  } else if (estado) {
    pasarAInactivo = estado.toUpperCase() === 'INACTIVO';
  }

  if (pasarAInactivo) {
    // Regla 6: No permitir desactivar al usuario demo actual
    const demoIdActual = getActiveDemoUserId() || usuarioSolicitante?.id;
    if (id === demoIdActual || id === usuarioSolicitante?.id) {
      throw new ConflictError('No es posible desactivar al usuario de demostración que está actualmente en uso');
    }

    // Regla 5: Proteger al último Administrador activo
    const esAdmin = usuario.rol === 'ADMIN' || usuario.rol === ROL_USUARIO.ADMINISTRADOR;
    const estabaActivo = usuario.activo || usuario.estado === 'ACTIVO';
    if (esAdmin && estabaActivo) {
      const cantAdminsActivos = await usuarioRepo.countActivosByRol(ROL_USUARIO.ADMINISTRADOR);
      if (cantAdminsActivos <= 1) {
        throw new ConflictError('No se puede desactivar al único Administrador activo del sistema');
      }
    }
  }

  const nuevoEstado = pasarAInactivo ? ESTADO_USUARIO.INACTIVO : ESTADO_USUARIO.ACTIVO;
  return usuarioRepo.updateById(id, {
    activo: !pasarAInactivo,
    estado: nuevoEstado,
  });
}

/**
 * Obtiene la información de la sesión actual y la lista de usuarios demo disponibles.
 * @param {import('express').Request} req
 */
export async function obtenerSesionActual(req) {
  const usuarioActual = await resolverUsuarioActual(req);
  const todos = await usuarioRepo.findAll();
  const usuariosDemo = todos.filter((u) => u.activo || u.estado === 'ACTIVO');

  return {
    usuario: usuarioActual,
    usuarioId: usuarioActual?.id || null,
    rol: usuarioActual?.rol === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : usuarioActual?.rol || null,
    usuariosDemo,
    esAdmin: usuarioActual?.rol === 'ADMIN' || usuarioActual?.rol === ROL_USUARIO.ADMINISTRADOR,
    esOperador: usuarioActual?.rol === ROL_USUARIO.OPERADOR,
    aviso: 'Mecanismo de demostración local sin contraseñas para fines académicos y de prueba.',
  };
}

/**
 * Permite cambiar en caliente el usuario demo en memoria.
 * @param {string} nuevoId
 */
export async function cambiarUsuarioDemo(nuevoId) {
  if (!nuevoId) {
    throw new ValidationError('El ID del usuario es requerido');
  }
  const usuario = await usuarioRepo.findById(nuevoId);
  if (!usuario) {
    throw new NotFoundError(`No se encontró el usuario con ID "${nuevoId}"`);
  }
  setActiveDemoUserId(usuario.id);
  return usuario;
}
