import { useState } from 'react';
import { useApp } from '../context/AppContext';

export const useReports = () => {
  const { reports, API_URL } = useApp();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const sortReports = (reports) => {
    let sorted = [...reports];
    switch(sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return sorted;
    }
  };

  const filteredReports = sortReports(
    reports.filter(report => 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      return false;
    }
  };

  const loadReportData = async (reportId) => {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`);
      const result = await response.json();
      
      if (result.success && result.report) {
        return result.report;
      }
      return null;
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      return null;
    }
  };

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterOpen,
    setFilterOpen,
    sortBy,
    setSortBy,
    filteredReports,
    deleteReport,
    loadReportData
  };
};