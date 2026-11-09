// Cliente API centralizado para Autos Colombia - Iteración 1 y 2

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  const response = await fetch(url, config);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Error desconocido');
  }
  return data.data;
}

export const api = {
  // --- Sesión Demo (Iteración 2) ---
  getSesionActual: () => request('/sesion/actual'),
  cambiarUsuarioDemo: (usuarioId) =>
    request('/sesion/cambiar-demo', {
      method: 'POST',
      body: JSON.stringify({ usuarioId }),
    }),

  // --- Dashboard ---
  getDashboard: () => request('/dashboard/summary'),

  // --- Vehículos ---
  searchVehiculos: (placa) => request(`/vehiculos?placa=${encodeURIComponent(placa)}`),

  // --- Celdas (Iteración 1 y 2) ---
  getCeldas: (filtros = {}) => {
    // Si viene como string 'LIBRE' por compatibilidad con Iteración 1:
    if (typeof filtros === 'string') {
      return request(`/celdas?estado=${encodeURIComponent(filtros)}`);
    }
    const params = new URLSearchParams();
    if (filtros.estado) params.set('estado', filtros.estado);
    if (filtros.tipo) params.set('tipo', filtros.tipo);
    if (filtros.ubicacion) params.set('ubicacion', filtros.ubicacion);
    if (filtros.busqueda) params.set('busqueda', filtros.busqueda);
    if (filtros.codigo) params.set('codigo', filtros.codigo);
    const qs = params.toString();
    return request(`/celdas${qs ? `?${qs}` : ''}`);
  },
  getCelda: (id) => request(`/celdas/${id}`),
  crearCelda: (data) =>
    request('/celdas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  actualizarCelda: (id, data) =>
    request(`/celdas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  enviarCeldaMantenimiento: (id, data) =>
    request(`/celdas/${id}/mantenimiento`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  habilitarCelda: (id, data = {}) =>
    request(`/celdas/${id}/habilitar`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // --- Usuarios (Iteración 2) ---
  getUsuarios: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.busqueda) params.set('busqueda', filtros.busqueda);
    if (filtros.rol) params.set('rol', filtros.rol);
    if (filtros.estado) params.set('estado', filtros.estado);
    const qs = params.toString();
    return request(`/usuarios${qs ? `?${qs}` : ''}`);
  },
  getUsuario: (id) => request(`/usuarios/${id}`),
  crearUsuario: (data) =>
    request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  actualizarUsuario: (id, data) =>
    request(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  cambiarEstadoUsuario: (id, data) =>
    request(`/usuarios/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // --- Movimientos (Iteración 1) ---
  getMovimientosAbiertos: () => request('/movimientos/abiertos'),
  getMovimientos: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.placa) params.set('placa', filters.placa);
    if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta);
    if (filters.estado) params.set('estado', filters.estado);
    const qs = params.toString();
    return request(`/movimientos${qs ? `?${qs}` : ''}`);
  },
  getMovimiento: (id) => request(`/movimientos/${id}`),
  registrarEntrada: (data) =>
    request('/movimientos/entrada', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  registrarSalida: (id, data) =>
    request(`/movimientos/${id}/salida`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
