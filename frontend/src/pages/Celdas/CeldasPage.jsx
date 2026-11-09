// Pantalla de Gestión y Consulta de Celdas - Autos Colombia (Iteración 1 y 2)

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Alert from '../../components/ui/Alert.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import { formatDateTime, formatDuration } from '../../utils/formatters.js';
import {
  Grid3X3,
  CheckCircle,
  Car,
  Wrench,
  PlusCircle,
  Eye,
  Edit2,
  Clock,
  MapPin,
  Calendar,
  RotateCcw,
  AlertTriangle,
  History,
  Check,
} from 'lucide-react';
import './CeldasPage.css';

export default function CeldasPage() {
  const { esAdmin } = useAuth();

  const [celdas, setCeldas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');

  // Modales
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalMantenimientoOpen, setModalMantenimientoOpen] = useState(false);
  const [modalHabilitarOpen, setModalHabilitarOpen] = useState(false);

  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [detalleCompleto, setDetalleCompleto] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Formulario Nueva Celda
  const formNuevaInicial = {
    codigo: '',
    tipo: 'CARRO',
    ubicacion: 'Piso 1 - Zona A',
    descripcion: '',
  };
  const [formNueva, setFormNueva] = useState(formNuevaInicial);

  // Formulario Editar Celda
  const [formEditar, setFormEditar] = useState({
    ubicacion: '',
    tipo: 'CARRO',
    descripcion: '',
  });

  // Formulario Mantenimiento
  const [motivoMantenimiento, setMotivoMantenimiento] = useState('');
  const [detalleMantenimiento, setDetalleMantenimiento] = useState('');

  const cargarCeldas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCeldas({
        busqueda: busqueda || undefined,
        tipo: filtroTipo || undefined,
        estado: filtroEstado || undefined,
        ubicacion: filtroUbicacion || undefined,
      });
      setCeldas(data || []);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al cargar celdas',
      });
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroTipo, filtroEstado, filtroUbicacion]);

  useEffect(() => {
    cargarCeldas();
  }, [cargarCeldas]);

  // Indicadores métricos
  const totalCeldas = celdas.length;
  const celdasLibres = celdas.filter((c) => c.estado === 'LIBRE').length;
  const celdasOcupadas = celdas.filter((c) => c.estado === 'OCUPADA').length;
  const celdasMantenimiento = celdas.filter((c) => c.estado === 'MANTENIMIENTO').length;

  // Abrir modales
  const handleAbrirNueva = () => {
    setFormNueva(formNuevaInicial);
    setModalNuevaOpen(true);
  };

  const handleAbrirEditar = (celda) => {
    setCeldaSeleccionada(celda);
    setFormEditar({
      ubicacion: celda.ubicacion || '',
      tipo: celda.tipo || 'CARRO',
      descripcion: celda.descripcion || '',
    });
    setModalEditarOpen(true);
  };

  const handleAbrirDetalle = async (celda) => {
    setCeldaSeleccionada(celda);
    setModalDetalleOpen(true);
    setLoadingDetalle(true);
    try {
      const data = await api.getCelda(celda.id);
      setDetalleCompleto(data);
    } catch (err) {
      setDetalleCompleto(celda);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleAbrirMantenimiento = (celda) => {
    setCeldaSeleccionada(celda);
    setMotivoMantenimiento('');
    setDetalleMantenimiento('');
    setModalMantenimientoOpen(true);
  };

  const handleAbrirHabilitar = (celda) => {
    setCeldaSeleccionada(celda);
    setMotivoMantenimiento('');
    setModalHabilitarOpen(true);
  };

  // Enviar Nueva Celda
  const handleSubmitNueva = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setNotification(null);
    try {
      await api.crearCelda(formNueva);
      setNotification({
        type: 'success',
        message: `Celda "${formNueva.codigo.toUpperCase()}" registrada con éxito en estado LIBRE`,
      });
      setModalNuevaOpen(false);
      cargarCeldas();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al registrar la celda',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Enviar Edición
  const handleSubmitEditar = async (e) => {
    e.preventDefault();
    if (!celdaSeleccionada) return;
    setFormSubmitting(true);
    setNotification(null);
    try {
      await api.actualizarCelda(celdaSeleccionada.id, formEditar);
      setNotification({
        type: 'success',
        message: `Información de la celda "${celdaSeleccionada.codigo}" actualizada con éxito`,
      });
      setModalEditarOpen(false);
      cargarCeldas();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al actualizar la celda',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Enviar a Mantenimiento
  const handleSubmitMantenimiento = async (e) => {
    e.preventDefault();
    if (!celdaSeleccionada) return;
    setFormSubmitting(true);
    setNotification(null);
    try {
      await api.enviarCeldaMantenimiento(celdaSeleccionada.id, {
        motivo: motivoMantenimiento,
        detalle: detalleMantenimiento,
      });
      setNotification({
        type: 'warning',
        message: `La celda "${celdaSeleccionada.codigo}" ha sido enviada a MANTENIMIENTO`,
      });
      setModalMantenimientoOpen(false);
      cargarCeldas();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al enviar a mantenimiento',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Habilitar Celda
  const handleSubmitHabilitar = async () => {
    if (!celdaSeleccionada) return;
    setFormSubmitting(true);
    setNotification(null);
    try {
      await api.habilitarCelda(celdaSeleccionada.id, {
        motivo: motivoMantenimiento || 'Mantenimiento finalizado',
      });
      setNotification({
        type: 'success',
        message: `La celda "${celdaSeleccionada.codigo}" fue habilitada y ya está disponible como LIBRE`,
      });
      setModalHabilitarOpen(false);
      cargarCeldas();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al habilitar la celda',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('');
    setFiltroEstado('');
    setFiltroUbicacion('');
  };

  return (
    <div className="celdas-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Celdas</h1>
          <p className="page-subtitle">
            Monitoreo en tiempo real, asignaciones, compatibilidad y control de mantenimiento
          </p>
        </div>
        {esAdmin && (
          <button className="btn btn--primary" onClick={handleAbrirNueva}>
            <PlusCircle size={18} />
            <span>Nueva Celda</span>
          </button>
        )}
      </div>

      {notification && (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Indicadores */}
      <div className="stats-grid">
        <StatCard
          title="Total Celdas"
          value={totalCeldas}
          subtitle="Capacidad física total"
          icon={Grid3X3}
          variant="primary"
        />
        <StatCard
          title="Celdas Libres"
          value={celdasLibres}
          subtitle="Listas para asignar"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Celdas Ocupadas"
          value={celdasOcupadas}
          subtitle="Con estancia activa"
          icon={Car}
          variant="info"
        />
        <StatCard
          title="En Mantenimiento"
          value={celdasMantenimiento}
          subtitle="Fuera de servicio temporal"
          icon={Wrench}
          variant="warning"
        />
      </div>

      {/* Filtros */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Buscar celda</label>
            <SearchInput
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Código o ubicación..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Tipo / Compatibilidad</label>
            <select
              className="filter-select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="CARRO">Carro</option>
              <option value="MOTO">Moto</option>
              <option value="CAMIONETA">Camioneta</option>
              <option value="GENERAL">General (Todos)</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              className="filter-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="LIBRE">Libre</option>
              <option value="OCUPADA">Ocupada</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
            </select>
          </div>

          <div className="filter-actions">
            <button
              type="button"
              className="btn-filter-reset"
              onClick={handleLimpiarFiltros}
              title="Limpiar filtros"
            >
              <RotateCcw size={15} />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Celdas */}
      <div className="card table-card">
        <div className="card-header">
          <div className="card-header-title">
            <h2>Inventario de Celdas</h2>
            <span className="badge-count">{celdas.length} celdas</span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : celdas.length === 0 ? (
          <EmptyState
            message={
              busqueda || filtroTipo || filtroEstado || filtroUbicacion
                ? 'No se encontraron celdas que coincidan con los criterios de búsqueda.'
                : 'No hay celdas registradas en el parqueadero.'
            }
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo / Compatibilidad</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Vehículo Asociado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {celdas.map((c) => {
                  const ocupada = c.estado === 'OCUPADA';
                  const libre = c.estado === 'LIBRE';
                  const enMantenimiento = c.estado === 'MANTENIMIENTO';
                  const vehiculo = c.ocupacionActual?.vehiculo;

                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="celda-pill celda-pill--lg">{c.codigo}</span>
                      </td>
                      <td>
                        <span className={`type-tag type-tag--${c.tipo?.toLowerCase()}`}>
                          {c.tipo}
                        </span>
                      </td>
                      <td>
                        <span className="location-text">
                          <MapPin size={13} /> {c.ubicacion}
                        </span>
                      </td>
                      <td>
                        <span className={`celda-status-badge celda-status--${c.estado?.toLowerCase()}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td>
                        {ocupada && vehiculo ? (
                          <div className="vehiculo-asociado-cell">
                            <span className="placa-badge">{vehiculo.placa}</span>
                            <span className="vehiculo-mini-desc">
                              {vehiculo.marca} {vehiculo.modelo}
                            </span>
                            <span className="stay-mini-time">
                              <Clock size={11} /> {formatDuration(c.ocupacionActual.fechaHoraEntrada)}
                            </span>
                          </div>
                        ) : libre ? (
                          <span className="text-muted">Disponible</span>
                        ) : (
                          <span className="text-warning-muted">En reparación</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-icon"
                            title="Ver detalles y trazabilidad"
                            onClick={() => handleAbrirDetalle(c)}
                          >
                            <Eye size={17} />
                          </button>

                          {/* Acciones exclusivas de Administrador */}
                          {esAdmin && (
                            <>
                              <button
                                className="btn-icon btn-icon--edit"
                                title="Editar información"
                                onClick={() => handleAbrirEditar(c)}
                              >
                                <Edit2 size={17} />
                              </button>

                              {libre && (
                                <button
                                  className="btn-icon btn-icon--warning"
                                  title="Enviar a mantenimiento"
                                  onClick={() => handleAbrirMantenimiento(c)}
                                >
                                  <Wrench size={17} />
                                </button>
                              )}

                              {enMantenimiento && (
                                <button
                                  className="btn-icon btn-icon--success"
                                  title="Habilitar celda (Fin de mantenimiento)"
                                  onClick={() => handleAbrirHabilitar(c)}
                                >
                                  <Check size={17} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Nueva Celda */}
      <Modal
        isOpen={modalNuevaOpen}
        onClose={() => setModalNuevaOpen(false)}
        title="Registrar Nueva Celda"
      >
        <form onSubmit={handleSubmitNueva} className="celda-form">
          <div className="form-row form-row--2cols">
            <div className="form-group">
              <label className="form-label">Código de Celda *</label>
              <input
                type="text"
                className="form-control"
                value={formNueva.codigo}
                onChange={(e) => setFormNueva({ ...formNueva, codigo: e.target.value.toUpperCase() })}
                placeholder="Ej: B-06, D-01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo / Compatibilidad *</label>
              <select
                className="form-control"
                value={formNueva.tipo}
                onChange={(e) => setFormNueva({ ...formNueva, tipo: e.target.value })}
                required
              >
                <option value="CARRO">CARRO (Automóviles)</option>
                <option value="MOTO">MOTO (Motocicletas)</option>
                <option value="CAMIONETA">CAMIONETA</option>
                <option value="GENERAL">GENERAL (Cualquier vehículo)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ubicación *</label>
            <input
              type="text"
              className="form-control"
              value={formNueva.ubicacion}
              onChange={(e) => setFormNueva({ ...formNueva, ubicacion: e.target.value })}
              placeholder="Ej: Piso 1 - Zona B"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción (Opcional)</label>
            <textarea
              className="form-control"
              value={formNueva.descripcion}
              onChange={(e) => setFormNueva({ ...formNueva, descripcion: e.target.value })}
              placeholder="Ej: Celda cerca a la salida peatonal, techada..."
              rows={2}
            />
          </div>

          <p className="form-notice">
            * Toda celda nueva se crea automáticamente en estado <strong>LIBRE</strong> y queda disponible para
            ingresos.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setModalNuevaOpen(false)}
              disabled={formSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={formSubmitting}>
              {formSubmitting ? 'Guardando...' : 'Crear Celda'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Editar Celda */}
      <Modal
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        title={`Editar Celda ${celdaSeleccionada?.codigo || ''}`}
      >
        <form onSubmit={handleSubmitEditar} className="celda-form">
          <div className="form-row form-row--2cols">
            <div className="form-group">
              <label className="form-label">Código (No modificable)</label>
              <input
                type="text"
                className="form-control input-readonly"
                value={celdaSeleccionada?.codigo || ''}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Tipo / Compatibilidad{' '}
                {celdaSeleccionada?.estado === 'OCUPADA' && '(Bloqueado por estar ocupada)'}
              </label>
              <select
                className="form-control"
                value={formEditar.tipo}
                onChange={(e) => setFormEditar({ ...formEditar, tipo: e.target.value })}
                disabled={celdaSeleccionada?.estado === 'OCUPADA'}
              >
                <option value="CARRO">CARRO</option>
                <option value="MOTO">MOTO</option>
                <option value="CAMIONETA">CAMIONETA</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ubicación</label>
            <input
              type="text"
              className="form-control"
              value={formEditar.ubicacion}
              onChange={(e) => setFormEditar({ ...formEditar, ubicacion: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              value={formEditar.descripcion}
              onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setModalEditarOpen(false)}
              disabled={formSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={formSubmitting}>
              {formSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Detalle de Celda y Trazabilidad */}
      <Modal
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        title={`Detalle de la Celda ${celdaSeleccionada?.codigo || ''}`}
      >
        {loadingDetalle ? (
          <LoadingSpinner />
        ) : (
          detalleCompleto && (
            <div className="celda-detail-view">
              <div className="detail-header-card">
                <span className="celda-pill celda-pill--xl">{detalleCompleto.codigo}</span>
                <div>
                  <div className="detail-badges-row">
                    <span className={`type-tag type-tag--${detalleCompleto.tipo?.toLowerCase()}`}>
                      Tipo: {detalleCompleto.tipo}
                    </span>
                    <span className={`celda-status-badge celda-status--${detalleCompleto.estado?.toLowerCase()}`}>
                      {detalleCompleto.estado}
                    </span>
                  </div>
                  <span className="detail-loc-text">
                    <MapPin size={14} /> {detalleCompleto.ubicacion}
                  </span>
                </div>
              </div>

              {detalleCompleto.descripcion && (
                <div className="detail-desc-card">
                  <span className="desc-title">Descripción:</span>
                  <p>{detalleCompleto.descripcion}</p>
                </div>
              )}

              {/* Información de ocupación actual si aplica */}
              {detalleCompleto.ocupacionActual && (
                <div className="occupied-card">
                  <div className="occupied-card-title">
                    <Car size={16} />
                    <span>Vehículo Actualmente en la Celda</span>
                  </div>
                  <div className="occupied-grid">
                    <div>
                      <span className="occ-label">Placa:</span>
                      <span className="placa-badge">{detalleCompleto.ocupacionActual.vehiculo?.placa}</span>
                    </div>
                    <div>
                      <span className="occ-label">Vehículo:</span>
                      <span className="occ-val">
                        {detalleCompleto.ocupacionActual.vehiculo?.marca}{' '}
                        {detalleCompleto.ocupacionActual.vehiculo?.modelo} (
                        {detalleCompleto.ocupacionActual.vehiculo?.color})
                      </span>
                    </div>
                    <div>
                      <span className="occ-label">Hora Ingreso:</span>
                      <span className="occ-val">
                        {formatDateTime(detalleCompleto.ocupacionActual.fechaHoraEntrada)}
                      </span>
                    </div>
                    <div>
                      <span className="occ-label">Tiempo Estancia:</span>
                      <span className="occ-val text-warning-bold">
                        {formatDuration(detalleCompleto.ocupacionActual.fechaHoraEntrada)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Trazabilidad Histórica de Auditoría (RF27) */}
              <div className="audit-section">
                <div className="audit-section-header">
                  <History size={16} />
                  <span>Historial de Modificaciones y Mantenimiento (RF27)</span>
                </div>

                {!detalleCompleto.historialAuditoria || detalleCompleto.historialAuditoria.length === 0 ? (
                  <p className="no-audit-text">Sin registros de auditoría previos para esta celda.</p>
                ) : (
                  <div className="audit-timeline">
                    {detalleCompleto.historialAuditoria.map((aud) => (
                      <div key={aud.id} className="audit-item">
                        <div className="audit-dot" />
                        <div className="audit-item-content">
                          <div className="audit-item-header">
                            <span className="audit-action-tag">{aud.accion}</span>
                            <span className="audit-date">{formatDateTime(aud.fecha)}</span>
                          </div>
                          {aud.motivo && <p className="audit-motivo"><strong>Motivo:</strong> {aud.motivo}</p>}
                          {aud.detalle && <p className="audit-detalle">{aud.detalle}</p>}
                          <span className="audit-resp">Responsable: {aud.usuarioResponsableNombre || 'Sistema'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setModalDetalleOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )
        )}
      </Modal>

      {/* MODAL: Enviar a Mantenimiento */}
      <Modal
        isOpen={modalMantenimientoOpen}
        onClose={() => setModalMantenimientoOpen(false)}
        title={`Enviar a Mantenimiento — Celda ${celdaSeleccionada?.codigo || ''}`}
      >
        <form onSubmit={handleSubmitMantenimiento} className="celda-form">
          <div className="confirm-alert-box">
            <AlertTriangle size={24} className="text-warning" />
            <div>
              <h4>Puesta en Mantenimiento</h4>
              <p>
                La celda <strong>{celdaSeleccionada?.codigo}</strong> dejará de estar disponible para registrar
                nuevos ingresos hasta que sea rehabilitada.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Motivo del Mantenimiento *</label>
            <input
              type="text"
              className="form-control"
              value={motivoMantenimiento}
              onChange={(e) => setMotivoMantenimiento(e.target.value)}
              placeholder="Ej: Pintura de demarcación, reparación de luminaria..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detalles Adicionales (Opcional)</label>
            <textarea
              className="form-control"
              value={detalleMantenimiento}
              onChange={(e) => setDetalleMantenimiento(e.target.value)}
              placeholder="Ej: Bloqueo temporal por 24 horas..."
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setModalMantenimientoOpen(false)}
              disabled={formSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn--warning-action" disabled={formSubmitting}>
              {formSubmitting ? 'Procesando...' : 'Confirmar Mantenimiento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Habilitar Celda en Mantenimiento */}
      <Modal
        isOpen={modalHabilitarOpen}
        onClose={() => setModalHabilitarOpen(false)}
        title={`Habilitar Celda ${celdaSeleccionada?.codigo || ''}`}
      >
        <div className="confirm-modal-body">
          <div className="confirm-alert-box confirm-alert-box--success">
            <CheckCircle size={24} className="text-success" />
            <div>
              <h4>Rehabilitar Celda para Uso Inmediato</h4>
              <p>
                La celda <strong>{celdaSeleccionada?.codigo}</strong> pasará de <strong>MANTENIMIENTO</strong> a{' '}
                <strong>LIBRE</strong> y podrá recibir vehículos nuevamente.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nota o Motivo de Habilitación (Opcional)</label>
            <input
              type="text"
              className="form-control"
              value={motivoMantenimiento}
              onChange={(e) => setMotivoMantenimiento(e.target.value)}
              placeholder="Ej: Trabajo de pintura finalizado con éxito"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setModalHabilitarOpen(false)}
              disabled={formSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSubmitHabilitar}
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Habilitando...' : 'Habilitar Celda'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
