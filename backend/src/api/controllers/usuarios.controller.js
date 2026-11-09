// Controlador de usuarios (Iteración 2)

import * as usuarioService from '../../application/usuario.service.js';

export async function getUsuarios(req, res) {
  const { busqueda, rol, estado } = req.query;
  const usuarios = await usuarioService.obtenerTodos({ busqueda, rol, estado });
  res.json({
    success: true,
    data: usuarios,
  });
}

export async function getUsuarioPorId(req, res) {
  const { id } = req.params;
  const usuario = await usuarioService.obtenerPorId(id);
  res.json({
    success: true,
    data: usuario,
  });
}

export async function postUsuario(req, res) {
  const nuevoUsuario = await usuarioService.registrarUsuario(req.body);
  res.status(201).json({
    success: true,
    data: nuevoUsuario,
  });
}

export async function patchUsuario(req, res) {
  const { id } = req.params;
  const actualizado = await usuarioService.actualizarUsuario(id, req.body);
  res.json({
    success: true,
    data: actualizado,
  });
}

export async function patchEstadoUsuario(req, res) {
  const { id } = req.params;
  const { activo, estado } = req.body;
  const actualizado = await usuarioService.cambiarEstadoUsuario(id, { activo, estado }, req.usuario);
  res.json({
    success: true,
    data: actualizado,
  });
}
