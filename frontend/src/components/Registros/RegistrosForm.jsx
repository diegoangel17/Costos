import React from 'react';
import { ArrowLeft, Save, Download, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useRegistros } from '../../hooks/useRegistros';
import { checkAsientoBalance, getMovementsByCuenta } from '../../utils/registrosUtils';
import AsientoSelector from './AsientoSelector';

export default function RegistrosForm() {
  const { setSelectedProgram, reportData, API_URL, loadUserReports } = useApp();
  const { currentUser } = useAuth();
  const {
    registrosRows,
    currentAsiento,
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
  } = useRegistros();

  const totalsRegistros = calculateRegistrosTotals();
  const currentAsientoRows = getCurrentAsientoRows();
  const asientoBalance = checkAsientoBalance(currentAsientoRows);
  const asientosList = getAsientosList();
  const movementsSummary = getMovementsByCuenta(registrosRows);

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
        programId: 3,
        date: reportData.date,
        data: data.rows,
        totals: data.totals,
        metadata: {
          asientos: data.asientos,
          movementsSummary: data.movementsSummary
        }
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Registros Contables</h1>
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

        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Sobre los Asientos Contables</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>Regla de oro:</strong> Todo asiento debe estar balanceado (Debe = Haber)</li>
                <li>• <strong>Activo:</strong> Aumenta en DEBE, disminuye en HABER</li>
                <li>• <strong>Pasivo y Capital:</strong> Aumentan en HABER, disminuyen en DEBE</li>
                <li>• Un asiento debe tener al menos 2 movimientos (partida doble)</li>
              </ul>
            </div>
          </div>
        </div>

        <AsientoSelector
          currentAsiento={currentAsiento}
          asientosList={asientosList}
          currentAsientoRows={currentAsientoRows}
          onChangeAsiento={changeAsiento}
          onNewAsiento={startNewAsiento}
        />

        {/* Tabla de movimientos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
            <h3 className="text-sm font-semibold text-purple-900">
              Asiento #{currentAsiento} - Movimientos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cuenta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Clasificación</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Debe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Haber</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Concepto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentAsientoRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={row.fecha}
                        onChange={(e) => updateRegistroRow(row.id, 'fecha', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="text"
                          list={`cuentas-registro-${row.id}`}
                          value={row.cuenta}
                          onChange={(e) => updateRegistroRow(row.id, 'cuenta', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Escribir o seleccionar..."
                        />
                        <datalist id={`cuentas-registro-${row.id}`}>
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
                          onChange={(e) => updateRegistroRow(row.id, 'clasificacion', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Activo">Activo</option>
                          <option value="Pasivo">Pasivo</option>
                          <option value="Capital">Capital</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          row.clasificacion === 'Activo' ? 'bg-blue-100 text-blue-700' :
                          row.clasificacion === 'Pasivo' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {row.clasificacion}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.debe || ''}
                        onChange={(e) => updateRegistroRow(row.id, 'debe', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={!row.clasificacion}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.haber || ''}
                        onChange={(e) => updateRegistroRow(row.id, 'haber', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={!row.clasificacion}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.concepto}
                        onChange={(e) => updateRegistroRow(row.id, 'concepto', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Concepto del movimiento..."
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeRegistroRow(row.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={currentAsientoRows.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-purple-50 font-semibold">
                  <td className="px-4 py-3 text-sm" colSpan="3">
                    TOTALES DEL ASIENTO #{currentAsiento}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-purple-700">
                    ${asientoBalance.debe.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-purple-700">
                    ${asientoBalance.haber.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center text-xs" colSpan="2">
                    {asientoBalance.isBalanced ? (
                      <span className="text-green-600">✓ Balanceado</span>
                    ) : (
                      <span className="text-red-600">Diferencia: ${asientoBalance.diferencia.toFixed(2)}</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={addRegistroRow}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Movimiento al Asiento #{currentAsiento}
        </button>

        {/* Resumen de todos los asientos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Todos los Asientos</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Debe</p>
              <p className="text-2xl font-bold text-blue-700">${totalsRegistros.debe.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Haber</p>
              <p className="text-2xl font-bold text-green-700">${totalsRegistros.haber.toFixed(2)}</p>
            </div>
            <div className={`rounded-lg p-4 ${
              Math.abs(totalsRegistros.debe - totalsRegistros.haber) < 0.01 
                ? 'bg-green-50' 
                : 'bg-red-50'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Diferencia</p>
              <p className={`text-2xl font-bold ${
                Math.abs(totalsRegistros.debe - totalsRegistros.haber) < 0.01 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>
                ${Math.abs(totalsRegistros.debe - totalsRegistros.haber).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen por cuenta */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Resumen de Movimientos por Cuenta</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cuenta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Clasificación</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Movimientos</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Debe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Haber</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movementsSummary.map((summary, idx) => {
                  const saldo = summary.clasificacion === 'Activo' 
                    ? summary.totalDebe - summary.totalHaber
                    : summary.totalHaber - summary.totalDebe;
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{summary.cuenta}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          summary.clasificacion === 'Activo' ? 'bg-blue-100 text-blue-700' :
                          summary.clasificacion === 'Pasivo' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {summary.clasificacion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{summary.movimientos}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">${summary.totalDebe.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">${summary.totalHaber.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">${saldo.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}