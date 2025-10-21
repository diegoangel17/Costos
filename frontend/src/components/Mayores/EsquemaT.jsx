import React from 'react';
import { formatFecha } from '../../utils/mayoresUtils';

export default function EsquemaT({ esquema, tipo = 'cuenta' }) {
  if (!esquema) return null;

  const esOrden = tipo === 'orden';
  const titulo = esOrden ? esquema.orden : esquema.cuenta;
  const colorFondo = esOrden ? 'bg-green-50' : 'bg-orange-50';
  const colorBorde = esOrden ? 'border-green-200' : 'border-orange-200';
  const colorTexto = esOrden ? 'text-green-700' : 'text-orange-700';
  const colorSaldoInicial = esquema.columnaInicial === 'debe' ? 'bg-blue-50' : 'bg-green-50';
  const colorSaldoInicialTexto = esquema.columnaInicial === 'debe' ? 'text-blue-700' : 'text-green-700';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`${colorFondo} px-6 py-4 border-b ${colorBorde}`}>
        <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
        {esquema.clasificacion && (
          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
            esquema.clasificacion === 'Activo' ? 'bg-blue-100 text-blue-700' :
            esquema.clasificacion === 'Pasivo' ? 'bg-red-100 text-red-700' :
            'bg-green-100 text-green-700'
          }`}>
            {esquema.clasificacion}
          </span>
        )}
        {esquema.producto && (
          <p className="text-sm text-gray-600 mt-1">{esquema.producto}</p>
        )}
      </div>

      {/* Esquema de T */}
      <div className="p-6">
        <div className="grid grid-cols-2 border border-gray-300">
          {/* Columna DEBE */}
          <div className="border-r border-gray-300">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h4 className="text-sm font-bold text-gray-900 text-center">DEBE</h4>
            </div>
            <div className="min-h-[300px]">
              {/* Saldo Inicial en DEBE */}
              {esquema.columnaInicial === 'debe' && esquema.saldoInicial > 0 && (
                <div className={`px-4 py-2 border-b border-gray-200 ${colorSaldoInicial}`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 italic">
                      {esOrden ? 'Costo Inicial' : 'Saldo Inicial'}
                    </span>
                    <span className={`font-semibold ${colorSaldoInicialTexto}`}>
                      ${esquema.saldoInicial.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Movimientos en DEBE */}
              {esquema.movimientos.map((mov, idx) => (
                mov.debe > 0 && (
                  <div key={idx} className="px-4 py-2 border-b border-gray-200 hover:bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">
                      {formatFecha(mov.fecha)} - Asiento #{mov.noAsiento}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 truncate pr-2">
                        {mov.concepto || 'Sin concepto'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        ${mov.debe.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              ))}
            </div>
            {/* Total DEBE */}
            <div className="bg-gray-100 px-4 py-2 border-t-2 border-gray-400">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">TOTAL</span>
                <span className="text-sm font-bold text-gray-900">
                  ${esquema.totalDebe.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Columna HABER */}
          <div>
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h4 className="text-sm font-bold text-gray-900 text-center">HABER</h4>
            </div>
            <div className="min-h-[300px]">
              {/* Saldo Inicial en HABER */}
              {esquema.columnaInicial === 'haber' && esquema.saldoInicial > 0 && (
                <div className={`px-4 py-2 border-b border-gray-200 ${colorSaldoInicial}`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 italic">Saldo Inicial</span>
                    <span className={`font-semibold ${colorSaldoInicialTexto}`}>
                      ${esquema.saldoInicial.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Movimientos en HABER */}
              {esquema.movimientos.map((mov, idx) => (
                mov.haber > 0 && (
                  <div key={idx} className="px-4 py-2 border-b border-gray-200 hover:bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">
                      {formatFecha(mov.fecha)} - Asiento #{mov.noAsiento}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 truncate pr-2">
                        {mov.concepto || 'Sin concepto'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        ${mov.haber.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              ))}
            </div>
            {/* Total HABER */}
            <div className="bg-gray-100 px-4 py-2 border-t-2 border-gray-400">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">TOTAL</span>
                <span className="text-sm font-bold text-gray-900">
                  ${esquema.totalHaber.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo Final */}
        <div className={`mt-4 ${colorFondo} border-2 ${colorBorde} rounded-lg p-4`}>
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">
              {esOrden ? 'COSTO ACUMULADO:' : 'SALDO FINAL:'}
            </span>
            <span className={`text-xl font-bold ${colorTexto}`}>
              ${Math.abs(esquema.saldoFinal).toFixed(2)}
              {!esOrden && esquema.clasificacion === 'Activo' && esquema.saldoFinal >= 0 && ' (Deudor)'}
              {!esOrden && esquema.clasificacion === 'Activo' && esquema.saldoFinal < 0 && ' (Acreedor)'}
              {!esOrden && (esquema.clasificacion === 'Pasivo' || esquema.clasificacion === 'Capital') && esquema.saldoFinal >= 0 && ' (Acreedor)'}
              {!esOrden && (esquema.clasificacion === 'Pasivo' || esquema.clasificacion === 'Capital') && esquema.saldoFinal < 0 && ' (Deudor)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}