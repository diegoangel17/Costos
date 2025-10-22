import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CUENTAS_INICIALES } from '../constants';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('menu');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [cuentasCatalogo, setCuentasCatalogo] = useState(CUENTAS_INICIALES);
  const [reports, setReports] = useState([]);
  const [hasLoadedCuentas, setHasLoadedCuentas] = useState(false);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);
  
  const [reportData, setReportData] = useState({
    name: '',
    type: '',
    date: new Date().toISOString().split('T')[0]
  });

  const API_URL = 'http://localhost:5000/api';

  // Cargar catálogo de cuentas - memoizado con useCallback
  const loadCuentasCatalogo = useCallback(async () => {
    // Evitar cargar múltiples veces
    if (hasLoadedCuentas) return;
    
    try {
      setHasLoadedCuentas(true);
      const response = await fetch(`${API_URL}/cuentas`);
      const data = await response.json();
      
      if (data.success && data.cuentas) {
        setCuentasCatalogo(data.cuentas.map(c => ({
          cuenta: c.cuenta,
          clasificacion: c.clasificacion
        })));
      }
    } catch (error) {
      console.error('Error al cargar catálogo de cuentas:', error);
      setHasLoadedCuentas(false);
    }
  }, [hasLoadedCuentas]);

  // Cargar reportes del usuario - memoizado con useCallback
  const loadUserReports = useCallback(async (userId) => {
    // Evitar cargar múltiples veces para el mismo usuario
    if (hasLoadedReports) return;
    
    try {
      setHasLoadedReports(true);
      const response = await fetch(`${API_URL}/reports?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.reports) {
        setReports(data.reports.map(r => ({
          id: r.id,
          name: r.name,
          type: r.reportType,
          date: r.date,
          icon: r.programId === 1 ? 'balance' : r.programId === 2 ? 'inventory' : 'chart',
          color: r.programId === 1 ? 'bg-blue-500' : r.programId === 2 ? 'bg-green-500' : 'bg-purple-500',
          programId: r.programId
        })));
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      setHasLoadedReports(false);
    }
  }, [hasLoadedReports]);

  // Guardar nueva cuenta en el backend - memoizado con useCallback
  const saveNewCuentaToBackend = useCallback(async (cuenta, clasificacion) => {
    try {
      await fetch(`${API_URL}/cuentas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cuenta,
          clasificacion,
          descripcion: 'Cuenta personalizada'
        })
      });
    } catch (error) {
      console.error('Error al guardar cuenta en el backend:', error);
    }
  }, []);

  // Resetear estados de carga cuando cambie el usuario
  const resetLoadStates = useCallback(() => {
    setHasLoadedCuentas(false);
    setHasLoadedReports(false);
  }, []);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    currentView,
    setCurrentView,
    selectedProgram,
    setSelectedProgram,
    cuentasCatalogo,
    setCuentasCatalogo,
    reports,
    setReports,
    reportData,
    setReportData,
    API_URL,
    loadCuentasCatalogo,
    loadUserReports,
    saveNewCuentaToBackend,
    resetLoadStates
  }), [
    currentView,
    selectedProgram,
    cuentasCatalogo,
    reports,
    reportData,
    loadCuentasCatalogo,
    loadUserReports,
    saveNewCuentaToBackend,
    resetLoadStates
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};