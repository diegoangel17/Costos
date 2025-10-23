import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
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

  // ⭐ SOLUCIÓN OPTIMIZADA: Usar refs para controlar cuándo cargar
  // Esto evita infinite loops pero permite recargas cuando sea necesario
  const isLoadingCuentas = useRef(false);
  const isLoadingReports = useRef(false);
  const lastReportsUserId = useRef(null);

  // Cargar catálogo de cuentas - controlado con ref para evitar loops
  const loadCuentasCatalogo = useCallback(async (force = false) => {
    // Si ya está cargando, no hacer otra petición
    if (isLoadingCuentas.current && !force) {
      console.log('⏭️ Ya se está cargando el catálogo de cuentas, saltando...');
      return;
    }
    
    // Si no es forzado y ya tenemos datos, no recargar
    if (!force && cuentasCatalogo.length > CUENTAS_INICIALES.length) {
      console.log('⏭️ Catálogo de cuentas ya cargado, saltando...');
      return;
    }

    try {
      isLoadingCuentas.current = true;
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
    } finally {
      isLoadingCuentas.current = false;
    }
  }, [API_URL, cuentasCatalogo.length]);

  // Cargar reportes del usuario - controlado con ref para evitar loops
  const loadUserReports = useCallback(async (userId, force = false) => {
    if (!userId) {
      console.warn('⚠️ No se puede cargar reportes sin userId');
      return [];
    }

    // Si ya está cargando para este usuario, no hacer otra petición
    if (isLoadingReports.current && lastReportsUserId.current === userId && !force) {
      console.log('⏭️ Ya se están cargando los reportes para este usuario, saltando...');
      return reports;
    }

    try {
      isLoadingReports.current = true;
      lastReportsUserId.current = userId;
      
      console.log('🔄 Cargando reportes del usuario:', userId, force ? '(forzado)' : '');
      
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
    } finally {
      isLoadingReports.current = false;
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
        // Recargar catálogo después de guardar (forzado)
        await loadCuentasCatalogo(true);
      }
    } catch (error) {
      console.error('❌ Error al guardar cuenta en el backend:', error);
    }
  }, [API_URL, loadCuentasCatalogo]);

  // Función para forzar recarga completa (usar después de guardar reportes)
  const refreshAllData = useCallback(async (userId) => {
    console.log('🔄 Refrescando todos los datos...');
    await loadCuentasCatalogo(true);
    await loadUserReports(userId, true);
    console.log('✅ Datos refrescados completamente');
  }, [loadCuentasCatalogo, loadUserReports]);

  // Función para inicializar datos (llamar solo al inicio de sesión)
  const initializeData = useCallback(async (userId) => {
    console.log('🚀 Inicializando datos para usuario:', userId);
    
    // Resetear refs
    isLoadingCuentas.current = false;
    isLoadingReports.current = false;
    lastReportsUserId.current = null;
    
    // Cargar datos iniciales
    await loadCuentasCatalogo(false);
    await loadUserReports(userId, false);
    
    console.log('✅ Datos inicializados');
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
    refreshAllData,
    initializeData // ⭐ Nueva función para inicializar
  }), [
    currentView,
    selectedProgram,
    cuentasCatalogo,
    reports,
    reportData,
    loadCuentasCatalogo,
    loadUserReports,
    saveNewCuentaToBackend,
    refreshAllData,
    initializeData
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};