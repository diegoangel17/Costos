import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ProcessTable({ 
  processRows, 
  onAddRow, 
  onRemoveRow, 
  onUpdateRow,
  totals 
}) {
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Detalle (Orden)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cantidad</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Materiales</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Mano de Obra</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Gastos Fab.</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processRows.map((row) => {
                const totalRow = (parseFloat(row.materiales) || 0) + (parseFloat(row.manoObra) || 0) + (parseFloat(row.gastosF) || 0);
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.detalle}
                        onChange={(e) => onUpdateRow(row.id, 'detalle', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Orden #001"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.producto}
                        onChange={(e) => onUpdateRow(row.id, 'producto', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre del producto..."
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.cantidad || ''}
                        onChange={(e) => onUpdateRow(row.id, 'cantidad', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        step="1"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.materiales || ''}
                        onChange={(e) => onUpdateRow(row.id, 'materiales', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.manoObra || ''}
                        onChange={(e) => onUpdateRow(row.id, 'manoObra', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.gastosF || ''}
                        onChange={(e) => onUpdateRow(row.id, 'gastosF', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      ${totalRow.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onRemoveRow(row.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={processRows.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-blue-50 font-semibold">
                <td className="px-4 py-3 text-sm" colSpan="2">TOTALES</td>
                <td className="px-4 py-3 text-right text-sm text-blue-700">{totals.cantidad}</td>
                <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.materiales.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.manoObra.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.gastosF.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.total.toFixed(2)}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={onAddRow}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
      >
        <Plus className="w-4 h-4" />
        Agregar Orden
      </button>

      {/* Resumen */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Productos en Proceso</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Órdenes</p>
            <p className="text-2xl font-bold text-blue-700">{processRows.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Materiales</p>
            <p className="text-2xl font-bold text-green-700">${totals.materiales.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Mano de Obra</p>
            <p className="text-2xl font-bold text-orange-700">${totals.manoObra.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total General</p>
            <p className="text-2xl font-bold text-purple-700">${totals.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </>
  );
}