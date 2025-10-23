import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import BalanceViewer from './viewers/BalanceViewer';
import InventoryViewer from './viewers/InventoryViewer';
import RegistrosViewer from './viewers/RegistrosViewer';

export default function ReportViewer({ reportId, onBack }) {
  const { API_URL } = useApp();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reports/${reportId}`);
      const result = await response.json();
      
      if (result.success && result.report) {
        setReport(result.report);
      } else {
        alert('Error al cargar el reporte');
        onBack();
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      alert('No se pudo cargar el reporte');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Por ahora solo imprime, pero puede extenderse con jsPDF
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudo cargar el reporte</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - No se imprime */}
      <div className="print:hidden bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver a reportes</span>
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Exportar PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del reporte */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header del reporte - Se imprime */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {report.name}
            </h1>
            <p className="text-sm text-gray-600">
              Fecha: {formatDate(report.date)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Creado: {formatDate(report.created_at)}
            </p>
          </div>
        </div>

        {/* Renderizar vista según programId */}
        {report.programId === 1 && <BalanceViewer report={report} />}
        {report.programId === 2 && <InventoryViewer report={report} />}
        {report.programId === 3 && <RegistrosViewer report={report} />}
        
        {/* Mensaje para reportes no implementados */}
        {report.programId > 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">
              La visualización para este tipo de reporte estará disponible próximamente.
            </p>
          </div>
        )}
      </div>

      {/* Estilos de impresión */}
      <style jsx>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          @page {
            margin: 1cm;
            size: letter;
          }
        }
      `}</style>
    </div>
  );
}