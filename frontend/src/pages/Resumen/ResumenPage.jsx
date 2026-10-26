import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard.js';
import StatCard from '../../components/ui/StatCard.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { Car, CheckCircle, ArrowDownRight, ArrowUpRight, LogIn, LogOut, RefreshCw } from 'lucide-react';
import './ResumenPage.css';

export default function ResumenPage() {
  const navigate = useNavigate();
  const { summary, movimientosAbiertos, loading, error, refresh } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter open movements by search plate
  const filteredMovimientos = (movimientosAbiertos || []).filter((mov) => {
    const placa = (mov.vehiculo?.placa || mov.vehiculoPlaca || '').toUpperCase();
    return placa.includes(searchTerm.toUpperCase());
  });

  return (
    <div className="resumen-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resumen del Parqueadero</h1>
          <p className="page-subtitle">Indicadores de ocupación y vehículos actualmente en las instalaciones</p>
        </div>
        <button className="btn-secondary btn-refresh" onClick={refresh} title="Actualizar datos">
          <RefreshCw size={16} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => {}} />}

      {loading && !summary ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="stats-grid">
            <StatCard
              title="Celdas Ocupadas"
              value={`${summary?.celdasOcupadas || 0} / ${summary?.totalCeldas || 0}`}
              subtitle={`${summary?.porcentajeOcupacion || 0}% de ocupación`}
              icon={Car}
              variant="primary"
            />
            <StatCard
              title="Celdas Libres"
              value={summary?.celdasLibres || 0}
              subtitle="Listas para asignar"
              icon={CheckCircle}
              variant="success"
            />
            <StatCard
              title="Entradas Hoy"
              value={summary?.entradasHoy || 0}
              subtitle="Registros del día"
              icon={ArrowDownRight}
              variant="info"
            />
            <StatCard
              title="Salidas Hoy"
              value={summary?.salidasHoy || 0}
              subtitle="Cierres de estancia"
              icon={ArrowUpRight}
              variant="warning"
            />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card">
            <div className="quick-actions-info">
              <h3>Acciones Rápidas</h3>
              <p>Gestiona el flujo continuo de vehículos con accesos directos</p>
            </div>
            <div className="quick-actions-btns">
              <button
                className="btn btn--primary"
                onClick={() => navigate('/entrada')}
              >
                <LogIn size={18} />
                <span>Registrar Entrada</span>
              </button>
              <button
                className="btn btn--secondary"
                onClick={() => navigate('/salida')}
              >
                <LogOut size={18} />
                <span>Registrar Salida</span>
              </button>
            </div>
          </div>

          {/* Vehículos Dentro Section */}
          <div className="card vehicles-inside-card">
            <div className="card-header">
              <div className="card-header-title">
                <h2>Vehículos Dentro</h2>
                <span className="badge-count">{movimientosAbiertos.length} activos</span>
              </div>
              <div className="card-header-search">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Filtrar por placa..."
                />
              </div>
            </div>

            {filteredMovimientos.length === 0 ? (
              <EmptyState
                message={
                  searchTerm
                    ? `No se encontró ningún vehículo con la placa "${searchTerm}".`
                    : 'No hay vehículos dentro del parqueadero en este momento.'
                }
              />
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Vehículo</th>
                      <th>Color</th>
                      <th>Celda</th>
                      <th>Hora Entrada</th>
                      <th>Observación de Entrada</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovimientos.map((mov) => {
                      const vehiculo = mov.vehiculo || {};
                      const celda = mov.celda || {};
                      return (
                        <tr key={mov.id}>
                          <td>
                            <span className="placa-badge">{vehiculo.placa || mov.vehiculoPlaca}</span>
                          </td>
                          <td>
                            <strong>{vehiculo.marca}</strong> {vehiculo.modelo}
                            <span className="vehicle-type-tag">{vehiculo.tipo}</span>
                          </td>
                          <td>{vehiculo.color || '-'}</td>
                          <td>
                            <span className="celda-pill">{celda.codigo || mov.celdaCodigo}</span>
                          </td>
                          <td>{formatDateTime(mov.fechaHoraEntrada)}</td>
                          <td className="obs-cell">
                            {mov.observacionEntrada || <span className="text-muted">Sin observación</span>}
                          </td>
                          <td>
                            <button
                              className="btn-sm-action"
                              onClick={() => navigate('/salida', { state: { selectedPlaca: vehiculo.placa } })}
                            >
                              Dar Salida
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
