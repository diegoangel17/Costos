import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUBPROGRAMAS } from '../../constants';

export default function ReportSelector() {
  const { setCurrentView, setSelectedProgram, reportData, setReportData } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => setCurrentView('menu')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver al menú</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Reporte
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Selecciona el tipo de reporte que deseas crear
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Reporte
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Reporte
              </label>
              <input
                type="text"
                value={reportData.name}
                onChange={(e) => setReportData({...reportData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Reporte Mensual Enero 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={reportData.date}
                onChange={(e) => setReportData({...reportData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBPROGRAMAS.map((programa) => {
            const Icon = programa.icon;
            return (
              <button
                key={programa.id}
                onClick={() => setSelectedProgram(programa.id)}
                className="group bg-white rounded-lg p-5 shadow-sm border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
              >
                <div className={`${programa.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600">
                  {programa.name}
                </h3>
                <p className="text-xs text-gray-500">Programa {programa.id}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}