import { useState } from 'react';

export const useInventory = () => {
  const [inventoryModule, setInventoryModule] = useState('inventory');
  
  const [inventoryRows, setInventoryRows] = useState([
    { id: 1, producto: '', unidades: 0, costoUnitario: 0 }
  ]);
  
  const [processRows, setProcessRows] = useState([
    { id: 1, detalle: '', producto: '', cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0 }
  ]);

  // Funciones para Inventario
  const addInventoryRow = () => {
    const newId = Math.max(...inventoryRows.map(r => r.id), 0) + 1;
    setInventoryRows([...inventoryRows, { 
      id: newId, 
      producto: '', 
      unidades: 0, 
      costoUnitario: 0 
    }]);
  };

  const removeInventoryRow = (id) => {
    if (inventoryRows.length > 1) {
      setInventoryRows(inventoryRows.filter(row => row.id !== id));
    }
  };

  const updateInventoryRow = (id, field, value) => {
    setInventoryRows(inventoryRows.map(row => 
      row.id === id ? { 
        ...row, 
        [field]: field === 'producto' ? value : parseFloat(value) || 0 
      } : row
    ));
  };

  const calculateInventoryTotals = () => {
    return inventoryRows.reduce((acc, row) => {
      const total = (parseFloat(row.unidades) || 0) * (parseFloat(row.costoUnitario) || 0);
      acc.totalUnidades += parseFloat(row.unidades) || 0;
      acc.totalValor += total;
      return acc;
    }, { totalUnidades: 0, totalValor: 0 });
  };

  // Funciones para Productos en Proceso
  const addProcessRow = () => {
    const newId = Math.max(...processRows.map(r => r.id), 0) + 1;
    setProcessRows([...processRows, { 
      id: newId, 
      detalle: '', 
      producto: '', 
      cantidad: 0, 
      materiales: 0, 
      manoObra: 0, 
      gastosF: 0 
    }]);
  };

  const removeProcessRow = (id) => {
    if (processRows.length > 1) {
      setProcessRows(processRows.filter(row => row.id !== id));
    }
  };

  const updateProcessRow = (id, field, value) => {
    setProcessRows(processRows.map(row => 
      row.id === id ? { 
        ...row, 
        [field]: field === 'detalle' || field === 'producto' ? value : parseFloat(value) || 0 
      } : row
    ));
  };

  const calculateProcessTotals = () => {
    return processRows.reduce((acc, row) => ({
      cantidad: acc.cantidad + (parseFloat(row.cantidad) || 0),
      materiales: acc.materiales + (parseFloat(row.materiales) || 0),
      manoObra: acc.manoObra + (parseFloat(row.manoObra) || 0),
      gastosF: acc.gastosF + (parseFloat(row.gastosF) || 0),
      total: acc.total + (parseFloat(row.materiales) || 0) + 
             (parseFloat(row.manoObra) || 0) + (parseFloat(row.gastosF) || 0)
    }), { cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0, total: 0 });
  };

  const exportData = (reportData) => {
    const inventoryTotals = calculateInventoryTotals();
    const processTotals = calculateProcessTotals();
    
    return {
      reportName: reportData.name,
      type: 'Inventario y Productos en Proceso',
      date: reportData.date,
      inventory: {
        rows: inventoryRows,
        totals: inventoryTotals
      },
      process: {
        rows: processRows,
        totals: processTotals
      }
    };
  };

  return {
    inventoryModule,
    setInventoryModule,
    inventoryRows,
    processRows,
    addInventoryRow,
    removeInventoryRow,
    updateInventoryRow,
    calculateInventoryTotals,
    addProcessRow,
    removeProcessRow,
    updateProcessRow,
    calculateProcessTotals,
    exportData
  };
};