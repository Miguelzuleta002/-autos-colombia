import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import MovimientosTable from '../../components/shared/MovimientosTable.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { Filter, Search, RotateCcw, Download } from 'lucide-react';
import './MovimientosPage.css';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [placa, setPlaca] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [estado, setEstado] = useState('');

  const fetchMovimientos = async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMovimientos(filterParams);
      setMovimientos(data || []);
    } catch (err) {
      setError(err.message || 'Error al obtener el historial de movimientos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    fetchMovimientos({
      placa: placa.trim().toUpperCase() || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      estado: estado || undefined,
    });
  };

  const handleResetFilters = () => {
    setPlaca('');
    setFechaDesde('');
    setFechaHasta('');
    setEstado('');
    fetchMovimientos({});
  };

  return (
    <div className="movimientos-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial de Movimientos</h1>
          <p className="page-subtitle">Consulta detallada de ingresos, salidas, celdas y observaciones</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Barra de Filtros */}
      <div className="card filters-card">
        <form className="filters-form" onSubmit={handleApplyFilters}>
          <div className="filter-group">
            <label className="filter-label">Placa</label>
            <input
              type="text"
              className="filter-input"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Fecha Desde</label>
            <input
              type="date"
              className="filter-input"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Fecha Hasta</label>
            <input
              type="date"
              className="filter-input"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              className="filter-select"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="ABIERTO">Abierto (Dentro)</option>
              <option value="CERRADO">Cerrado (Salió)</option>
            </select>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-filter-submit">
              <Search size={16} />
              <span>Filtrar</span>
            </button>
            <button
              type="button"
              className="btn btn-filter-reset"
              onClick={handleResetFilters}
              title="Limpiar filtros"
            >
              <RotateCcw size={16} />
              <span>Limpiar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Resultados */}
      <div className="results-section">
        <div className="results-header">
          <span className="results-count">
            Mostrando <strong>{movimientos.length}</strong> movimientos
          </span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <MovimientosTable
            movimientos={movimientos}
            emptyMessage="No se encontraron movimientos registrados que coincidan con los criterios de búsqueda."
          />
        )}
      </div>
    </div>
  );
}
