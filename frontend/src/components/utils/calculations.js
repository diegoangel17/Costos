// utils/calculations.js
// Funciones de cálculo reutilizables

import { BALANCE_TOLERANCE } from '../constants';

// ==================== BALANCE DE SALDOS ====================

/**
 * Calcular totales del Balance de Saldos
 * @param {Array} rows - Filas del balance
 * @returns {Object} Totales de deudor y acreedor
 */
export const calculateBalanceTotals = (rows) => {
  return rows.reduce((acc, row) => {
    const monto = parseFloat(row.monto) || 0;
    if (row.clasificacion === 'Activo') {
      acc.deudor += monto;
    } else if (row.clasificacion === 'Pasivo' || row.clasificacion === 'Capital') {
      acc.acreedor += monto;
    }
    return acc;
  }, { deudor: 0, acreedor: 0 });
};

/**
 * Verificar si el balance está cuadrado
 * @param {Object} totals - Totales {deudor, acreedor}
 * @returns {boolean} True si está balanceado
 */
export const isBalanced = (totals) => {
  return Math.abs(totals.deudor - totals.acreedor) < BALANCE_TOLERANCE;
};

/**
 * Obtener diferencia del balance
 * @param {Object} totals - Totales {deudor, acreedor}
 * @returns {number} Diferencia absoluta
 */
export const getBalanceDifference = (totals) => {
  return Math.abs(totals.deudor - totals.acreedor);
};

// ==================== INVENTARIO ====================

/**
 * Calcular totales de inventario
 * @param {Array} rows - Filas de inventario
 * @returns {Object} Totales de unidades y valor
 */
export const calculateInventoryTotals = (rows) => {
  return rows.reduce((acc, row) => {
    const unidades = parseFloat(row.unidades) || 0;
    const costoUnitario = parseFloat(row.costoUnitario) || 0;
    const total = unidades * costoUnitario;
    
    acc.totalUnidades += unidades;
    acc.totalValor += total;
    return acc;
  }, { totalUnidades: 0, totalValor: 0 });
};

/**
 * Calcular valor de una línea de inventario
 * @param {number} unidades - Cantidad de unidades
 * @param {number} costoUnitario - Costo por unidad
 * @returns {number} Valor total
 */
export const calculateInventoryLineTotal = (unidades, costoUnitario) => {
  return (parseFloat(unidades) || 0) * (parseFloat(costoUnitario) || 0);
};

// ==================== PRODUCTOS EN PROCESO ====================

/**
 * Calcular totales de productos en proceso
 * @param {Array} rows - Filas de productos en proceso
 * @returns {Object} Totales por categoría
 */
export const calculateProcessTotals = (rows) => {
  return rows.reduce((acc, row) => {
    const cantidad = parseFloat(row.cantidad) || 0;
    const materiales = parseFloat(row.materiales) || 0;
    const manoObra = parseFloat(row.manoObra) || 0;
    const gastosF = parseFloat(row.gastosF) || 0;
    
    acc.cantidad += cantidad;
    acc.materiales += materiales;
    acc.manoObra += manoObra;
    acc.gastosF += gastosF;
    acc.total += materiales + manoObra + gastosF;
    
    return acc;
  }, { 
    cantidad: 0, 
    materiales: 0, 
    manoObra: 0, 
    gastosF: 0, 
    total: 0 
  });
};

/**
 * Calcular total de una línea de producto en proceso
 * @param {number} materiales - Costo de materiales
 * @param {number} manoObra - Costo de mano de obra
 * @param {number} gastosF - Gastos de fabricación
 * @returns {number} Total de la línea
 */
export const calculateProcessLineTotal = (materiales, manoObra, gastosF) => {
  return (parseFloat(materiales) || 0) + 
         (parseFloat(manoObra) || 0) + 
         (parseFloat(gastosF) || 0);
};

// ==================== FORMULARIO GENERAL ====================

/**
 * Calcular totales del formulario general
 * @param {Array} rows - Filas del formulario
 * @returns {Object} Totales por categoría
 */
export const calculateGeneralTotals = (rows) => {
  return rows.reduce((acc, row) => {
    const cantidad = parseFloat(row.cantidad) || 0;
    const materiales = parseFloat(row.materiales) || 0;
    const manoObra = parseFloat(row.manoObra) || 0;
    const gastosF = parseFloat(row.gastosF) || 0;
    
    acc.cantidad += cantidad;
    acc.materiales += materiales;
    acc.manoObra += manoObra;
    acc.gastosF += gastosF;
    acc.total += materiales + manoObra + gastosF;
    
    return acc;
  }, { 
    cantidad: 0, 
    materiales: 0, 
    manoObra: 0, 
    gastosF: 0, 
    total: 0 
  });
};

// ==================== REGISTROS CONTABLES ====================

/**
 * Calcular totales de registros contables
 * @param {Array} rows - Filas de asientos contables
 * @returns {Object} Totales de debe y haber
 */
export const calculateRegistrosTotals = (rows) => {
  return rows.reduce((acc, row) => {
    const debe = parseFloat(row.debe) || 0;
    const haber = parseFloat(row.haber) || 0;
    
    acc.debe += debe;
    acc.haber += haber;
    return acc;
  }, { debe: 0, haber: 0 });
};

/**
 * Verificar si un asiento contable está balanceado
 * @param {Object} totals - Totales {debe, haber}
 * @returns {boolean} True si está balanceado
 */
export const isAsientoBalanced = (totals) => {
  return Math.abs(totals.debe - totals.haber) < BALANCE_TOLERANCE;
};

// ==================== COSTOS DE VENTA ====================

/**
 * Calcular costo de ventas
 * @param {number} inventarioInicial - Inventario inicial
 * @param {number} compras - Compras del periodo
 * @param {number} inventarioFinal - Inventario final
 * @returns {number} Costo de ventas
 */
export const calculateCostoVentas = (inventarioInicial, compras, inventarioFinal) => {
  const inicial = parseFloat(inventarioInicial) || 0;
  const comprasTotal = parseFloat(compras) || 0;
  const final = parseFloat(inventarioFinal) || 0;
  
  return inicial + comprasTotal - final;
};

/**
 * Calcular mercancía disponible
 * @param {number} inventarioInicial - Inventario inicial
 * @param {number} compras - Compras del periodo
 * @returns {number} Mercancía disponible
 */
export const calculateMercanciaDisponible = (inventarioInicial, compras) => {
  return (parseFloat(inventarioInicial) || 0) + (parseFloat(compras) || 0);
};

// ==================== ESTADO DE RESULTADOS ====================

/**
 * Calcular utilidad bruta
 * @param {number} ventas - Ventas totales
 * @param {number} costoVentas - Costo de ventas
 * @returns {number} Utilidad bruta
 */
export const calculateUtilidadBruta = (ventas, costoVentas) => {
  return (parseFloat(ventas) || 0) - (parseFloat(costoVentas) || 0);
};

/**
 * Calcular utilidad de operación
 * @param {number} utilidadBruta - Utilidad bruta
 * @param {number} gastosOperacion - Gastos de operación
 * @returns {number} Utilidad de operación
 */
export const calculateUtilidadOperacion = (utilidadBruta, gastosOperacion) => {
  return (parseFloat(utilidadBruta) || 0) - (parseFloat(gastosOperacion) || 0);
};

/**
 * Calcular utilidad neta
 * @param {number} utilidadOperacion - Utilidad de operación
 * @param {number} otrosIngresos - Otros ingresos
 * @param {number} otrosGastos - Otros gastos
 * @returns {number} Utilidad neta
 */
export const calculateUtilidadNeta = (utilidadOperacion, otrosIngresos, otrosGastos) => {
  const operacion = parseFloat(utilidadOperacion) || 0;
  const ingresos = parseFloat(otrosIngresos) || 0;
  const gastos = parseFloat(otrosGastos) || 0;
  
  return operacion + ingresos - gastos;
};

// ==================== UTILIDADES GENERALES ====================

/**
 * Redondear a 2 decimales
 * @param {number} value - Valor a redondear
 * @returns {number} Valor redondeado
 */
export const roundToTwo = (value) => {
  return Math.round((parseFloat(value) || 0) * 100) / 100;
};

/**
 * Calcular porcentaje
 * @param {number} value - Valor
 * @param {number} total - Total
 * @returns {number} Porcentaje
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((parseFloat(value) || 0) / (parseFloat(total) || 0)) * 100;
};

/**
 * Sumar array de números
 * @param {Array} values - Array de valores numéricos
 * @returns {number} Suma total
 */
export const sumArray = (values) => {
  return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
};