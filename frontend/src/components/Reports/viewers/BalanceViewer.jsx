import React from 'react';

export default function BalanceViewer({ report }) {
  const rows = report.data || [];
  const totals = report.totals || { deudor: 0, acreedor: 0 };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
        <h2 className="text-lg font-bold text-gray-900">Balance de Saldos</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Detalle
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Saldos
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Deudor
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acreedor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, index) => {
              const isActivo = row.clasificacion === 'Activo';
              const isPasivoCapital = row.clasificacion === 'Pasivo' || row.clasificacion === 'Capital';
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.cuenta}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                      row.clasificacion === 'Activo' ? 'bg-blue-100 text-blue-700' :
                      row.clasificacion === 'Pasivo' ? 'bg-red-100 text-red-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {row.clasificacion}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {isActivo ? `$${parseFloat(row.monto || 0).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {isPasivoCapital ? `$${parseFloat(row.monto || 0).toFixed(2)}` : '—'}
                  </td>
                </tr>
              );
            })}
            
            {/* Fila de totales */}
            <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
              <td className="px-6 py-4 text-sm text-gray-900" colSpan="2">
                TOTALES
              </td>
              <td className="px-6 py-4 text-right text-sm text-blue-700">
                ${parseFloat(totals.deudor || 0).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right text-sm text-blue-700">
                ${parseFloat(totals.acreedor || 0).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Verificación de balance */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Diferencia:
          </span>
          <span className={`text-sm font-bold ${
            Math.abs(totals.deudor - totals.acreedor) < 0.01 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            ${Math.abs(totals.deudor - totals.acreedor).toFixed(2)}
            {Math.abs(totals.deudor - totals.acreedor) < 0.01 && ' ✓ Balance cuadrado'}
          </span>
        </div>
      </div>
    </div>
  );
}