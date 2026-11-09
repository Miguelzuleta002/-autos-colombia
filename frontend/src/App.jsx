// Aplicación principal Autos Colombia - Rutas de Iteración 1 y 2

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import ResumenPage from './pages/Resumen/ResumenPage.jsx';
import RegistrarEntradaPage from './pages/RegistrarEntrada/RegistrarEntradaPage.jsx';
import RegistrarSalidaPage from './pages/RegistrarSalida/RegistrarSalidaPage.jsx';
import MovimientosPage from './pages/Movimientos/MovimientosPage.jsx';
import UsuariosPage from './pages/Usuarios/UsuariosPage.jsx';
import CeldasPage from './pages/Celdas/CeldasPage.jsx';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="content-container">
            <Routes>
              <Route path="/" element={<ResumenPage />} />
              <Route path="/entrada" element={<RegistrarEntradaPage />} />
              <Route path="/salida" element={<RegistrarSalidaPage />} />
              <Route path="/movimientos" element={<MovimientosPage />} />
              <Route path="/celdas" element={<CeldasPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
