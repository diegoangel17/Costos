import React from 'react';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../hooks/useInventory';
import InventoryTabs from './InventoryTabs';
import InventoryTable from './InventoryTable';
import ProcessTable from './ProcessTable';

export default function InventoryForm() {
  const { setSelectedProgram, reportData, API_URL, loadUserReports } = useApp();
  const { currentUser } = useAuth();
  const {
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
  } = useInventory();

  const inventoryTotals = calculateInventoryTotals();
  const processTotals = calculateProcessTotals();

  const saveReport = async () => {
    const data = exportData(reportData);
    
    if (!reportData.name) {
      alert('Por favor ingresa un nombre para el reporte');
      return;
    }

    try {
      const bodyData = {
        userId: currentUser.userId,
        name: reportData.name,
        reportType: data.type,
        programId: 2,
        date: reportData.date,
        data: { inventory: data.inventory, process: data.process },
        totals: data.totals
      };

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Reporte guardado exitosamente');
        loadUserReports(currentUser.userId);
      } else {
        alert(result.error || 'Error al guardar el reporte');
      }
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      alert('No se pudo conectar con el servidor para guardar el reporte');
    }
  };

  const handleExport = () => {
    const data = exportData(reportData);
    console.log('Datos exportados:', data);
    window.reportData = data;
    alert('Datos exportados. Revisa la consola para más detalles.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setSelectedProgram(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Cambiar tipo de reporte</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Inventario y Productos en Proceso
              </h1>
              <p className="text-sm text-gray-600">{reportData.name || 'Nuevo reporte'} - {reportData.date}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <InventoryTabs 
          activeModule={inventoryModule} 
          onModuleChange={setInventoryModule} 
        />

        {inventoryModule === 'inventory' ? (
          <InventoryTable
            inventoryRows={inventoryRows}
            onAddRow={addInventoryRow}
            onRemoveRow={removeInventoryRow}
            onUpdateRow={updateInventoryRow}
            totals={inventoryTotals}
          />
        ) : (
          <ProcessTable
            processRows={processRows}
            onAddRow={addProcessRow}
            onRemoveRow={removeProcessRow}
            onUpdateRow={updateProcessRow}
            totals={processTotals}
          />
        )}
      </div>
    </div>
  );
}