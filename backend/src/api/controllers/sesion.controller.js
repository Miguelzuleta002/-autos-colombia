// Controlador de sesión demo (Iteración 2)

import * as usuarioService from '../../application/usuario.service.js';

export async function getSesionActual(req, res) {
  const sesion = await usuarioService.obtenerSesionActual(req);
  res.json({
    success: true,
    data: sesion,
  });
}

export async function postCambiarDemo(req, res) {
  const { usuarioId } = req.body;
  const usuario = await usuarioService.cambiarUsuarioDemo(usuarioId);
  res.json({
    success: true,
    data: {
      mensaje: `Usuario de demostración cambiado a "${usuario.nombre || usuario.nombres}" (${usuario.rol})`,
      usuario,
    },
  });
}
