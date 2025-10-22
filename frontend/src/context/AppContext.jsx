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
  
  const [reportData, setReportData] = useState({
    name: '',
    type: '',
    date: new Date().toISOString().split('T')[0]
  });

  const API_URL = 'http://localhost:5000/api';

  // ⭐ CORRECCIÓN 1: Remover los flags que bloqueaban la recarga
  // Ahora loadCuentasCatalogo se puede llamar múltiples veces sin problema
  const loadCuentasCatalogo = useCallback(async () => {
    try {
      console.log('🔄 Cargando catálogo de cuentas...');
      const response = await fetch(`${API_URL}/cuentas`);
      const data = await response.json();
      
      if (data.success && data.cuentas) {
        setCuentasCatalogo(data.cuentas.map(c => ({
          cuenta: c.cuenta,
          clasificacion: c.clasificacion
        })));
        console.log('✅ Catálogo de cuentas cargado:', data.cuentas.length);
      }
    } catch (error) {
      console.error('❌ Error al cargar catálogo de cuentas:', error);
    }
  }, [API_URL]);

  // ⭐ CORRECCIÓN 2: loadUserReports ahora SIEMPRE recarga desde el servidor
  // Removido el flag hasLoadedReports que causaba el problema
  const loadUserReports = useCallback(async (userId, forceReload = false) => {
    try {
      console.log('🔄 Cargando reportes del usuario:', userId);
      console.log('🔄 Force reload:', forceReload);
      
      const response = await fetch(`${API_URL}/reports?userId=${userId}`);
      const data = await response.json();
      
      console.log('📥 Respuesta del servidor:', data);
      
      if (data.success && data.reports) {
        const mappedReports = data.reports.map(r => ({
          id: r.id,
          name: r.name,
          type: r.reportType,
          date: r.date,
          icon: r.programId === 1 ? 'balance' : 
                r.programId === 2 ? 'inventory' : 
                r.programId === 3 ? 'chart' :
                r.programId === 4 ? 'chart' : 'chart',
          color: r.programId === 1 ? 'bg-blue-500' : 
                 r.programId === 2 ? 'bg-green-500' : 
                 r.programId === 3 ? 'bg-purple-500' :
                 r.programId === 4 ? 'bg-orange-500' : 'bg-gray-500',
          programId: r.programId
        }));
        
        setReports(mappedReports);
        console.log('✅ Reportes cargados:', mappedReports.length);
        console.log('📊 Lista completa de reportes:', mappedReports);
        
        return mappedReports;
      } else {
        console.warn('⚠️ No se encontraron reportes en la respuesta');
        setReports([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error al cargar reportes:', error);
      setReports([]);
      return [];
    }
  }, [API_URL]);

  // Guardar nueva cuenta en el backend
  const saveNewCuentaToBackend = useCallback(async (cuenta, clasificacion) => {
    try {
      const response = await fetch(`${API_URL}/cuentas`, {
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
      
      if (response.ok) {
        console.log('✅ Nueva cuenta guardada:', cuenta);
        // Recargar catálogo después de guardar
        await loadCuentasCatalogo();
      }
    } catch (error) {
      console.error('❌ Error al guardar cuenta en el backend:', error);
    }
  }, [API_URL, loadCuentasCatalogo]);

  // ⭐ CORRECCIÓN 3: Nueva función para forzar recarga completa
  const refreshAllData = useCallback(async (userId) => {
    console.log('🔄 Refrescando todos los datos...');
    await loadCuentasCatalogo();
    await loadUserReports(userId, true);
    console.log('✅ Datos refrescados completamente');
  }, [loadCuentasCatalogo, loadUserReports]);

  // Memoizar el valor del contexto
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
    refreshAllData // ⭐ Nueva función exportada
  }), [
    currentView,
    selectedProgram,
    cuentasCatalogo,
    reports,
    reportData,
    loadCuentasCatalogo,
    loadUserReports,
    saveNewCuentaToBackend,
    refreshAllData
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};