import React from 'react';

export default function InventoryViewer({ report }) {
  // Extraer datos de inventario y proceso
  const data = report.data || {};
  const inventoryData = data.inventory || {};
  const processData = data.process || {};
  
  const inventoryRows = inventoryData.rows || [];
  const processRows = processData.rows || [];
  
  const inventoryTotals = inventoryData.totals || { totalUnidades: 0, totalValor: 0 };
  const processTotals = processData.totals || { cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0, total: 0 };

  return (
    <div className="space-y-6">
      {/* Tabla de Inventario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-green-50 px-6 py-4 border-b border-green-200">
          <h2 className="text-lg font-bold text-gray-900">Inventario Actual</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Unidades
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Costo Unitario
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventoryRows.map((row, index) => {
                const total = (parseFloat(row.unidades) || 0) * (parseFloat(row.costoUnitario) || 0);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.producto}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {parseFloat(row.unidades || 0).toFixed(0)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ${parseFloat(row.costoUnitario || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      ${total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              
              {inventoryRows.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                    No hay productos en inventario
                  </td>
                </tr>
              )}
              
              {/* Fila de totales */}
              {inventoryRows.length > 0 && (
                <tr className="bg-green-50 font-bold border-t-2 border-green-200">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    TOTALES
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-700">
                    {parseFloat(inventoryTotals.totalUnidades || 0).toFixed(0)}
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right text-sm text-green-700">
                    ${parseFloat(inventoryTotals.totalValor || 0).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Productos en Proceso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
          <h2 className="text-lg font-bold text-gray-900">Productos en Proceso</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Detalle (Orden)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Materiales
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Mano de Obra
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Gastos Fab.
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processRows.map((row, index) => {
                const total = (parseFloat(row.materiales) || 0) + 
                             (parseFloat(row.manoObra) || 0) + 
                             (parseFloat(row.gastosF) || 0);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.detalle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {row.producto}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {parseFloat(row.cantidad || 0).toFixed(0)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ${parseFloat(row.materiales || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ${parseFloat(row.manoObra || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ${parseFloat(row.gastosF || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      ${total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              
              {processRows.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                    No hay productos en proceso
                  </td>
                </tr>
              )}
              
              {/* Fila de totales */}
              {processRows.length > 0 && (
                <tr className="bg-purple-50 font-bold border-t-2 border-purple-200">
                  <td className="px-6 py-4 text-sm text-gray-900" colSpan="2">
                    TOTALES
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-purple-700">
                    {parseFloat(processTotals.cantidad || 0).toFixed(0)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-purple-700">
                    ${parseFloat(processTotals.materiales || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-purple-700">
                    ${parseFloat(processTotals.manoObra || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-purple-700">
                    ${parseFloat(processTotals.gastosF || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-purple-700">
                    ${parseFloat(processTotals.total || 0).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}