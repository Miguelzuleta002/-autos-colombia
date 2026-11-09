// Sidebar de navegación con soporte de roles y sesión demo (Iteración 1 y 2)

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ParkingCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
  ClipboardList,
  User,
  Users,
  Grid3X3,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import './Sidebar.css';

export default function Sidebar() {
  const { usuario, rol, esAdmin, usuariosDemo, cambiarUsuarioDemo } = useAuth();
  const [switching, setSwitching] = useState(false);

  // Menú según especificación: Resumen, Registrar entrada, Registrar salida, Movimientos, Usuarios, Celdas
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Resumen', visible: true },
    { to: '/entrada', icon: LogIn, label: 'Registrar Entrada', visible: true },
    { to: '/salida', icon: LogOut, label: 'Registrar Salida', visible: true },
    { to: '/movimientos', icon: ClipboardList, label: 'Movimientos', visible: true },
    { to: '/celdas', icon: Grid3X3, label: 'Celdas', visible: true },
    // Usuarios es visible exclusivamente para el rol Administrador
    { to: '/usuarios', icon: Users, label: 'Usuarios', visible: esAdmin },
  ];

  const handleUserChange = async (e) => {
    const newId = e.target.value;
    if (!newId || newId === usuario?.id) return;
    try {
      setSwitching(true);
      await cambiarUsuarioDemo(newId);
    } catch (err) {
      alert('Error al cambiar de usuario: ' + (err.message || 'Error'));
    } finally {
      setSwitching(false);
    }
  };

  const nombreMostrar = usuario?.nombre || `${usuario?.nombres || 'Usuario'} ${usuario?.apellidos || ''}`.trim();
  const rolMostrar = rol === 'ADMINISTRADOR' || usuario?.rol === 'ADMIN' ? 'Administrador' : 'Operador';

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <ParkingCircle size={32} className="sidebar__logo-icon" />
        <div>
          <h1 className="sidebar__title">Autos Colombia</h1>
          <span className="sidebar__subtitle">Parqueadero</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {links
          .filter((link) => link.visible)
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__divider" />

        <div className="sidebar__user">
          <div className={`sidebar__avatar ${esAdmin ? 'sidebar__avatar--admin' : ''}`}>
            <User size={18} />
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name" title={nombreMostrar}>
              {nombreMostrar || 'Cargando...'}
            </span>
            <span className={`sidebar__user-role ${esAdmin ? 'sidebar__user-role--admin' : ''}`}>
              {rolMostrar}
            </span>
          </div>
        </div>

        {/* Selector de alternancia rápida entre usuario Demo */}
        {usuariosDemo.length > 0 && (
          <div className="sidebar__demo-switch">
            <label className="sidebar__demo-label" htmlFor="demo-user-select">
              <ArrowLeftRight size={12} />
              <span>Cambiar usuario demo:</span>
            </label>
            <select
              id="demo-user-select"
              className="sidebar__demo-select"
              value={usuario?.id || ''}
              onChange={handleUserChange}
              disabled={switching}
            >
              {usuariosDemo.map((u) => {
                const r = u.rol === 'ADMIN' || u.rol === 'ADMINISTRADOR' ? 'Admin' : 'Operador';
                return (
                  <option key={u.id} value={u.id}>
                    {u.nombre || u.nombres} ({r})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <span className="sidebar__demo">Demo - Sin autenticación</span>
      </div>
    </aside>
  );
}
