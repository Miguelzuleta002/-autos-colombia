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
  getDashboard: () => request('/dashboard/summary'),
  searchVehiculos: (placa) => request(`/vehiculos?placa=${encodeURIComponent(placa)}`),
  getCeldas: (estado) => request(`/celdas${estado ? `?estado=${estado}` : ''}`),
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
