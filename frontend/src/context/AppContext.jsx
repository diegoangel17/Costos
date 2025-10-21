import React, { createContext, useContext, useState } from 'react';
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

  // Cargar catálogo de cuentas
  const loadCuentasCatalogo = async () => {
    try {
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
    }
  };

  // Cargar reportes del usuario
  const loadUserReports = async (userId) => {
    try {
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
    }
  };

  // Guardar nueva cuenta en el backend
  const saveNewCuentaToBackend = async (cuenta, clasificacion) => {
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
  };

  const value = {
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
    saveNewCuentaToBackend
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};