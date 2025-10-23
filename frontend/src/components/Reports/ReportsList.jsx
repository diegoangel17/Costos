import React, { useState } from 'react';
import { Search, Filter, Grid3x3, List, ChevronDown, Plus, FileText, Calculator, Package, DollarSign, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useReports } from '../../hooks/useReports';
import { formatDate } from '../../utils/formatters';
import Header from '../Layout/Header';
import ReportViewer from './ReportViewer';

export default function ReportsList() {
  const { setCurrentView } = useApp();
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterOpen,
    setFilterOpen,
    sortBy,
    setSortBy,
    filteredReports
  } = useReports();
  
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Si hay un reporte seleccionado, mostrar el visor
  if (selectedReportId) {
    return (
      <ReportViewer 
        reportId={selectedReportId} 
        onBack={() => setSelectedReportId(null)} 
      />
    );
  }

  const getIconComponent = (iconType) => {
    const iconMap = {
      balance: Calculator,
      inventory: Package,
      costs: DollarSign,
      results: BarChart3,
      chart: BarChart3
    };
    const Icon = iconMap[iconType] || FileText;
    return <Icon className="w-8 h-8 sm:w-10 md:w-12 text-white" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mis Reportes" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reportes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">Ordenar</span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                  {[
                    { value: 'recent', label: 'Más reciente primero' },
                    { value: 'oldest', label: 'Más antiguo primero' },
                    { value: 'alphabetical', label: 'Orden alfabético' },
                    { value: 'type', label: 'Por tipo de reporte' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setFilterOpen(false); }}
                      className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 ${sortBy === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 sm:p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <button
              onClick={() => setCurrentView('createReport')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>

        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
          {filteredReports.length} {filteredReports.length === 1 ? 'reporte encontrado' : 'reportes encontrados'}
        </div>

        {/* Vista Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredReports.map(report => (
              <button
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className="group bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden text-left"
              >
                <div className={`${report.color} h-24 sm:h-28 md:h-32 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  {getIconComponent(report.icon)}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 truncate group-hover:text-blue-600">
                    {report.name}
                  </h3>
                  <div className="flex flex-col xs:flex-row items-start xs:items-center xs:justify-between gap-1 text-xs text-gray-500">
                    <span className="px-2 py-0.5 sm:py-1 bg-gray-100 rounded text-xs">{report.type}</span>
                    <span className="text-xs">{formatDate(report.date)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Vista Lista */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredReports.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`${report.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {getIconComponent(report.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{report.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{report.type}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                    {formatDate(report.date)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sin resultados */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No se encontraron reportes</h3>
            <p className="text-sm sm:text-base text-gray-600">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}