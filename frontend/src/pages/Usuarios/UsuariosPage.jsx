// Pantalla de Gestión de Usuarios - Autos Colombia (Iteración 2)

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Alert from '../../components/ui/Alert.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import {
  Users,
  UserPlus,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Edit2,
  Power,
  RotateCcw,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import './UsuariosPage.css';

export default function UsuariosPage() {
  const { esAdmin, usuario: usuarioActual, refreshSesion } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Modales
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalConfirmEstadoOpen, setModalConfirmEstadoOpen] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Formulario Nuevo/Edición
  const formInicial = {
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    rol: 'OPERADOR',
  };
  const [formData, setFormData] = useState(formInicial);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getUsuarios({
        busqueda: busqueda || undefined,
        rol: filtroRol || undefined,
        estado: filtroEstado || undefined,
      });
      setUsuarios(data || []);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al cargar usuarios',
      });
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroRol, filtroEstado]);

  useEffect(() => {
    if (esAdmin) {
      cargarUsuarios();
    }
  }, [cargarUsuarios, esAdmin]);

  // Si no es Administrador, mostrar mensaje de acceso restringido
  if (!esAdmin) {
    return (
      <div className="usuarios-restricted">
        <Shield size={48} className="text-warning" />
        <h2>Acceso Restringido</h2>
        <p>
          El módulo de <strong>Gestión de Usuarios</strong> es exclusivo para el rol de{' '}
          <strong>Administrador</strong>.
        </p>
        <p className="text-muted">
          Puedes cambiar al usuario demo Administrador desde la barra lateral izquierda para explorar esta
          funcionalidad.
        </p>
      </div>
    );
  }

  // Métricas de usuarios
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.rol === 'ADMINISTRADOR' || u.rol === 'ADMIN').length;
  const totalOperadores = usuarios.filter((u) => u.rol === 'OPERADOR').length;
  const totalInactivos = usuarios.filter((u) => !u.activo || u.estado === 'INACTIVO').length;

  // Manejadores
  const handleAbrirNuevo = () => {
    setFormData(formInicial);
    setModalNuevoOpen(true);
  };

  const handleAbrirEditar = (u) => {
    setUsuarioSeleccionado(u);
    setFormData({
      tipoDocumento: u.tipoDocumento || 'CC',
      numeroDocumento: u.numeroDocumento || '',
      nombres: u.nombres || u.nombre?.split(' ')[0] || '',
      apellidos: u.apellidos || u.nombre?.split(' ').slice(1).join(' ') || '',
      correo: u.correo || '',
      telefono: u.telefono || '',
      rol: u.rol === 'ADMIN' ? 'ADMINISTRADOR' : u.rol || 'OPERADOR',
    });
    setModalEditarOpen(true);
  };

  const handleAbrirDetalle = (u) => {
    setUsuarioSeleccionado(u);
    setModalDetalleOpen(true);
  };

  const handleAbrirConfirmEstado = (u) => {
    setUsuarioSeleccionado(u);
    setModalConfirmEstadoOpen(true);
  };

  // Crear usuario
  const handleSubmitNuevo = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setNotification(null);
    try {
      await api.crearUsuario(formData);
      setNotification({
        type: 'success',
        message: `Usuario "${formData.nombres} ${formData.apellidos}" registrado exitosamente`,
      });
      setModalNuevoOpen(false);
      cargarUsuarios();
      refreshSesion();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al crear el usuario',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Editar usuario
  const handleSubmitEditar = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;
    setFormSubmitting(true);
    setNotification(null);
    try {
      await api.actualizarUsuario(usuarioSeleccionado.id, formData);
      setNotification({
        type: 'success',
        message: `Información de "${formData.nombres} ${formData.apellidos}" actualizada correctamente`,
      });
      setModalEditarOpen(false);
      cargarUsuarios();
      refreshSesion();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al actualizar el usuario',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle estado (Activar / Desactivar)
  const handleConfirmarCambioEstado = async () => {
    if (!usuarioSeleccionado) return;
    const nuevoActivo = !usuarioSeleccionado.activo;
    setFormSubmitting(true);
    setNotification(null);
    try {
      await api.cambiarEstadoUsuario(usuarioSeleccionado.id, { activo: nuevoActivo });
      setNotification({
        type: 'success',
        message: `El usuario "${usuarioSeleccionado.nombre || usuarioSeleccionado.nombres}" ahora está ${
          nuevoActivo ? 'ACTIVO' : 'INACTIVO'
        }`,
      });
      setModalConfirmEstadoOpen(false);
      cargarUsuarios();
      refreshSesion();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al modificar el estado del usuario',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setFiltroRol('');
    setFiltroEstado('');
  };

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">
            Administración de operadores, roles y estados de acceso al parqueadero
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAbrirNuevo}>
          <UserPlus size={18} />
          <span>Nuevo Usuario</span>
        </button>
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
          title="Total Usuarios"
          value={totalUsuarios}
          subtitle="Registrados en el sistema"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Administradores"
          value={totalAdmins}
          subtitle="Gestión total"
          icon={Shield}
          variant="warning"
        />
        <StatCard
          title="Operadores"
          value={totalOperadores}
          subtitle="Operación de ingresos y salidas"
          icon={UserCheck}
          variant="info"
        />
        <StatCard
          title="Inactivos"
          value={totalInactivos}
          subtitle="Acceso deshabilitado"
          icon={UserX}
          variant="danger"
        />
      </div>

      {/* Filtros */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Buscar usuario</label>
            <SearchInput
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Nombre, documento o correo..."
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Rol</label>
            <select
              className="filter-select"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="OPERADOR">Operador</option>
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
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
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

      {/* Tabla de Usuarios */}
      <div className="card table-card">
        <div className="card-header">
          <div className="card-header-title">
            <h2>Listado de Usuarios</h2>
            <span className="badge-count">{usuarios.length} registrados</span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : usuarios.length === 0 ? (
          <EmptyState
            message={
              busqueda || filtroRol || filtroEstado
                ? 'No se encontraron usuarios que coincidan con los filtros aplicados.'
                : 'No hay usuarios registrados.'
            }
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const esAdminUser = u.rol === 'ADMIN' || u.rol === 'ADMINISTRADOR';
                  const iniciales = (u.nombres || u.nombre || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const estaActivo = u.activo || u.estado === 'ACTIVO';
                  const esElDemoActual = u.id === usuarioActual?.id;

                  return (
                    <tr key={u.id} className={!estaActivo ? 'row-inactive' : ''}>
                      <td>
                        <div className="user-cell">
                          <div className={`user-avatar-circle ${esAdminUser ? 'user-avatar-circle--admin' : ''}`}>
                            {iniciales}
                          </div>
                          <div>
                            <div className="user-name-strong">
                              {u.nombres} {u.apellidos || ''}
                              {esElDemoActual && <span className="demo-current-tag">Sesión actual</span>}
                            </div>
                            <span className="user-id-sub">ID: {u.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="doc-pill">
                          {u.tipoDocumento || 'CC'} {u.numeroDocumento || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="email-cell">{u.correo || '-'}</span>
                      </td>
                      <td>{u.telefono || '-'}</td>
                      <td>
                        <span className={`role-badge ${esAdminUser ? 'role-badge--admin' : 'role-badge--operador'}`}>
                          {esAdminUser ? 'Administrador' : 'Operador'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${estaActivo ? 'status-badge--active' : 'status-badge--inactive'}`}>
                          {estaActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-icon"
                            title="Ver detalles"
                            onClick={() => handleAbrirDetalle(u)}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            className="btn-icon btn-icon--edit"
                            title="Editar usuario"
                            onClick={() => handleAbrirEditar(u)}
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            className={`btn-icon ${estaActivo ? 'btn-icon--deactivate' : 'btn-icon--activate'}`}
                            title={estaActivo ? 'Desactivar usuario' : 'Activar usuario'}
                            onClick={() => handleAbrirConfirmEstado(u)}
                          >
                            <Power size={17} />
                          </button>
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

      {/* MODAL: Nuevo Usuario */}
      <Modal
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        title="Registrar Nuevo Usuario"
      >
        <form onSubmit={handleSubmitNuevo} className="user-form">
          <div className="form-row form-row--2cols">
            <div className="form-group">
              <label className="form-label">Tipo de Documento *</label>
              <select
                className="form-control"
                value={formData.tipoDocumento}
                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                required
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="TI">Tarjeta de Identidad (TI)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Documento *</label>
              <input
                type="text"
                className="form-control"
                value={formData.numeroDocumento}
                onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                placeholder="Ej: 1020304050"
                required
              />
            </div>
          </div>

          <div className="form-row form-row--2cols">
            <div className="form-group">
              <label className="form-label">Nombres *</label>
              <input
                type="text"
                className="form-control"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                placeholder="Ej: Juan Carlos"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellidos *</label>
              <input
                type="text"
                className="form-control"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                placeholder="Ej: Pérez Gómez"
                required
              />
            </div>
          </div>

          <div className="form-row form-row--2cols">
            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input
                type="email"
                className="form-control"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="usuario@autoscolombia.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input
                type="tel"
                className="form-control"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: 3101234567"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rol del Usuario *</label>
            <select
              className="form-control"
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              required
            >
              <option value="OPERADOR">Operador (Entradas, Salidas y Consulta de Celdas)</option>
              <option value="ADMINISTRADOR">Administrador (Gestión total: Usuarios, Celdas y Mantenimiento)</option>
            </select>
          </div>

          <p className="form-notice">
            * Sin contraseñas requeridas en esta iteración. El usuario se crea en estado <strong>ACTIVO</strong>.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setModalNuevoOpen(false)}
              disabled={formSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={formSubmitting}>
              {formSubmitting ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Editar Usuario */}
      <Modal
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        title="Editar Información de Usuario"
      >
        <form onSubmit={handleSubmitEditar} className="user-form">
          <div className="form-row form-row--2cols">
            <div className="form-group">
              <label className="form-label">Tipo de Documento</label>
              <select
                className="form-control"
                value={formData.tipoDocumento}
                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="TI">Tarjeta de Identidad (TI)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Documento</label>
              <input
                type="text"
                className="form-control"
                value={formData.numeroDocumento}
                onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row form-row--2cols">
            <div className="form-group">
              <label className="form-label">Nombres</label>
              <input
                type="text"
                className="form-control"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellidos</label>
              <input
                type="text"
                className="form-control"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row form-row--2cols">
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className="form-control"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rol del Usuario</label>
            <select
              className="form-control"
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
            >
              <option value="OPERADOR">Operador</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
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

      {/* MODAL: Detalle de Usuario */}
      <Modal
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        title="Detalle del Usuario"
      >
        {usuarioSeleccionado && (
          <div className="user-detail-view">
            <div className="detail-header-card">
              <div
                className={`detail-avatar ${
                  usuarioSeleccionado.rol === 'ADMIN' || usuarioSeleccionado.rol === 'ADMINISTRADOR'
                    ? 'detail-avatar--admin'
                    : ''
                }`}
              >
                {(usuarioSeleccionado.nombres || usuarioSeleccionado.nombre || 'U')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h3>
                  {usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}
                </h3>
                <span className="detail-role-tag">
                  {usuarioSeleccionado.rol === 'ADMIN' || usuarioSeleccionado.rol === 'ADMINISTRADOR'
                    ? 'Administrador del Sistema'
                    : 'Operador de Parqueadero'}
                </span>
              </div>
            </div>

            <div className="detail-fields-grid">
              <div className="detail-field">
                <span className="field-label">
                  <CreditCard size={15} /> Documento de Identidad
                </span>
                <span className="field-value">
                  {usuarioSeleccionado.tipoDocumento || 'CC'}: {usuarioSeleccionado.numeroDocumento || '-'}
                </span>
              </div>

              <div className="detail-field">
                <span className="field-label">
                  <Mail size={15} /> Correo Electrónico
                </span>
                <span className="field-value">{usuarioSeleccionado.correo || '-'}</span>
              </div>

              <div className="detail-field">
                <span className="field-label">
                  <Phone size={15} /> Teléfono
                </span>
                <span className="field-value">{usuarioSeleccionado.telefono || '-'}</span>
              </div>

              <div className="detail-field">
                <span className="field-label">
                  <Shield size={15} /> Estado en el Sistema
                </span>
                <span className="field-value">
                  <span
                    className={`status-badge ${
                      usuarioSeleccionado.activo || usuarioSeleccionado.estado === 'ACTIVO'
                        ? 'status-badge--active'
                        : 'status-badge--inactive'
                    }`}
                  >
                    {usuarioSeleccionado.activo || usuarioSeleccionado.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </span>
              </div>

              <div className="detail-field">
                <span className="field-label">
                  <Calendar size={15} /> Fecha de Creación
                </span>
                <span className="field-value">{formatDateTime(usuarioSeleccionado.fechaCreacion)}</span>
              </div>

              <div className="detail-field">
                <span className="field-label">
                  <Calendar size={15} /> Última Actualización
                </span>
                <span className="field-value">{formatDateTime(usuarioSeleccionado.fechaActualizacion)}</span>
              </div>
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
        )}
      </Modal>

      {/* MODAL: Confirmar Activar / Desactivar */}
      <Modal
        isOpen={modalConfirmEstadoOpen}
        onClose={() => setModalConfirmEstadoOpen(false)}
        title={
          usuarioSeleccionado?.activo || usuarioSeleccionado?.estado === 'ACTIVO'
            ? 'Desactivar Usuario'
            : 'Activar Usuario'
        }
      >
        {usuarioSeleccionado && (
          <div className="confirm-modal-body">
            <div className="confirm-alert-box">
              <AlertTriangle size={24} className="text-warning" />
              <div>
                <h4>
                  ¿Confirmas que deseas{' '}
                  {usuarioSeleccionado.activo || usuarioSeleccionado.estado === 'ACTIVO'
                    ? 'DESACTIVAR'
                    : 'ACTIVAR'}{' '}
                  a este usuario?
                </h4>
                <p>
                  <strong>{usuarioSeleccionado.nombre || usuarioSeleccionado.nombres}</strong> (
                  {usuarioSeleccionado.rol})
                </p>
              </div>
            </div>

            <p className="confirm-explanation">
              {usuarioSeleccionado.activo || usuarioSeleccionado.estado === 'ACTIVO'
                ? 'Un usuario inactivo no podrá registrar nuevas entradas ni salidas, ni realizar operaciones administrativas. Sus registros históricos y referencias en movimientos pasados se conservarán intactos.'
                : 'Al activarlo, el usuario recuperará el acceso para participar en las operaciones del parqueadero de acuerdo con su rol asignado.'}
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setModalConfirmEstadoOpen(false)}
                disabled={formSubmitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`btn ${
                  usuarioSeleccionado.activo || usuarioSeleccionado.estado === 'ACTIVO'
                    ? 'btn--danger'
                    : 'btn--primary'
                }`}
                onClick={handleConfirmarCambioEstado}
                disabled={formSubmitting}
              >
                {formSubmitting
                  ? 'Procesando...'
                  : usuarioSeleccionado.activo || usuarioSeleccionado.estado === 'ACTIVO'
                  ? 'Confirmar Desactivación'
                  : 'Confirmar Activación'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
