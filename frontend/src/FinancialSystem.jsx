import React, { useEffect, useCallback, useRef } from 'react';
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
  const { currentView, selectedProgram, initializeData, setSelectedProgram } = useApp();
  
  // ⭐ OPTIMIZACIÓN: Usar ref para controlar que solo se cargue una vez
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Solo cargar datos si:
    // 1. El usuario está autenticado
    // 2. Tenemos un currentUser
    // 3. No hemos inicializado todavía
    if (isAuthenticated && currentUser && !hasInitialized.current) {
      console.log('🚀 Primera carga de datos para usuario:', currentUser.userId);
      hasInitialized.current = true;
      initializeData(currentUser.userId);
    }
    
    // Si el usuario cierra sesión, resetear el flag
    if (!isAuthenticated) {
      hasInitialized.current = false;
    }
  }, [isAuthenticated, currentUser?.userId, initializeData]);

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