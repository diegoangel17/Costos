import { useState } from 'react';
import { useApp } from '../context/AppContext';

export const useBalance = () => {
  const { cuentasCatalogo, setCuentasCatalogo, saveNewCuentaToBackend } = useApp();
  
  const [balanceRows, setBalanceRows] = useState([
    { id: 1, cuenta: '', clasificacion: '', monto: 0, isNewAccount: false }
  ]);

  const addBalanceRow = () => {
    const newId = Math.max(...balanceRows.map(r => r.id), 0) + 1;
    setBalanceRows([...balanceRows, { 
      id: newId, 
      cuenta: '', 
      clasificacion: '', 
      monto: 0, 
      isNewAccount: false 
    }]);
  };

  const removeBalanceRow = (id) => {
    if (balanceRows.length > 1) {
      setBalanceRows(balanceRows.filter(row => row.id !== id));
    }
  };

  const updateBalanceRow = (id, field, value) => {
    setBalanceRows(balanceRows.map(row => {
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
              isNewAccount: false 
            };
          } else {
            return { 
              ...row, 
              cuenta: value, 
              clasificacion: row.clasificacion || '', 
              isNewAccount: true 
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
          
          return updatedRow;
        }
        return { 
          ...row, 
          [field]: field === 'monto' ? parseFloat(value) || 0 : value 
        };
      }
      return row;
    }));
  };

  const calculateBalanceTotals = () => {
    return balanceRows.reduce((acc, row) => {
      const monto = parseFloat(row.monto) || 0;
      if (row.clasificacion === 'Activo') {
        acc.deudor += monto;
      } else if (row.clasificacion === 'Pasivo' || row.clasificacion === 'Capital') {
        acc.acreedor += monto;
      }
      return acc;
    }, { deudor: 0, acreedor: 0 });
  };

  const isBalanced = () => {
    const totals = calculateBalanceTotals();
    return Math.abs(totals.deudor - totals.acreedor) < 0.01;
  };

  const exportData = (reportData) => {
    const totals = calculateBalanceTotals();
    return {
      reportName: reportData.name,
      type: 'Balance de Saldos',
      date: reportData.date,
      rows: balanceRows,
      totals: totals,
      customAccounts: cuentasCatalogo.slice(15)
    };
  };

  return {
    balanceRows,
    setBalanceRows,
    addBalanceRow,
    removeBalanceRow,
    updateBalanceRow,
    calculateBalanceTotals,
    isBalanced,
    exportData,
    cuentasCatalogo
  };
};