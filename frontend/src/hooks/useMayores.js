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
    return reports.filter(r => r.programId === programId);
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

      const balanceRows = balanceData.data || [];
      const registrosRows = registrosData.data || [];
      const processRows = inventarioData?.data?.process || [];

      const cuentas = getCuentasDisponibles(balanceRows, registrosRows);
      const ordenes = getOrdenesDisponibles(processRows);

      setCuentasDisponibles(cuentas);
      setOrdenesDisponibles(ordenes);

      // Guardar datos para uso posterior
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

      return true;
    } catch (error) {
      console.error('Error al procesar reportes:', error);
      alert('Error al procesar los reportes seleccionados');
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