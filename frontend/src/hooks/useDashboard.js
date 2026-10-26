import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

/**
 * Hook para datos del dashboard: resumen + movimientos abiertos.
 */
export function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [movimientosAbiertos, setMovimientosAbiertos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, movimientos] = await Promise.all([
        api.getDashboard(),
        api.getMovimientosAbiertos(),
      ]);
      setSummary(summaryData);
      setMovimientosAbiertos(movimientos);
    } catch (err) {
      setError(err.message || 'Error al cargar el resumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, movimientosAbiertos, loading, error, refresh: fetchData };
}
