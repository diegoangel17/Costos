import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

// Componentes
import LoginForm from './components/Auth/LoginForm';
import MainMenu from './components/Menu/MainMenu';
import ReportSelector from './components/Reports/ReportSelector';
import ReportsList from './components/Reports/ReportsList';
import BalanceForm from './components/Balance/BalanceForm';
import InventoryForm from './components/Inventory/InventoryForm';
import RegistrosForm from './components/Registros/RegistrosForm';
import MayoresForm from './components/Mayores/MayoresForm';

function FinancialSystemContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const { currentView, selectedProgram, loadCuentasCatalogo, loadUserReports, setSelectedProgram } = useApp();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadCuentasCatalogo();
      loadUserReports(currentUser.userId);
    }
  }, [isAuthenticated, currentUser, loadCuentasCatalogo, loadUserReports]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (currentView === 'menu') {
    return <MainMenu />;
  }

  if (currentView === 'reports') {
    return <ReportsList />;
  }

  if (currentView === 'createReport') {
    if (selectedProgram === null) {
      return <ReportSelector />;
    }

    switch (selectedProgram) {
      case 1:
        return <BalanceForm />;
      case 2:
        return <InventoryForm />;
      case 3:
        return <RegistrosForm />;
      case 4:
        return <MayoresForm />;
      default:
        return (
          <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Programa en Desarrollo
              </h2>
              <p className="text-gray-600 mb-6">
                Este subprograma estará disponible próximamente.
              </p>
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Volver a Selección
              </button>
            </div>
          </div>
        );
    }
  }

  return <MainMenu />;
}

export default function FinancialSystem() {
  return (
    <AuthProvider>
      <AppProvider>
        <FinancialSystemContent />
      </AppProvider>
    </AuthProvider>
  );
}