// Contexto de autenticación / sesión demo para Autos Colombia (Iteración 2)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSesion = useCallback(async () => {
    try {
      const data = await api.getSesionActual();
      setSesion(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar sesión demo:', err);
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSesion();
  }, [fetchSesion]);

  const cambiarUsuarioDemo = async (usuarioId) => {
    try {
      await api.cambiarUsuarioDemo(usuarioId);
      await fetchSesion();
      return true;
    } catch (err) {
      console.error('Error al cambiar usuario demo:', err);
      throw err;
    }
  };

  const value = {
    usuario: sesion?.usuario || null,
    rol: sesion?.rol || null,
    esAdmin: Boolean(sesion?.esAdmin),
    esOperador: Boolean(sesion?.esOperador),
    usuariosDemo: sesion?.usuariosDemo || [],
    loading,
    error,
    refreshSesion: fetchSesion,
    cambiarUsuarioDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
