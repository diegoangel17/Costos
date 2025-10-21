import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { checkAsientoBalance, getMovementsByCuenta } from '../utils/registrosUtils';

export const useRegistros = () => {
  const { cuentasCatalogo, setCuentasCatalogo, saveNewCuentaToBackend } = useApp();
  
  const [registrosRows, setRegistrosRows] = useState([
    { 
      id: 1, 
      fecha: new Date().toISOString().split('T')[0],
      noAsiento: 1,
      cuenta: '', 
      clasificacion: '', 
      debe: 0, 
      haber: 0,
      concepto: '',
      isNewAccount: false 
    }
  ]);
  
  const [currentAsiento, setCurrentAsiento] = useState(1);

  const addRegistroRow = () => {
    const newId = Math.max(...registrosRows.map(r => r.id), 0) + 1;
    setRegistrosRows([...registrosRows, { 
      id: newId, 
      fecha: new Date().toISOString().split('T')[0],
      noAsiento: currentAsiento,
      cuenta: '', 
      clasificacion: '', 
      debe: 0, 
      haber: 0,
      concepto: '',
      isNewAccount: false 
    }]);
  };

  const removeRegistroRow = (id) => {
    if (registrosRows.length > 1) {
      setRegistrosRows(registrosRows.filter(row => row.id !== id));
    }
  };

  const updateRegistroRow = (id, field, value) => {
    setRegistrosRows(registrosRows.map(row => {
      if (row.id === id) {
        if (field === 'cuenta') {
          const cuentaInfo = cuentasCatalogo.find(
            c => c.cuenta.toLowerCase() === value.toLowerCase()
          );
          
          if (cuentaInfo) {
            return { 
              ...row, 
              cuenta: value, 
              clasificacion: cuentaInfo.clasificacion, 
              isNewAccount: false,
              debe: 0,
              haber: 0
            };
          } else {
            return { 
              ...row, 
              cuenta: value, 
              clasificacion: row.clasificacion || '', 
              isNewAccount: true,
              debe: 0,
              haber: 0
            };
          }
        } else if (field === 'clasificacion') {
          const updatedRow = { ...row, clasificacion: value };
          
          if (row.isNewAccount && row.cuenta && value) {
            const existsInCatalog = cuentasCatalogo.some(
              c => c.cuenta.toLowerCase() === row.cuenta.toLowerCase()
            );
            
            if (!existsInCatalog) {
              setCuentasCatalogo([...cuentasCatalogo, { 
                cuenta: row.cuenta, 
                clasificacion: value 
              }]);
              saveNewCuentaToBackend(row.cuenta, value);
              updatedRow.isNewAccount = false;
            }
          }
          
          updatedRow.debe = 0;
          updatedRow.haber = 0;
          return updatedRow;
        } else if (field === 'debe') {
          const newValue = parseFloat(value) || 0;
          return { 
            ...row, 
            debe: newValue,
            haber: newValue > 0 ? 0 : row.haber
          };
        } else if (field === 'haber') {
          const newValue = parseFloat(value) || 0;
          return { 
            ...row, 
            haber: newValue,
            debe: newValue > 0 ? 0 : row.debe
          };
        }
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const calculateRegistrosTotals = () => {
    return registrosRows.reduce((acc, row) => {
      acc.debe += parseFloat(row.debe) || 0;
      acc.haber += parseFloat(row.haber) || 0;
      return acc;
    }, { debe: 0, haber: 0 });
  };

  const startNewAsiento = () => {
    const currentAsientoRows = registrosRows.filter(r => r.noAsiento === currentAsiento);
    const asientoBalance = checkAsientoBalance(currentAsientoRows);
    
    if (!asientoBalance.isBalanced) {
      alert(`El asiento ${currentAsiento} no está balanceado. Debe = ${asientoBalance.debe.toFixed(2)}, Haber = ${asientoBalance.haber.toFixed(2)}`);
      return false;
    }
    
    if (currentAsientoRows.length < 2) {
      alert('Un asiento debe tener al menos 2 movimientos');
      return false;
    }
    
    const nextAsiento = currentAsiento + 1;
    setCurrentAsiento(nextAsiento);
    
    const newId = Math.max(...registrosRows.map(r => r.id), 0) + 1;
    setRegistrosRows([...registrosRows, { 
      id: newId, 
      fecha: new Date().toISOString().split('T')[0],
      noAsiento: nextAsiento,
      cuenta: '', 
      clasificacion: '', 
      debe: 0, 
      haber: 0,
      concepto: '',
      isNewAccount: false 
    }]);
    
    return true;
  };

  const changeAsiento = (asientoNum) => {
    setCurrentAsiento(asientoNum);
  };

  const getAsientosList = () => {
    const asientos = [...new Set(registrosRows.map(r => r.noAsiento))].sort((a, b) => a - b);
    return asientos;
  };

  const getCurrentAsientoRows = () => {
    return registrosRows.filter(r => r.noAsiento === currentAsiento);
  };

  const exportData = (reportData) => {
    const totals = calculateRegistrosTotals();
    const movementsSummary = getMovementsByCuenta(registrosRows);
    
    return {
      reportName: reportData.name,
      type: 'Registros Contables',
      date: reportData.date,
      rows: registrosRows,
      totals: totals,
      movementsSummary: movementsSummary,
      asientos: getAsientosList()
    };
  };

  return {
    registrosRows,
    setRegistrosRows,
    currentAsiento,
    setCurrentAsiento,
    addRegistroRow,
    removeRegistroRow,
    updateRegistroRow,
    calculateRegistrosTotals,
    startNewAsiento,
    changeAsiento,
    getAsientosList,
    getCurrentAsientoRows,
    exportData,
    cuentasCatalogo
  };
};