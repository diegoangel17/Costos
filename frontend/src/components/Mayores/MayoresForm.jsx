import React from 'react';
import { ArrowLeft, Calculator, AlertCircle, FileText, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useMayores } from '../../hooks/useMayores';
import { formatDate } from '../../utils/formatters';
import EsquemaT from './EsquemaT';

export default function MayoresForm() {
  const { setSelectedProgram } = useApp();
  const {
    mayoresModule,
    setMayoresModule,
    selectedReportes,
    setSelectedReportes,
    selectedCuenta,
    selectedOrden,
    cuentasDisponibles,
    ordenesDisponibles,
    esquemaActual,
    getReportesByTipo,
    procesarReportesSeleccionados,
    handleChangeCuenta,
    handleChangeOrden
  } = useMayores();

  const reportesBalance = getReportesByTipo(1);
  const reportesInventario = getReportesByTipo(2);
  const reportesRegistros = getReportesByTipo(3);

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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Mayores Auxiliares</h1>
            <p className="text-sm text-gray-600">Esquemas de T por Cuenta y Orden de Producción</p>
          </div>
        </div>

        {/* Información */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-orange-900 mb-1">Sobre los Mayores Auxiliares</h4>
              <ul className="text-xs text-orange-800 space-y-1">
                <li>• <strong>Cuentas:</strong> Se inicializan con Balance de Saldos y se complementan con Registros Contables</li>
                <li>• <strong>Órdenes:</strong> Se inicializan con Inventario (Productos en Proceso) y se complementan con Registros Contables</li>
                <li>• Para que un movimiento se asocie a una orden, la cuenta debe coincidir exactamente con el detalle de la orden</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Selector de Reportes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Reportes Base</h3>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {/* Balance de Saldos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance de Saldos <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedReportes.balance || ''}
                onChange={(e) => setSelectedReportes({...selectedReportes, balance: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                {reportesBalance.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {formatDate(r.date)}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventario (Opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inventario y Prod. en Proceso
              </label>
              <select
                value={selectedReportes.inventario || ''}
                onChange={(e) => setSelectedReportes({...selectedReportes, inventario: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar (opcional)...</option>
                {reportesInventario.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {formatDate(r.date)}
                  </option>
                ))}
              </select>
            </div>

            {/* Registros Contables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registros Contables <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedReportes.registros || ''}
                onChange={(e) => setSelectedReportes({...selectedReportes, registros: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                {reportesRegistros.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {formatDate(r.date)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={procesarReportesSeleccionados}
            disabled={!selectedReportes.balance || !selectedReportes.registros}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calculator className="w-4 h-4" />
            Generar Mayores Auxiliares
          </button>
        </div>

        {/* Contenido de Mayores */}
        {cuentasDisponibles.length > 0 && (
          <>
            {/* Tabs para alternar entre Cuentas y Órdenes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => {
                    setMayoresModule('cuentas');
                    if (selectedCuenta && window.mayoresData) {
                      handleChangeCuenta(selectedCuenta);
                    }
                  }}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    mayoresModule === 'cuentas'
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>Cuentas ({cuentasDisponibles.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMayoresModule('ordenes');
                    if (selectedOrden && window.mayoresData) {
                      handleChangeOrden(selectedOrden);
                    }
                  }}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    mayoresModule === 'ordenes'
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  disabled={ordenesDisponibles.length === 0}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Package className="w-5 h-5" />
                    <span>Órdenes de Producción ({ordenesDisponibles.length})</span>
                  </div>
                </button>
              </div>
            </div>

            {/* MÓDULO: CUENTAS */}
            {mayoresModule === 'cuentas' && (
              <>
                {/* Selector de Cuenta */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Seleccionar Cuenta:
                    </label>
                    <select
                      value={selectedCuenta}
                      onChange={(e) => handleChangeCuenta(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {cuentasDisponibles.map((c, idx) => (
                        <option key={idx} value={c.cuenta}>
                          {c.cuenta} {c.clasificacion ? `(${c.clasificacion})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Esquema de T - Cuenta */}
                <EsquemaT esquema={esquemaActual} tipo="cuenta" />
              </>
            )}

            {/* MÓDULO: ÓRDENES DE PRODUCCIÓN */}
            {mayoresModule === 'ordenes' && (
              <>
                {ordenesDisponibles.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay órdenes de producción</h3>
                    <p className="text-sm text-gray-600">
                      Selecciona un reporte de "Inventario y Productos en Proceso" que contenga órdenes
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Selector de Orden */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Seleccionar Orden:
                        </label>
                        <select
                          value={selectedOrden}
                          onChange={(e) => handleChangeOrden(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {ordenesDisponibles.map((o, idx) => (
                            <option key={idx} value={o.detalle}>
                              {o.detalle} - {o.producto}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Esquema de T - Orden */}
                    <EsquemaT esquema={esquemaActual} tipo="orden" />
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Mensaje inicial si no hay datos cargados */}
        {cuentasDisponibles.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calculator className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona los reportes base</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Elige un Balance de Saldos y Registros Contables (requeridos), y opcionalmente un reporte de Inventario para ver las órdenes de producción.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}