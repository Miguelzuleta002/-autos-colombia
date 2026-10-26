import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar.jsx';
import ResumenPage from './pages/Resumen/ResumenPage.jsx';
import RegistrarEntradaPage from './pages/RegistrarEntrada/RegistrarEntradaPage.jsx';
import RegistrarSalidaPage from './pages/RegistrarSalida/RegistrarSalidaPage.jsx';
import MovimientosPage from './pages/Movimientos/MovimientosPage.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="content-container">
          <Routes>
            <Route path="/" element={<ResumenPage />} />
            <Route path="/entrada" element={<RegistrarEntradaPage />} />
            <Route path="/salida" element={<RegistrarSalidaPage />} />
            <Route path="/movimientos" element={<MovimientosPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
