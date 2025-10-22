import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  getSaldoInicialCuenta,
  getSaldoInicialOrden,
  getMovimientosCuenta,
  calcularEsquemaCuenta,
  calcularEsquemaOrden,
  getCuentasDisponibles,
  getOrdenesDisponibles
} from '../utils/mayoresUtils';

export const useMayores = () => {
  const { reports, API_URL } = useApp();
  
  const [mayoresModule, setMayoresModule] = useState('cuentas');
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

  // Obtener reportes por tipo
  const getReportesByTipo = (programId) => {
    console.log('🔍 getReportesByTipo llamado con programId:', programId);
    console.log('🔍 Total de reports en memoria:', reports.length);
    console.log('🔍 Reports completos:', reports);
    
    const filtered = reports.filter(r => r.programId === programId);
    
    console.log(`🔍 Reportes filtrados para programa ${programId}:`, filtered.length);
    
    return filtered;
  };

// Procesar reportes seleccionados
const procesarReportesSeleccionados = async () => {
  if (!selectedReportes.balance || !selectedReportes.registros) {
    alert('Debes seleccionar al menos Balance de Saldos y Registros Contables');
    return false;
  }

  try {
    const balanceData = await loadReportData(selectedReportes.balance);
    const registrosData = await loadReportData(selectedReportes.registros);
    
    let inventarioData = null;
    if (selectedReportes.inventario) {
      inventarioData = await loadReportData(selectedReportes.inventario);
    }

    if (!balanceData || !registrosData) {
      alert('Error al cargar los datos de los reportes');
      return false;
    }

    let balanceRows = [];
    let registrosRows = [];
    let processRows = [];

    if (Array.isArray(balanceData.data)) {
      balanceRows = balanceData.data;
    } else {
      console.warn('⚠️ Estructura inesperada en balanceData:', balanceData);
    }

    if (Array.isArray(registrosData.data)) {
      registrosRows = registrosData.data;
    } else {
      console.warn('⚠️ Estructura inesperada en registrosData:', registrosData);
    }

    if (inventarioData) {
      if (inventarioData.data && typeof inventarioData.data === 'object') {
        if (inventarioData.data.process) {
          if (Array.isArray(inventarioData.data.process.rows)) {
            processRows = inventarioData.data.process.rows;
          } else if (Array.isArray(inventarioData.data.process)) {
            processRows = inventarioData.data.process;
          }
        }
      } else {
        console.warn('⚠️ Estructura inesperada en inventarioData:', inventarioData);
      }
    }

    console.log('✅ Datos procesados exitosamente:', {
      balanceRows: balanceRows.length,
      registrosRows: registrosRows.length,
      processRows: processRows.length
    });

    // ⭐⭐⭐ DEBUGGING CRÍTICO - AGREGA ESTAS LÍNEAS ⭐⭐⭐
    console.log('🔍 balanceRows completo:', balanceRows);
    console.log('🔍 registrosRows completo:', registrosRows);
    console.log('🔍 Llamando a getCuentasDisponibles...');
    
    const cuentas = getCuentasDisponibles(balanceRows, registrosRows);
    const ordenes = getOrdenesDisponibles(processRows);

    // ⭐⭐⭐ MÁS DEBUGGING ⭐⭐⭐
    console.log('🔍 Resultado de getCuentasDisponibles:', cuentas);
    console.log('🔍 Total de cuentas encontradas:', cuentas.length);
    console.log('🔍 Resultado de getOrdenesDisponibles:', ordenes);
    console.log('🔍 Total de órdenes encontradas:', ordenes.length);

    // Verificar que las funciones existan
    if (typeof getCuentasDisponibles !== 'function') {
      console.error('❌ ERROR: getCuentasDisponibles no es una función!');
      return false;
    }

    setCuentasDisponibles(cuentas);
    setOrdenesDisponibles(ordenes);

    // ⭐⭐⭐ VERIFICAR QUE SE ACTUALIZÓ EL ESTADO ⭐⭐⭐
    console.log('🔍 Estado antes de guardar en window:', {
      cuentasLength: cuentas.length,
      ordenesLength: ordenes.length
    });

    window.mayoresData = {
      balance: balanceRows,
      registros: registrosRows,
      process: processRows
    };

    console.log('🔍 window.mayoresData guardado:', window.mayoresData);

    if (cuentas.length > 0) {
      console.log('🔍 Seleccionando primera cuenta:', cuentas[0].cuenta);
      setSelectedCuenta(cuentas[0].cuenta);
      generarEsquemaCuenta(cuentas[0].cuenta, balanceRows, registrosRows);
    } else {
      console.warn('⚠️ No se encontraron cuentas disponibles');
      console.warn('⚠️ BalanceRows:', balanceRows);
      console.warn('⚠️ RegistrosRows:', registrosRows);
    }

    if (ordenes.length > 0) {
      setSelectedOrden(ordenes[0].detalle);
    } else {
      console.log('ℹ️ No hay órdenes de producción');
    }

    return true;

  } catch (error) {
    console.error('❌ Error al procesar reportes:', error);
    console.error('Stack trace:', error.stack);
    alert('Error al procesar los reportes seleccionados. Revisa la consola para más detalles.');
    return false;
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

  return {
    mayoresModule,
    setMayoresModule,
    selectedReportes,
    setSelectedReportes,
    selectedCuenta,
    setSelectedCuenta,
    selectedOrden,
    setSelectedOrden,
    cuentasDisponibles,
    setCuentasDisponibles,
    ordenesDisponibles,
    setOrdenesDisponibles,
    esquemaActual,
    setEsquemaActual,
    getReportesByTipo,
    procesarReportesSeleccionados,
    generarEsquemaCuenta,
    generarEsquemaOrden,
    handleChangeCuenta,
    handleChangeOrden
  };
};