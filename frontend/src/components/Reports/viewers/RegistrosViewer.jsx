import React from 'react';
import { formatDate } from '../../../utils/formatters';

export default function RegistrosViewer({ report }) {
  const rows = report.data || [];
  const totals = report.totals || { debe: 0, haber: 0 };
  
  // Agrupar por número de asiento
  const asientosAgrupados = rows.reduce((acc, row) => {
    const asiento = row.noAsiento || 1;
    if (!acc[asiento]) {
      acc[asiento] = [];
    }
    acc[asiento].push(row);
    return acc;
  }, {});

  // Ordenar asientos
  const asientosOrdenados = Object.keys(asientosAgrupados)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
        <h2 className="text-lg font-bold text-gray-900">Registros Contables</h2>
        <p className="text-sm text-gray-600 mt-1">
          Total de asientos: {asientosOrdenados.length}
        </p>
      </div>

      <div className="divide-y divide-gray-300">
        {asientosOrdenados.map((asientoNum) => {
          const asientoRows = asientosAgrupados[asientoNum];
          
          // Calcular totales del asiento
          const asientoTotals = asientoRows.reduce((acc, row) => {
            acc.debe += parseFloat(row.debe) || 0;
            acc.haber += parseFloat(row.haber) || 0;
            return acc;
          }, { debe: 0, haber: 0 });
          
          const isBalanced = Math.abs(asientoTotals.debe - asientoTotals.haber) < 0.01;
          
          // Obtener la fecha del asiento (tomar la primera fecha)
          const fechaAsiento = asientoRows[0]?.fecha || '';

          return (
            <div key={asientoNum} className="p-6">
              {/* Header del asiento */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-700 rounded-lg font-bold">
                    {asientoNum}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Asiento #{asientoNum}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Fecha: {formatDate(fechaAsiento)}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isBalanced 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {isBalanced ? '✓ Balanceado' : '✗ No Balanceado'}
                </div>
              </div>

              {/* Tabla de movimientos del asiento */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Detalle (Cuenta)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Clasificación
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Debe
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Haber
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Concepto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {asientoRows.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {formatDate(row.fecha)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {row.cuenta}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            row.clasificacion === 'Activo' ? 'bg-blue-100 text-blue-700' :
                            row.clasificacion === 'Pasivo' ? 'bg-red-100 text-red-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {row.clasificacion}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {parseFloat(row.debe) > 0 ? `$${parseFloat(row.debe).toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {parseFloat(row.haber) > 0 ? `$${parseFloat(row.haber).toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.concepto || '—'}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Totales del asiento */}
                    <tr className="bg-purple-50 font-semibold">
                      <td colSpan="3" className="px-4 py-3 text-sm text-gray-900">
                        TOTALES DEL ASIENTO #{asientoNum}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-purple-700">
                        ${asientoTotals.debe.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-purple-700">
                        ${asientoTotals.haber.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-center">
                        {isBalanced ? (
                          <span className="text-green-600">✓ Balanceado</span>
                        ) : (
                          <span className="text-red-600">
                            Dif: ${Math.abs(asientoTotals.debe - asientoTotals.haber).toFixed(2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totales generales */}
      <div className="bg-purple-100 px-6 py-4 border-t-2 border-purple-300">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Debe</p>
            <p className="text-lg font-bold text-purple-700">
              ${parseFloat(totals.debe || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Haber</p>
            <p className="text-lg font-bold text-purple-700">
              ${parseFloat(totals.haber || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Diferencia</p>
            <p className={`text-lg font-bold ${
              Math.abs(totals.debe - totals.haber) < 0.01 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              ${Math.abs(totals.debe - totals.haber).toFixed(2)}
              {Math.abs(totals.debe - totals.haber) < 0.01 && ' ✓'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}