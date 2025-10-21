import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../Layout/Header';

export default function MainMenu() {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Menú Principal
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Selecciona una opción para continuar
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <button
            onClick={() => setCurrentView('createReport')}
            className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-500 transition-all"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
              Nuevo Registro
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Crear un nuevo reporte financiero
            </p>
          </button>

          <button
            onClick={() => setCurrentView('reports')}
            className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-500 transition-all"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
              Ver Reportes
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Acceder a reportes existentes
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}