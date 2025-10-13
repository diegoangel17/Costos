import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, LogOut, Search, Filter, Grid3x3, List, ChevronDown, Calendar, FileText, BarChart3, DollarSign, PieChart, Eye, EyeOff, Lock, User, Mail, AlertCircle, CheckCircle, Menu, X, ArrowLeft, Trash2, Save, Download, Calculator, Package, BookOpen, ClipboardList } from 'lucide-react';

import { 
  SUBPROGRAMAS, 
  CUENTAS_INICIALES, 
  CLASIFICACIONES,
  SORT_OPTIONS,
  REPORT_ICONS
} from './constants';

import { apiService } from './services/api';

import {
  calculateBalanceTotals,
  calculateInventoryTotals,
  calculateProcessTotals,
  calculateGeneralTotals,
  isBalanced,
  getBalanceDifference
} from './utils/calculations';

import {
  validateLoginForm,
  validateRegisterForm,
  validatePassword,
  isBalanceRowValid,
  validateReportData
} from './utils/validators';

import {
  formatDate,
  formatCurrency,
  formatPeriodo,
  generateFileName,
  getClasificacionColor
} from './utils/formatters';

import { 
  getDefaultColumn, 
  generateAsientoNumber, 
  checkAsientoBalance,
  getMovementsByCuenta 
} from './utils/registrosUtils';


import {
  getSaldoInicialCuenta,
  getSaldoInicialOrden,
  getMovimientosCuenta,
  calcularEsquemaCuenta,
  calcularEsquemaOrden,
  getCuentasDisponibles,
  getOrdenesDisponibles,
  formatFecha
} from './utils/mayoresUtils';

export default function FinancialSystem() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('menu');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [selectedProgram, setSelectedProgram] = useState(null);
  
  // API Base URL
  const API_URL = 'http://localhost:5000/api';
  
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Datos del reporte
  const [reportData, setReportData] = useState({
    name: '',
    type: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Datos para formulario general
  const [generalRows, setGeneralRows] = useState([
    { id: 1, detalle: '', producto: '', cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0 }
  ]);

  // Datos para Inventario y Productos en Proceso
  const [inventoryModule, setInventoryModule] = useState('inventory'); // 'inventory' o 'inProcess'
  const [inventoryRows, setInventoryRows] = useState([
    { id: 1, producto: '', unidades: 0, costoUnitario: 0 }
  ]);
  const [processRows, setProcessRows] = useState([
    { id: 1, detalle: '', producto: '', cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0 }
  ]);

  // Datos para Balance de Saldos
  const [balanceRows, setBalanceRows] = useState([
    { id: 1, cuenta: '', clasificacion: '', monto: 0, isNewAccount: false }
  ]);

  // Catálogo de cuentas (con estado para poder agregar nuevas)
  const [cuentasCatalogo, setCuentasCatalogo] = useState(CUENTAS_INICIALES);

  
  // Datos para Mayores Auxiliares (Subprograma 4)
  const [mayoresModule, setMayoresModule] = useState('cuentas'); // 'cuentas' o 'ordenes'
  const [selectedReportes, setSelectedReportes] = useState({
    balance: null,
    inventario: null,
    registros: null
  });
  const [selectedCuenta, setSelectedCuenta] = useState('');
  const [selectedOrden, setSelectedOrden] = useState('');
  const [cuentasDisponibles, setCuentasDisponibles] = useState([]);
  const [ordenesDisponibles, setOrdenesDisponibles] = useState([]);
  const [esquemaActual, setEsquemaActual] = useState(null);

  const [reports, setReports] = useState([]);

  // Cargar catálogo de cuentas desde el backend
  const loadCuentasCatalogo = async () => {
    try {
      const response = await fetch(`${API_URL}/cuentas`);
      const data = await response.json();
      
      if (data.success && data.cuentas) {
        setCuentasCatalogo(data.cuentas.map(c => ({
          cuenta: c.cuenta,
          clasificacion: c.clasificacion
        })));
      }
    } catch (error) {
      console.error('Error al cargar catálogo de cuentas:', error);
    }
  };

  // Cargar reportes del usuario
  const loadUserReports = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/reports?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.reports) {
        setReports(data.reports.map(r => ({
          id: r.id,
          name: r.name,
          type: r.reportType,
          date: r.date,
          icon: r.programId === 1 ? 'balance' : r.programId === 2 ? 'inventory' : 'chart',
          color: r.programId === 1 ? 'bg-blue-500' : r.programId === 2 ? 'bg-green-500' : 'bg-purple-500',
          programId: r.programId
        })));
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    }
  };

  // Validación de contraseña
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);

  const validateForm = () => {
  const newErrors = isLogin 
    ? validateLoginForm(formData)
    : validateRegisterForm(formData);
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    try {
      const data = isLogin 
        ? await apiService.login(formData.userId, formData.password)
        : await apiService.register(formData);
      
      if (data.success) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setCurrentView('menu');
          // Cargar cuentas del catálogo
          loadCuentasCatalogo();
          // Cargar reportes del usuario
          loadUserReports(data.user.userId);
        } else {
          alert(data.error || 'Error en la autenticación');
        }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('menu');
    setSelectedProgram(null);
    setFormData({
      userId: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      userId: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  // Funciones para formulario general
  const addGeneralRow = () => {
    const newId = Math.max(...generalRows.map(r => r.id), 0) + 1;
    setGeneralRows([...generalRows, { id: newId, detalle: '', producto: '', cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0 }]);
  };

  const removeGeneralRow = (id) => {
    if (generalRows.length > 1) {
      setGeneralRows(generalRows.filter(row => row.id !== id));
    }
  };

  const updateGeneralRow = (id, field, value) => {
    setGeneralRows(generalRows.map(row => 
      row.id === id ? { ...row, [field]: field === 'detalle' || field === 'producto' ? value : parseFloat(value) || 0 } : row
    ));
  };

  const calculateGeneralTotals = () => {
    return generalRows.reduce((acc, row) => ({
      cantidad: acc.cantidad + (parseFloat(row.cantidad) || 0),
      materiales: acc.materiales + (parseFloat(row.materiales) || 0),
      manoObra: acc.manoObra + (parseFloat(row.manoObra) || 0),
      gastosF: acc.gastosF + (parseFloat(row.gastosF) || 0),
      total: acc.total + (parseFloat(row.materiales) || 0) + (parseFloat(row.manoObra) || 0) + (parseFloat(row.gastosF) || 0)
    }), { cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0, total: 0 });
  };

  // Funciones para Balance de Saldos
  const addBalanceRow = () => {
    const newId = Math.max(...balanceRows.map(r => r.id), 0) + 1;
    setBalanceRows([...balanceRows, { id: newId, cuenta: '', clasificacion: '', monto: 0, isNewAccount: false }]);
  };

  const removeBalanceRow = (id) => {
    if (balanceRows.length > 1) {
      setBalanceRows(balanceRows.filter(row => row.id !== id));
    }
  };

  const updateBalanceRow = (id, field, value) => {
    setBalanceRows(balanceRows.map(row => {
      if (row.id === id) {
        if (field === 'cuenta') {
          // Buscar si la cuenta existe en el catálogo
          const cuentaInfo = cuentasCatalogo.find(c => c.cuenta.toLowerCase() === value.toLowerCase());
          if (cuentaInfo) {
            // Cuenta existente: auto-asignar clasificación
            return { ...row, cuenta: value, clasificacion: cuentaInfo.clasificacion, isNewAccount: false };
          } else {
            // Cuenta nueva: permitir selección manual de clasificación
            return { ...row, cuenta: value, clasificacion: row.clasificacion || '', isNewAccount: true };
          }
        } else if (field === 'clasificacion') {
          // Cambio manual de clasificación
          const updatedRow = { ...row, clasificacion: value };
          
          // Si es una cuenta nueva y ahora tiene clasificación, agregarla al catálogo
          if (row.isNewAccount && row.cuenta && value) {
            const existsInCatalog = cuentasCatalogo.some(c => c.cuenta.toLowerCase() === row.cuenta.toLowerCase());
            if (!existsInCatalog) {
              // Agregar al catálogo local
              setCuentasCatalogo([...cuentasCatalogo, { cuenta: row.cuenta, clasificacion: value }]);
              // Guardar en el backend
              saveNewCuentaToBackend(row.cuenta, value);
              updatedRow.isNewAccount = false;
            }
          }
          
          return updatedRow;
        }
        return { ...row, [field]: field === 'monto' ? parseFloat(value) || 0 : value };
      }
      return row;
    }));
  };

  // Guardar nueva cuenta en el backend
  const saveNewCuentaToBackend = async (cuenta, clasificacion) => {
    try {
      await fetch(`${API_URL}/cuentas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cuenta,
          clasificacion,
          descripcion: 'Cuenta personalizada'
        })
      });
    } catch (error) {
      console.error('Error al guardar cuenta en el backend:', error);
    }
  };

  const calculateBalanceTotals = () => {
    return balanceRows.reduce((acc, row) => {
      const monto = parseFloat(row.monto) || 0;
      if (row.clasificacion === 'Activo') {
        acc.deudor += monto;
      } else if (row.clasificacion === 'Pasivo' || row.clasificacion === 'Capital') {
        acc.acreedor += monto;
      }
      return acc;
    }, { deudor: 0, acreedor: 0 });
  };

  // Funciones para Inventario
  const addInventoryRow = () => {
    const newId = Math.max(...inventoryRows.map(r => r.id), 0) + 1;
    setInventoryRows([...inventoryRows, { id: newId, producto: '', unidades: 0, costoUnitario: 0 }]);
  };

  const removeInventoryRow = (id) => {
    if (inventoryRows.length > 1) {
      setInventoryRows(inventoryRows.filter(row => row.id !== id));
    }
  };

  const updateInventoryRow = (id, field, value) => {
    setInventoryRows(inventoryRows.map(row => 
      row.id === id ? { ...row, [field]: field === 'producto' ? value : parseFloat(value) || 0 } : row
    ));
  };

  const calculateInventoryTotals = () => {
    return inventoryRows.reduce((acc, row) => {
      const total = (parseFloat(row.unidades) || 0) * (parseFloat(row.costoUnitario) || 0);
      acc.totalUnidades += parseFloat(row.unidades) || 0;
      acc.totalValor += total;
      return acc;
    }, { totalUnidades: 0, totalValor: 0 });
  };

  // Funciones para Productos en Proceso
  const addProcessRow = () => {
    const newId = Math.max(...processRows.map(r => r.id), 0) + 1;
    setProcessRows([...processRows, { id: newId, detalle: '', producto: '', cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0 }]);
  };

  const removeProcessRow = (id) => {
    if (processRows.length > 1) {
      setProcessRows(processRows.filter(row => row.id !== id));
    }
  };

  const updateProcessRow = (id, field, value) => {
    setProcessRows(processRows.map(row => 
      row.id === id ? { ...row, [field]: field === 'detalle' || field === 'producto' ? value : parseFloat(value) || 0 } : row
    ));
  };

  const calculateProcessTotals = () => {
    return processRows.reduce((acc, row) => ({
      cantidad: acc.cantidad + (parseFloat(row.cantidad) || 0),
      materiales: acc.materiales + (parseFloat(row.materiales) || 0),
      manoObra: acc.manoObra + (parseFloat(row.manoObra) || 0),
      gastosF: acc.gastosF + (parseFloat(row.gastosF) || 0),
      total: acc.total + (parseFloat(row.materiales) || 0) + (parseFloat(row.manoObra) || 0) + (parseFloat(row.gastosF) || 0)
    }), { cantidad: 0, materiales: 0, manoObra: 0, gastosF: 0, total: 0 });
  };

  const exportData = () => {
  let exportObj = {};
  
  if (selectedProgram === 1) {
    const totals = calculateBalanceTotals(balanceRows);
    exportObj = {
      reportName: reportData.name,
      type: 'Balance de Saldos',
      date: reportData.date,
      rows: balanceRows,
      totals: totals,
      customAccounts: cuentasCatalogo.slice(15)
    };
  } else if (selectedProgram === 2) {
    const inventoryTotals = calculateInventoryTotals(inventoryRows);
    const processTotals = calculateProcessTotals(processRows);
    exportObj = {
      reportName: reportData.name,
      type: 'Inventario y Productos en Proceso',
      date: reportData.date,
      inventory: {
        rows: inventoryRows,
        totals: inventoryTotals
      },
      process: {
        rows: processRows,
        totals: processTotals
      }
    };
  } else if (selectedProgram === 3) {
    // NUEVO: Exportar Registros Contables
    const totals = calculateRegistrosTotals();
    const movementsSummary = getMovementsByCuenta(registrosRows);
    exportObj = {
      reportName: reportData.name,
      type: 'Registros Contables',
      date: reportData.date,
      rows: registrosRows,
      totals: totals,
      movementsSummary: movementsSummary,
      asientos: getAsientosList()
    };
  } else if (selectedProgram) {
    const totals = calculateGeneralTotals(generalRows);
    exportObj = {
      reportName: reportData.name,
      type: subprogramas.find(p => p.id === selectedProgram)?.name,
      date: reportData.date,
      rows: generalRows,
      totals: totals
    };
  }
  
  console.log('Datos exportados:', exportObj);
  window.reportData = exportObj;
  alert('Datos exportados. Revisa la consola para más detalles.');
  return exportObj;
};


const saveReport = async () => {
  const data = exportData();
  
  if (!reportData.name) {
    alert('Por favor ingresa un nombre para el reporte');
    return;
  }

  try {
    let bodyData;
    
    if (selectedProgram === 2) {
      bodyData = {
        userId: currentUser.userId,
        name: reportData.name,
        reportType: data.type,
        programId: selectedProgram,
        date: reportData.date,
        data: { inventory: data.inventory, process: data.process },
        totals: data.totals
      };
    } else if (selectedProgram === 3) {
      // NUEVO: Guardar Registros Contables
      bodyData = {
        userId: currentUser.userId,
        name: reportData.name,
        reportType: data.type,
        programId: selectedProgram,
        date: reportData.date,
        data: data.rows,
        totals: data.totals,
        metadata: {
          asientos: data.asientos,
          movementsSummary: data.movementsSummary
        }
      };
    } else {
      bodyData = {
        userId: currentUser.userId,
        name: reportData.name,
        reportType: data.type,
        programId: selectedProgram,
        date: reportData.date,
        data: data.rows,
        totals: data.totals
      };
    }

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

  const getIconComponent = (iconType) => {
    const iconMap = {
      balance: Calculator,
      inventory: Package,
      costs: DollarSign,
      results: BarChart3,
      calendar: Calendar,
      weekly: FileText
    };
    const Icon = iconMap[iconType] || FileText;
    return <Icon className="w-8 h-8 sm:w-10 md:w-12 text-white" />;
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totals = selectedProgram === 1 ? calculateBalanceTotals() : 
                  selectedProgram === 2 ? (inventoryModule === 'inventory' ? calculateInventoryTotals() : calculateProcessTotals()) :
                  calculateGeneralTotals();

  // Cargar catálogo de cuentas al montar el componente
  useEffect(() => {
    loadCuentasCatalogo();
  }, []);

  const [registrosRows, setRegistrosRows] = useState([
  { 
    id: 1, 
    fecha: new Date().toISOString().split('T')[0],
    noAsiento: 1,
    cuenta: '', 
    clasificacion: '', 
    debe: 0, 
    haber: 0,
    concepto: '',
    isNewAccount: false 
  }
]);
  const [currentAsiento, setCurrentAsiento] = useState(1);
// ==================== FUNCIONES PARA REGISTROS CONTABLES ====================
// Agregar estas funciones junto con las otras funciones del componente:

const addRegistroRow = () => {
  const newId = Math.max(...registrosRows.map(r => r.id), 0) + 1;
  setRegistrosRows([...registrosRows, { 
    id: newId, 
    fecha: new Date().toISOString().split('T')[0],
    noAsiento: currentAsiento,
    cuenta: '', 
    clasificacion: '', 
    debe: 0, 
    haber: 0,
    concepto: '',
    isNewAccount: false 
  }]);
};

const removeRegistroRow = (id) => {
  if (registrosRows.length > 1) {
    setRegistrosRows(registrosRows.filter(row => row.id !== id));
  }
};


const updateRegistroRow = (id, field, value) => {
  setRegistrosRows(registrosRows.map(row => {
    if (row.id === id) {
      if (field === 'cuenta') {
        // Buscar cuenta en catálogo
        const cuentaInfo = cuentasCatalogo.find(c => c.cuenta.toLowerCase() === value.toLowerCase());
        if (cuentaInfo) {
          // Cuenta existente: auto-asignar clasificación
          return { 
            ...row, 
            cuenta: value, 
            clasificacion: cuentaInfo.clasificacion, 
            isNewAccount: false,
            // Al cambiar la cuenta, resetear debe y haber
            debe: 0,
            haber: 0
          };
        } else {
          // Cuenta nueva
          return { 
            ...row, 
            cuenta: value, 
            clasificacion: row.clasificacion || '', 
            isNewAccount: true,
            debe: 0,
            haber: 0
          };
        }
      } else if (field === 'clasificacion') {
        // Cambio manual de clasificación
        const updatedRow = { ...row, clasificacion: value };
        
        // Si es cuenta nueva y ahora tiene clasificación, agregarla al catálogo
        if (row.isNewAccount && row.cuenta && value) {
          const existsInCatalog = cuentasCatalogo.some(c => c.cuenta.toLowerCase() === row.cuenta.toLowerCase());
          if (!existsInCatalog) {
            setCuentasCatalogo([...cuentasCatalogo, { cuenta: row.cuenta, clasificacion: value }]);
            saveNewCuentaToBackend(row.cuenta, value);
            updatedRow.isNewAccount = false;
          }
        }
        
        // Al cambiar clasificación, resetear debe y haber
        updatedRow.debe = 0;
        updatedRow.haber = 0;
        
        return updatedRow;
      } else if (field === 'debe') {
        // Al ingresar en DEBE, limpiar HABER automáticamente
        const newValue = parseFloat(value) || 0;
        return { 
          ...row, 
          debe: newValue,
          haber: newValue > 0 ? 0 : row.haber // Si ingresa en debe, limpiar haber
        };
      } else if (field === 'haber') {
        // Al ingresar en HABER, limpiar DEBE automáticamente
        const newValue = parseFloat(value) || 0;
        return { 
          ...row, 
          haber: newValue,
          debe: newValue > 0 ? 0 : row.debe // Si ingresa en haber, limpiar debe
        };
      }
      return { ...row, [field]: value };
    }
    return row;
  }));
};

const calculateRegistrosTotals = () => {
  return registrosRows.reduce((acc, row) => {
    acc.debe += parseFloat(row.debe) || 0;
    acc.haber += parseFloat(row.haber) || 0;
    return acc;
  }, { debe: 0, haber: 0 });
};

const startNewAsiento = () => {
  const totals = calculateRegistrosTotals();
  const currentAsientoRows = registrosRows.filter(r => r.noAsiento === currentAsiento);
  const asientoBalance = checkAsientoBalance(currentAsientoRows);
  
  if (!asientoBalance.isBalanced) {
    alert(`El asiento ${currentAsiento} no está balanceado. Debe = ${asientoBalance.debe.toFixed(2)}, Haber = ${asientoBalance.haber.toFixed(2)}`);
    return;
  }
  
  if (currentAsientoRows.length < 2) {
    alert('Un asiento debe tener al menos 2 movimientos');
    return;
  }
  
  const nextAsiento = currentAsiento + 1;
  setCurrentAsiento(nextAsiento);
  
  // Agregar primera fila del nuevo asiento
  const newId = Math.max(...registrosRows.map(r => r.id), 0) + 1;
  setRegistrosRows([...registrosRows, { 
    id: newId, 
    fecha: new Date().toISOString().split('T')[0],
    noAsiento: nextAsiento,
    cuenta: '', 
    clasificacion: '', 
    debe: 0, 
    haber: 0,
    concepto: '',
    isNewAccount: false 
  }]);
};

const changeAsiento = (asientoNum) => {
  setCurrentAsiento(asientoNum);
};

const getAsientosList = () => {
  const asientos = [...new Set(registrosRows.map(r => r.noAsiento))].sort((a, b) => a - b);
  return asientos;
};


// ==================== FUNCIONES PARA MAYORES AUXILIARES ====================
// Agregar estas funciones junto con las otras funciones del componente:

// Cargar reportes disponibles por tipo
const getReportesByTipo = (programId) => {
  return reports.filter(r => r.programId === programId);
};

// Cargar datos del reporte seleccionado
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

// Procesar reportes seleccionados y generar listas
const procesarReportesSeleccionados = async () => {
  if (!selectedReportes.balance || !selectedReportes.registros) {
    alert('Debes seleccionar al menos Balance de Saldos y Registros Contables');
    return;
  }

  try {
    // Cargar datos de cada reporte
    const balanceData = await loadReportData(selectedReportes.balance);
    const registrosData = await loadReportData(selectedReportes.registros);
    
    let inventarioData = null;
    if (selectedReportes.inventario) {
      inventarioData = await loadReportData(selectedReportes.inventario);
    }

    if (!balanceData || !registrosData) {
      alert('Error al cargar los datos de los reportes');
      return;
    }

    // Extraer filas de cada reporte
    const balanceRows = balanceData.data || [];
    const registrosRows = registrosData.data || [];
    const processRows = inventarioData?.data?.process || [];

    // Generar listas de cuentas y órdenes disponibles
    const cuentas = getCuentasDisponibles(balanceRows, registrosRows);
    const ordenes = getOrdenesDisponibles(processRows);

    setCuentasDisponibles(cuentas);
    setOrdenesDisponibles(ordenes);

    // Guardar datos cargados para uso posterior
    window.mayoresData = {
      balance: balanceRows,
      registros: registrosRows,
      process: processRows
    };

    // Seleccionar primera cuenta/orden automáticamente
    if (cuentas.length > 0) {
      setSelectedCuenta(cuentas[0].cuenta);
      generarEsquemaCuenta(cuentas[0].cuenta, balanceRows, registrosRows);
    }
    if (ordenes.length > 0) {
      setSelectedOrden(ordenes[0].detalle);
    }

  } catch (error) {
    console.error('Error al procesar reportes:', error);
    alert('Error al procesar los reportes seleccionados');
  }
};

// Generar esquema de T para una cuenta
const generarEsquemaCuenta = (cuenta, balanceRows, registrosRows) => {
  const saldoInicial = getSaldoInicialCuenta(cuenta, balanceRows);
  const movimientos = getMovimientosCuenta(cuenta, registrosRows);
  const esquema = calcularEsquemaCuenta(cuenta, saldoInicial, movimientos);
  setEsquemaActual(esquema);
};

// Generar esquema de T para una orden
const generarEsquemaOrden = (ordenDetalle, processRows, registrosRows) => {
  const saldoInicial = getSaldoInicialOrden(ordenDetalle, processRows);
  const movimientos = getMovimientosCuenta(ordenDetalle, registrosRows);
  const esquema = calcularEsquemaOrden(ordenDetalle, saldoInicial, movimientos);
  setEsquemaActual(esquema);
};

// Cambiar cuenta seleccionada
const handleChangeCuenta = (cuenta) => {
  setSelectedCuenta(cuenta);
  if (window.mayoresData) {
    generarEsquemaCuenta(cuenta, window.mayoresData.balance, window.mayoresData.registros);
  }
};

// Cambiar orden seleccionada
const handleChangeOrden = (orden) => {
  setSelectedOrden(orden);
  if (window.mayoresData) {
    generarEsquemaOrden(orden, window.mayoresData.process, window.mayoresData.registros);
  }
};


  // ==================== VISTA: LOGIN / REGISTRO ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Financial Reports Pro
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Sistema automatizado de reportes financieros
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border border-gray-100">
            <div className="flex mb-5 sm:mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-3 sm:px-4 rounded-md font-medium transition-all text-sm sm:text-base ${
                  isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-3 sm:px-4 rounded-md font-medium transition-all text-sm sm:text-base ${
                  !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  ID de Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.userId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu ID de usuario"
                  />
                </div>
                {errors.userId && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs sm:text-sm">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{errors.userId}</span>
                  </div>
                )}
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        className={`w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa tu nombre completo"
                      />
                    </div>
                    {errors.name && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-xs sm:text-sm">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        className={`w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-xs sm:text-sm">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-10 sm:pl-11 pr-10 sm:pr-11 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs sm:text-sm">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
                
                {!isLogin && formData.password && (
                  <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg space-y-1.5 sm:space-y-2">
                    <p className="text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">Requisitos de contraseña:</p>
                    {[
                      { key: 'length', text: 'Mínimo 8 caracteres' },
                      { key: 'uppercase', text: 'Al menos una mayúscula' },
                      { key: 'lowercase', text: 'Al menos una minúscula' },
                      { key: 'number', text: 'Al menos un número' },
                      { key: 'special', text: 'Al menos un carácter especial' }
                    ].map(req => (
                      <div key={req.key} className={`flex items-center gap-1.5 sm:gap-2 text-xs ${passwordRequirements[req.key] ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements[req.key] ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-300 rounded-full" />}
                        <span>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className={`w-full pl-10 sm:pl-11 pr-10 sm:pr-11 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirma tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs sm:text-sm">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 text-sm sm:text-base"
              >
                {isLoading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </div>

            <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
              {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
              <button
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 text-center text-xs text-gray-500">
            🔒 Tus datos están encriptados y seguros
          </div>
        </div>
      </div>
    );
  }

  // ==================== VISTA: MENÚ PRINCIPAL ====================
  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">Financial Reports Pro</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px]">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{currentUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Menú Principal</h2>
            <p className="text-sm sm:text-base text-gray-600">Selecciona una opción para continuar</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={() => setCurrentView('createReport')}
              className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-500 transition-all"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Nuevo Registro</h3>
              <p className="text-sm sm:text-base text-gray-600">Crear un nuevo reporte financiero</p>
            </button>

            <button
              onClick={() => setCurrentView('reports')}
              className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-500 transition-all"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Ver Reportes</h3>
              <p className="text-sm sm:text-base text-gray-600">Acceder a reportes existentes</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== VISTA: REPORTES EXISTENTES ====================
  if (currentView === 'reports') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setCurrentView('menu')}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Mis Reportes</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden md:block text-right">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px]">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{currentUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
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
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
            {filteredReports.length} {filteredReports.length === 1 ? 'reporte encontrado' : 'reportes encontrados'}
          </div>

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredReports.map(report => (
                <button
                  key={report.id}
                  onClick={() => alert(`Abriendo: ${report.name}`)}
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

          {viewMode === 'list' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredReports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => alert(`Abriendo: ${report.name}`)}
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

  // ==================== VISTA: CREAR REPORTE - SELECCIÓN ====================
  if (currentView === 'createReport' && selectedProgram === null) {
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Reporte</h1>
            <p className="text-sm sm:text-base text-gray-600">Selecciona el tipo de reporte que deseas crear</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Reporte</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Reporte</label>
                <input
                  type="text"
                  value={reportData.name}
                  onChange={(e) => setReportData({...reportData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Reporte Mensual Enero 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
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
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600">{programa.name}</h3>
                  <p className="text-xs text-gray-500">Programa {programa.id}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== VISTA: BALANCE DE SALDOS ====================
  if (currentView === 'createReport' && selectedProgram === 1) {
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Balance de Saldos</h1>
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
                  onClick={exportData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          </div>

          {/* Instrucciones de uso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Cómo agregar cuentas</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <strong>Cuenta existente:</strong> Selecciona del listado desplegable. La clasificación se asignará automáticamente.</li>
                  <li>• <strong>Cuenta nueva:</strong> Escribe el nombre libremente y selecciona su clasificación (Activo, Pasivo o Capital).</li>
                  <li>• Las cuentas nuevas se agregarán al catálogo para futuros reportes.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cuenta</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Clasificación</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Deudor</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acreedor</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {balanceRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="relative">
                          <input
                            type="text"
                            list={`cuentas-list-${row.id}`}
                            value={row.cuenta}
                            onChange={(e) => updateBalanceRow(row.id, 'cuenta', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Escribir o seleccionar cuenta..."
                          />
                          <datalist id={`cuentas-list-${row.id}`}>
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
                            onChange={(e) => updateBalanceRow(row.id, 'clasificacion', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Activo">Activo</option>
                            <option value="Pasivo">Pasivo</option>
                            <option value="Capital">Capital</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row.clasificacion}
                            readOnly
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-gray-50 cursor-not-allowed"
                            placeholder="Auto-asignada"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.clasificacion === 'Activo' ? (
                          <input
                            type="number"
                            value={row.monto || ''}
                            onChange={(e) => updateBalanceRow(row.id, 'monto', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            step="0.01"
                          />
                        ) : (
                          <span className="block px-2 py-1.5 text-sm text-gray-400 text-right">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.clasificacion === 'Pasivo' || row.clasificacion === 'Capital' ? (
                          <input
                            type="number"
                            value={row.monto || ''}
                            onChange={(e) => updateBalanceRow(row.id, 'monto', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            step="0.01"
                          />
                        ) : (
                          <span className="block px-2 py-1.5 text-sm text-gray-400 text-right">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeBalanceRow(row.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          disabled={balanceRows.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="px-4 py-3 text-sm">TOTALES</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right text-sm text-blue-700">
                      ${totals.deudor.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-blue-700">
                      ${totals.acreedor.toFixed(2)}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={addBalanceRow}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar Fila
          </button>

          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificación de Balance</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Deudor</p>
                <p className="text-2xl font-bold text-blue-700">${totals.deudor.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Acreedor</p>
                <p className="text-2xl font-bold text-green-700">${totals.acreedor.toFixed(2)}</p>
              </div>
              <div className={`rounded-lg p-4 ${Math.abs(totals.deudor - totals.acreedor) < 0.01 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm text-gray-600 mb-1">Diferencia</p>
                <p className={`text-2xl font-bold ${Math.abs(totals.deudor - totals.acreedor) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                  ${Math.abs(totals.deudor - totals.acreedor).toFixed(2)}
                </p>
                {Math.abs(totals.deudor - totals.acreedor) < 0.01 && (
                  <p className="text-xs text-green-600 mt-1">✓ Balance cuadrado</p>
                )}
              </div>
            </div>
          </div>

          {/* Cuentas agregadas en esta sesión */}
          {cuentasCatalogo.length > 15 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cuentas Personalizadas Agregadas ({cuentasCatalogo.length - 15})
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cuentasCatalogo.slice(15).map((cuenta, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{cuenta.cuenta}</p>
                      <p className="text-xs text-gray-600">{cuenta.clasificacion}</p>
                    </div>
                    <span className="ml-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                      Nueva
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-600">
                💡 Estas cuentas ahora están disponibles en el catálogo para futuros reportes.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== VISTA: INVENTARIO Y PRODUCTOS EN PROCESO ====================
  if (currentView === 'createReport' && selectedProgram === 2) {
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Inventario y Productos en Proceso</h1>
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
                  onClick={exportData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          </div>

          {/* Tabs para alternar entre Inventario y Productos en Proceso */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setInventoryModule('inventory')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  inventoryModule === 'inventory'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>Inventario Actual</span>
                </div>
              </button>
              <button
                onClick={() => setInventoryModule('inProcess')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  inventoryModule === 'inProcess'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  <span>Productos en Proceso</span>
                </div>
              </button>
            </div>
          </div>

          {/* MÓDULO: INVENTARIO ACTUAL */}
          {inventoryModule === 'inventory' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Unidades</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Costo Unitario</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inventoryRows.map((row) => {
                        const totalRow = (parseFloat(row.unidades) || 0) * (parseFloat(row.costoUnitario) || 0);
                        return (
                          <tr key={row.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={row.producto}
                                onChange={(e) => updateInventoryRow(row.id, 'producto', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nombre del producto..."
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={row.unidades || ''}
                                onChange={(e) => updateInventoryRow(row.id, 'unidades', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                                step="1"
                                min="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={row.costoUnitario || ''}
                                onChange={(e) => updateInventoryRow(row.id, 'costoUnitario', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                              />
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                              ${totalRow.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => removeInventoryRow(row.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                disabled={inventoryRows.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Fila de totales */}
                      <tr className="bg-blue-50 font-semibold">
                        <td className="px-4 py-3 text-sm">TOTALES</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-700">
                          {totals.totalUnidades}
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right text-sm text-blue-700">
                          ${totals.totalValor.toFixed(2)}
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={addInventoryRow}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </button>

              {/* Resumen de Inventario */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Inventario</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Productos</p>
                    <p className="text-2xl font-bold text-blue-700">{inventoryRows.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Unidades</p>
                    <p className="text-2xl font-bold text-green-700">{totals.totalUnidades}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                    <p className="text-2xl font-bold text-purple-700">${totals.totalValor.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MÓDULO: PRODUCTOS EN PROCESO */}
          {inventoryModule === 'inProcess' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Detalle (Orden)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cantidad</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Materiales</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Mano de Obra</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Gastos Fab.</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {processRows.map((row) => {
                        const totalRow = (parseFloat(row.materiales) || 0) + (parseFloat(row.manoObra) || 0) + (parseFloat(row.gastosF) || 0);
                        return (
                          <tr key={row.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={row.detalle}
                                onChange={(e) => updateProcessRow(row.id, 'detalle', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Orden #001"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={row.producto}
                                onChange={(e) => updateProcessRow(row.id, 'producto', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nombre del producto..."
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={row.cantidad || ''}
                                onChange={(e) => updateProcessRow(row.id, 'cantidad', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                                step="1"
                                min="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={row.materiales || ''}
                                onChange={(e) => updateProcessRow(row.id, 'materiales', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={row.manoObra || ''}
                                onChange={(e) => updateProcessRow(row.id, 'manoObra', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={row.gastosF || ''}
                                onChange={(e) => updateProcessRow(row.id, 'gastosF', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                              />
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                              ${totalRow.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => removeProcessRow(row.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                disabled={processRows.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Fila de totales */}
                      <tr className="bg-blue-50 font-semibold">
                        <td className="px-4 py-3 text-sm" colSpan="2">TOTALES</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-700">{totals.cantidad}</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.materiales.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.manoObra.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.gastosF.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.total.toFixed(2)}</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={addProcessRow}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar Orden
              </button>

              {/* Resumen de Productos en Proceso */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Productos en Proceso</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Órdenes</p>
                    <p className="text-2xl font-bold text-blue-700">{processRows.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Materiales</p>
                    <p className="text-2xl font-bold text-green-700">${totals.materiales.toFixed(2)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Mano de Obra</p>
                    <p className="text-2xl font-bold text-orange-700">${totals.manoObra.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total General</p>
                    <p className="text-2xl font-bold text-purple-700">${totals.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  
// ==================== VISTA: REGISTROS CONTABLES ====================
if (currentView === 'createReport' && selectedProgram === 3) {
  const totalsRegistros = calculateRegistrosTotals();
  const currentAsientoRows = registrosRows.filter(r => r.noAsiento === currentAsiento);
  const asientoBalance = checkAsientoBalance(currentAsientoRows);
  const asientosList = getAsientosList();
  const movementsSummary = getMovementsByCuenta(registrosRows);

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
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Información sobre asientos contables */}
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

        {/* Selector de Asiento y nuevo asiento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Asiento No.:</label>
              <select
                value={currentAsiento}
                onChange={(e) => changeAsiento(parseInt(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {asientosList.map(num => (
                  <option key={num} value={num}>
                    Asiento #{num}
                  </option>
                ))}
              </select>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                asientoBalance.isBalanced 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {asientoBalance.isBalanced ? '✓ Balanceado' : '✗ No Balanceado'}
              </div>
            </div>
            <button
              onClick={startNewAsiento}
              disabled={!asientoBalance.isBalanced || currentAsientoRows.length < 2}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Nuevo Asiento
            </button>
          </div>
        </div>

        {/* Tabla de movimientos del asiento actual */}
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
                      {row.clasificacion ? (
                        // Si tiene clasificación, permitir entrada
                        <input
                          type="number"
                          value={row.debe || ''}
                          onChange={(e) => updateRegistroRow(row.id, 'debe', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        // Sin clasificación, deshabilitar
                        <input
                          type="number"
                          value={row.debe || ''}
                          onChange={(e) => updateRegistroRow(row.id, 'debe', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded text-right bg-gray-50 cursor-not-allowed"
                          placeholder="Selecciona cuenta"
                          disabled
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.clasificacion ? (
                        // Si tiene clasificación, permitir entrada
                        <input
                          type="number"
                          value={row.haber || ''}
                          onChange={(e) => updateRegistroRow(row.id, 'haber', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        // Sin clasificación, deshabilitar
                        <input
                          type="number"
                          value={row.haber || ''}
                          onChange={(e) => updateRegistroRow(row.id, 'haber', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded text-right bg-gray-50 cursor-not-allowed"
                          placeholder="Selecciona cuenta"
                          disabled
                        />
                      )}
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
                {/* Totales del asiento actual */}
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
              {Math.abs(totalsRegistros.debe - totalsRegistros.haber) < 0.01 && (
                <p className="text-xs text-green-600 mt-1">✓ Balance perfecto</p>
              )}
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



// ==================== VISTA DEL SUBPROGRAMA 4 ====================
// Agregar esta condición después del subprograma 3 y antes del formulario general:

// ==================== VISTA: MAYORES AUXILIARES ====================
if (currentView === 'createReport' && selectedProgram === 4) {
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

        {/* Información sobre Mayores Auxiliares */}
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

        {/* Contenido de Mayores (solo si hay datos cargados) */}
        {cuentasDisponibles.length > 0 && (
          <>
            {/* Tabs para alternar entre Cuentas y Órdenes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => {
                    setMayoresModule('cuentas');
                    if (selectedCuenta && window.mayoresData) {
                      generarEsquemaCuenta(selectedCuenta, window.mayoresData.balance, window.mayoresData.registros);
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
                      generarEsquemaOrden(selectedOrden, window.mayoresData.process, window.mayoresData.registros);
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
                {esquemaActual && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header del Esquema */}
                    <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
                      <h3 className="text-lg font-bold text-gray-900">{esquemaActual.cuenta}</h3>
                      {esquemaActual.clasificacion && (
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                          esquemaActual.clasificacion === 'Activo' ? 'bg-blue-100 text-blue-700' :
                          esquemaActual.clasificacion === 'Pasivo' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {esquemaActual.clasificacion}
                        </span>
                      )}
                    </div>

                    {/* Esquema de T Visual */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 border border-gray-300">
                        {/* Columna DEBE */}
                        <div className="border-r border-gray-300">
                          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                            <h4 className="text-sm font-bold text-gray-900 text-center">DEBE</h4>
                          </div>
                          <div className="min-h-[300px]">
                            {/* Saldo Inicial */}
                            {esquemaActual.columnaInicial === 'debe' && esquemaActual.saldoInicial > 0 && (
                              <div className="px-4 py-2 border-b border-gray-200 bg-blue-50">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 italic">Saldo Inicial</span>
                                  <span className="font-semibold text-blue-700">
                                    ${esquemaActual.saldoInicial.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Movimientos en DEBE */}
                            {esquemaActual.movimientos.map((mov, idx) => (
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
                                ${esquemaActual.totalDebe.toFixed(2)}
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
                            {/* Saldo Inicial */}
                            {esquemaActual.columnaInicial === 'haber' && esquemaActual.saldoInicial > 0 && (
                              <div className="px-4 py-2 border-b border-gray-200 bg-green-50">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 italic">Saldo Inicial</span>
                                  <span className="font-semibold text-green-700">
                                    ${esquemaActual.saldoInicial.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Movimientos en HABER */}
                            {esquemaActual.movimientos.map((mov, idx) => (
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
                                ${esquemaActual.totalHaber.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Saldo Final */}
                      <div className="mt-4 bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-gray-900">SALDO FINAL:</span>
                          <span className="text-xl font-bold text-orange-700">
                            ${Math.abs(esquemaActual.saldoFinal).toFixed(2)}
                            {esquemaActual.clasificacion === 'Activo' && esquemaActual.saldoFinal >= 0 && ' (Deudor)'}
                            {esquemaActual.clasificacion === 'Activo' && esquemaActual.saldoFinal < 0 && ' (Acreedor)'}
                            {(esquemaActual.clasificacion === 'Pasivo' || esquemaActual.clasificacion === 'Capital') && esquemaActual.saldoFinal >= 0 && ' (Acreedor)'}
                            {(esquemaActual.clasificacion === 'Pasivo' || esquemaActual.clasificacion === 'Capital') && esquemaActual.saldoFinal < 0 && ' (Deudor)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                    {esquemaActual && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header del Esquema */}
                        <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                          <h3 className="text-lg font-bold text-gray-900">{esquemaActual.orden}</h3>
                          <p className="text-sm text-gray-600 mt-1">{esquemaActual.producto}</p>
                        </div>

                        {/* Esquema de T Visual */}
                        <div className="p-6">
                          <div className="grid grid-cols-2 border border-gray-300">
                            {/* Columna DEBE */}
                            <div className="border-r border-gray-300">
                              <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                                <h4 className="text-sm font-bold text-gray-900 text-center">DEBE</h4>
                              </div>
                              <div className="min-h-[300px]">
                                {/* Saldo Inicial (siempre en DEBE para órdenes) */}
                                {esquemaActual.saldoInicial > 0 && (
                                  <div className="px-4 py-2 border-b border-gray-200 bg-green-50">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600 italic">Costo Inicial</span>
                                      <span className="font-semibold text-green-700">
                                        ${esquemaActual.saldoInicial.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Movimientos en DEBE */}
                                {esquemaActual.movimientos.map((mov, idx) => (
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
                                    ${esquemaActual.totalDebe.toFixed(2)}
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
                                {/* Movimientos en HABER */}
                                {esquemaActual.movimientos.map((mov, idx) => (
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
                                    ${esquemaActual.totalHaber.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Saldo Final */}
                          <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-base font-bold text-gray-900">COSTO ACUMULADO:</span>
                              <span className="text-xl font-bold text-green-700">
                                ${Math.abs(esquemaActual.saldoFinal).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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

  // ==================== VISTA: FORMULARIO GENERAL (otros programas) ====================
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {SUBPROGRAMAS.find(p => p.id === selectedProgram)?.name}
              </h1>
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
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Este subprograma está en desarrollo. La interfaz será personalizada según los requisitos específicos.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Detalle de Orden</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Cantidad</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Materiales</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Mano de Obra</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Gastos Fab.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {generalRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.detalle}
                        onChange={(e) => updateGeneralRow(row.id, 'detalle', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Detalle..."
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.producto}
                        onChange={(e) => updateGeneralRow(row.id, 'producto', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Producto..."
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.cantidad || ''}
                        onChange={(e) => updateGeneralRow(row.id, 'cantidad', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        step="1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.materiales || ''}
                        onChange={(e) => updateGeneralRow(row.id, 'materiales', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.manoObra || ''}
                        onChange={(e) => updateGeneralRow(row.id, 'manoObra', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.gastosF || ''}
                        onChange={(e) => updateGeneralRow(row.id, 'gastosF', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeGeneralRow(row.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={generalRows.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-3 text-sm" colSpan="2">TOTALES</td>
                  <td className="px-4 py-3 text-right text-sm text-blue-700">{totals.cantidad}</td>
                  <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.materiales.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.manoObra.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-sm text-blue-700">${totals.gastosF.toFixed(2)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
                <tr className="bg-blue-100 font-bold">
                  <td className="px-4 py-3 text-sm" colSpan="6">TOTAL GENERAL</td>
                  <td className="px-4 py-3 text-right text-sm text-blue-800">${totals.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={addGeneralRow}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Fila
        </button>
      </div>
    </div>
  );
}