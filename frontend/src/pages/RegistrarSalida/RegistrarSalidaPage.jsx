import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../api/client.js';
import SearchInput from '../../components/ui/SearchInput.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { formatDateTime, formatDuration } from '../../utils/formatters.js';
import { LogOut, Car, MapPin, Calendar, Clock, User, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import './RegistrarSalidaPage.css';

export default function RegistrarSalidaPage() {
  const location = useLocation();
  const initialPlaca = location.state?.selectedPlaca || '';

  const [movimientosAbiertos, setMovimientosAbiertos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPlaca, setSearchPlaca] = useState(initialPlaca);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);

  const [observacionSalida, setObservacionSalida] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Cargar vehículos dentro
  const loadAbiertos = async () => {
    setLoading(true);
    try {
      const data = await api.getMovimientosAbiertos();
      setMovimientosAbiertos(data || []);

      // Si viene una placa preseleccionada por navegación
      if (initialPlaca) {
        const pre = data.find(
          (m) => (m.vehiculo?.placa || m.vehiculoPlaca || '').toUpperCase() === initialPlaca.toUpperCase()
        );
        if (pre) setSelectedMovimiento(pre);
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al cargar vehículos dentro.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbiertos();
  }, []);

  // Filtrar movimientos por búsqueda
  const filteredList = movimientosAbiertos.filter((mov) => {
    const placa = (mov.vehiculo?.placa || mov.vehiculoPlaca || '').toUpperCase();
    return placa.includes(searchPlaca.toUpperCase());
  });

  // Manejar registro de salida
  const handleSubmitSalida = async () => {
    if (!selectedMovimiento) return;

    setSubmitting(true);
    setNotification(null);

    try {
      await api.registrarSalida(selectedMovimiento.id, {
        observacionSalida: observacionSalida.trim() || undefined,
      });

      const placa = selectedMovimiento.vehiculo?.placa || selectedMovimiento.vehiculoPlaca;
      const celda = selectedMovimiento.celda?.codigo || selectedMovimiento.celdaCodigo;

      setNotification({
        type: 'success',
        message: `¡Salida registrada exitosamente! El vehículo ${placa} ha salido y la celda ${celda} quedó LIBRE.`,
      });

      // Limpiar selección
      setSelectedMovimiento(null);
      setObservacionSalida('');
      // Refrescar lista
      loadAbiertos();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'No fue posible registrar la salida del vehículo.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registrar-salida-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar Salida de Vehículo</h1>
          <p className="page-subtitle">Cierre de estancia, registro de observaciones y liberación inmediata de celda</p>
        </div>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="salida-layout">
        {/* Columna Izquierda: Lista de Vehículos Adentro */}
        <div className="salida-list-col">
          <div className="card salida-card">
            <div className="salida-list-header">
              <div>
                <h2 className="card-section-title">Vehículos Actualmente Dentro</h2>
                <p className="card-section-desc">Seleccione el vehículo que se dispone a salir</p>
              </div>
              <span className="badge-count">{movimientosAbiertos.length} en parqueadero</span>
            </div>

            <div className="search-box-row">
              <SearchInput
                value={searchPlaca}
                onChange={setSearchPlaca}
                placeholder="Filtrar por placa..."
              />
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : filteredList.length === 0 ? (
              <EmptyState
                message={
                  searchPlaca
                    ? `No se encontró ningún vehículo activo con la placa "${searchPlaca}".`
                    : 'No hay vehículos dentro del parqueadero en este momento.'
                }
              />
            ) : (
              <div className="vehiculos-adentro-list">
                {filteredList.map((mov) => {
                  const isSelected = selectedMovimiento?.id === mov.id;
                  const vehiculo = mov.vehiculo || {};
                  const celda = mov.celda || {};
                  const estancia = formatDuration(mov.fechaHoraEntrada);

                  return (
                    <div
                      key={mov.id}
                      className={`vehiculo-card-item ${isSelected ? 'vehiculo-card-item--selected' : ''}`}
                      onClick={() => {
                        setSelectedMovimiento(mov);
                        setObservacionSalida('');
                      }}
                    >
                      <div className="item-main-info">
                        <div className="item-placa-row">
                          <span className="placa-badge">{vehiculo.placa || mov.vehiculoPlaca}</span>
                          <span className="celda-pill">{celda.codigo || mov.celdaCodigo}</span>
                        </div>
                        <span className="item-desc">
                          {vehiculo.marca} {vehiculo.modelo} ({vehiculo.color})
                        </span>
                      </div>

                      <div className="item-meta-info">
                        <span className="item-meta-time">
                          <Clock size={13} /> {estancia}
                        </span>
                        <span className="item-meta-date">
                          Entrada: {formatDateTime(mov.fechaHoraEntrada)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Detalle de Estancia y Cierre */}
        <div className="salida-detail-col">
          {selectedMovimiento ? (
            <div className="card salida-action-card">
              <div className="action-header">
                <span className="action-tag">Confirmación de Salida</span>
                <span className="placa-badge placa-badge--lg">
                  {selectedMovimiento.vehiculo?.placa || selectedMovimiento.vehiculoPlaca}
                </span>
              </div>

              <div className="stay-summary-grid">
                <div className="stay-item">
                  <span className="stay-label"><Car size={15} /> Vehículo</span>
                  <span className="stay-value">
                    {selectedMovimiento.vehiculo?.marca} {selectedMovimiento.vehiculo?.modelo} ({selectedMovimiento.vehiculo?.tipo})
                  </span>
                </div>

                <div className="stay-item">
                  <span className="stay-label"><MapPin size={15} /> Celda que se liberará</span>
                  <span className="stay-value text-primary-bold">
                    {selectedMovimiento.celda?.codigo || selectedMovimiento.celdaCodigo} ({selectedMovimiento.celda?.ubicacion})
                  </span>
                </div>

                <div className="stay-item">
                  <span className="stay-label"><Calendar size={15} /> Fecha y Hora Ingreso</span>
                  <span className="stay-value">{formatDateTime(selectedMovimiento.fechaHoraEntrada)}</span>
                </div>

                <div className="stay-item">
                  <span className="stay-label"><Clock size={15} /> Tiempo de Estancia</span>
                  <span className="stay-value stay-duration-highlight">
                    {formatDuration(selectedMovimiento.fechaHoraEntrada)}
                  </span>
                </div>

                <div className="stay-item">
                  <span className="stay-label"><User size={15} /> Operador Ingreso</span>
                  <span className="stay-value">
                    {selectedMovimiento.operadorEntrada?.nombre || 'Carlos Ramírez'}
                  </span>
                </div>

                <div className="stay-item">
                  <span className="stay-label"><User size={15} /> Operador Salida</span>
                  <span className="stay-value">Carlos Ramírez (Demo)</span>
                </div>
              </div>

              {/* Observación de entrada registrada anteriormente */}
              <div className="entry-obs-box">
                <div className="entry-obs-header">
                  <MessageSquare size={14} />
                  <span>Observación registrada en la entrada:</span>
                </div>
                <p className="entry-obs-text">
                  {selectedMovimiento.observacionEntrada || 'Sin novedades registradas al ingresar.'}
                </p>
              </div>

              {/* Campo para nueva observación de salida */}
              <div className="exit-obs-section">
                <label className="exit-obs-label">
                  Observaciones de Salida (Opcional)
                </label>
                <textarea
                  className="textarea-obs"
                  value={observacionSalida}
                  onChange={(e) => setObservacionSalida(e.target.value)}
                  placeholder="Ej: Vehículo se retira sin novedades, entrega conforme..."
                  rows={3}
                  maxLength={300}
                />
                <span className="char-counter">{observacionSalida.length} / 300 caracteres</span>
              </div>

              {/* Aviso de liberación */}
              <div className="release-notice">
                <AlertTriangle size={18} className="text-warning" />
                <span>
                  Al registrar la salida, la celda <strong>{selectedMovimiento.celda?.codigo || selectedMovimiento.celdaCodigo}</strong> se marcará automáticamente como <strong>LIBRE</strong>.
                </span>
              </div>

              {/* Botón de Salida */}
              <button
                className="btn-submit-salida"
                onClick={handleSubmitSalida}
                disabled={submitting}
              >
                <LogOut size={20} />
                <span>{submitting ? 'Procesando salida...' : 'Confirmar y Registrar Salida'}</span>
              </button>
            </div>
          ) : (
            <div className="card no-selection-card">
              <LogOut size={48} className="no-selection-icon" />
              <h3>Ningún vehículo seleccionado</h3>
              <p>Haga clic sobre un vehículo de la lista para ver su estancia y gestionar la salida.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
