import { NavLink } from 'react-router-dom';
import { ParkingCircle, LayoutDashboard, LogIn, LogOut, ClipboardList, User } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Resumen' },
    { to: '/entrada', icon: LogIn, label: 'Registrar Entrada' },
    { to: '/salida', icon: LogOut, label: 'Registrar Salida' },
    { to: '/movimientos', icon: ClipboardList, label: 'Movimientos' },
  ];

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
        {links.map((link) => (
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
          <div className="sidebar__avatar">
            <User size={16} />
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">Carlos Ramírez</span>
            <span className="sidebar__user-role">Operador</span>
          </div>
        </div>
        <span className="sidebar__demo">Demo - Sin autenticación</span>
      </div>
    </aside>
  );
}
