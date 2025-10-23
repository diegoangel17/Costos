import React from 'react';
import { ArrowLeft, Save, Download, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useBalance } from '../../hooks/useBalance';

export default function BalanceForm() {
  const { setSelectedProgram, reportData, API_URL, refreshAllData } = useApp();
  const { currentUser } = useAuth();
  const {
    balanceRows,
    addBalanceRow,
    removeBalanceRow,
    updateBalanceRow,
    calculateBalanceTotals,
    isBalanced,
    exportData,
    cuentasCatalogo
  } = useBalance();

  const totals = calculateBalanceTotals();
  const balanced = isBalanced();

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
        programId: 1,
        date: reportData.date,
        data: data.rows,
        totals: data.totals
      };

      console.log('💾 Guardando reporte Balance de Saldos...');

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Reporte guardado exitosamente');
        
        // ⭐ OPTIMIZACIÓN: Usar refreshAllData que es más eficiente
        await refreshAllData(currentUser.userId);
        
        alert('Reporte guardado exitosamente');
      } else {
        console.error('❌ Error en la respuesta:', result.error);
        alert(result.error || 'Error al guardar el reporte');
      }
    } catch (error) {
      console.error('❌ Error al guardar reporte:', error);
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Balance de Saldos</h1>
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

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Cómo agregar cuentas</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>Cuenta existente:</strong> Selecciona del listado desplegable. La clasificación se asignará automáticamente.</li>
                <li>• <strong>Cuenta nueva:</strong> Escribe el nombre libremente y selecciona su clasificación (Activo, Pasivo o Capital).</li>
                <li>• Las cuentas nuevas se agregarán al catálogo para futuros reportes.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cuenta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Clasificación</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Deudor</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acreedor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {balanceRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="text"
                          list={`cuentas-list-${row.id}`}
                          value={row.cuenta}
                          onChange={(e) => updateBalanceRow(row.id, 'cuenta', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Escribir o seleccionar cuenta..."
                        />
                        <datalist id={`cuentas-list-${row.id}`}>
                          {cuentasCatalogo.map((c, idx) => (
                            <option key={idx} value={c.cuenta} />
                          ))}
                        </datalist>
                        {row.isNewAccount && row.cuenta && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                            Nueva
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {row.isNewAccount ? (
                        <select
                          value={row.clasificacion}
                          onChange={(e) => updateBalanceRow(row.id, 'clasificacion', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Activo">Activo</option>
                          <option value="Pasivo">Pasivo</option>
                          <option value="Capital">Capital</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row.clasificacion}
                          readOnly
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-gray-50 cursor-not-allowed"
                          placeholder="Auto-asignada"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.clasificacion === 'Activo' ? (
                        <input
                          type="number"
                          value={row.monto || ''}
                          onChange={(e) => updateBalanceRow(row.id, 'monto', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                        />
                      ) : (
                        <span className="block px-2 py-1.5 text-sm text-gray-400 text-right">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.clasificacion === 'Pasivo' || row.clasificacion === 'Capital' ? (
                        <input
                          type="number"
                          value={row.monto || ''}
                          onChange={(e) => updateBalanceRow(row.id, 'monto', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                        />
                      ) : (
                        <span className="block px-2 py-1.5 text-sm text-gray-400 text-right">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeBalanceRow(row.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={balanceRows.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-3 text-sm">TOTALES</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right text-sm text-blue-700">
                    ${totals.deudor.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-blue-700">
                    ${totals.acreedor.toFixed(2)}
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={addBalanceRow}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Fila
        </button>

        {/* Verificación de Balance */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificación de Balance</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Deudor</p>
              <p className="text-2xl font-bold text-blue-700">${totals.deudor.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Acreedor</p>
              <p className="text-2xl font-bold text-green-700">${totals.acreedor.toFixed(2)}</p>
            </div>
            <div className={`rounded-lg p-4 ${balanced ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600 mb-1">Diferencia</p>
              <p className={`text-2xl font-bold ${balanced ? 'text-green-700' : 'text-red-700'}`}>
                ${Math.abs(totals.deudor - totals.acreedor).toFixed(2)}
              </p>
              {balanced && (
                <p className="text-xs text-green-600 mt-1">✓ Balance cuadrado</p>
              )}
            </div>
          </div>
        </div>

        {/* Cuentas personalizadas */}
        {cuentasCatalogo.length > 15 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cuentas Personalizadas Agregadas ({cuentasCatalogo.length - 15})
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cuentasCatalogo.slice(15).map((cuenta, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{cuenta.cuenta}</p>
                    <p className="text-xs text-gray-600">{cuenta.clasificacion}</p>
                  </div>
                  <span className="ml-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                    Nueva
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-600">
              💡 Estas cuentas ahora están disponibles en el catálogo para futuros reportes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}