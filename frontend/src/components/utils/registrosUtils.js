// utils/registrosUtils.js
// Utilidades específicas para Registros Contables

/**
 * Determinar si una cuenta va en DEBE o HABER según su clasificación
 * @param {string} clasificacion - Clasificación de la cuenta
 * @returns {string} 'debe' o 'haber'
 */
export const getDefaultColumn = (clasificacion) => {
  // Regla contable:
  // - Activo aumenta en DEBE
  // - Pasivo aumenta en HABER
  // - Capital aumenta en HABER
  if (clasificacion === 'Activo') {
    return 'debe';
  }
  return 'haber'; // Pasivo o Capital
};

/**
 * Generar número de asiento consecutivo
 * @param {Array} rows - Filas existentes
 * @returns {number} Siguiente número de asiento
 */
export const generateAsientoNumber = (rows) => {
  if (rows.length === 0) return 1;
  
  const maxAsiento = Math.max(...rows.map(r => r.noAsiento || 0));
  return maxAsiento + 1;
};

/**
 * Agrupar filas por número de asiento
 * @param {Array} rows - Todas las filas
 * @returns {Object} Filas agrupadas por asiento
 */
export const groupByAsiento = (rows) => {
  return rows.reduce((acc, row) => {
    const asiento = row.noAsiento || 0;
    if (!acc[asiento]) {
      acc[asiento] = [];
    }
    acc[asiento].push(row);
    return acc;
  }, {});
};

/**
 * Verificar si un asiento específico está balanceado
 * @param {Array} asientoRows - Filas de un mismo asiento
 * @returns {Object} {isBalanced, debe, haber, diferencia}
 */
export const checkAsientoBalance = (asientoRows) => {
  const totals = asientoRows.reduce((acc, row) => {
    acc.debe += parseFloat(row.debe) || 0;
    acc.haber += parseFloat(row.haber) || 0;
    return acc;
  }, { debe: 0, haber: 0 });
  
  const diferencia = Math.abs(totals.debe - totals.haber);
  const isBalanced = diferencia < 0.01;
  
  return {
    isBalanced,
    debe: totals.debe,
    haber: totals.haber,
    diferencia
  };
};

/**
 * Obtener el último asiento registrado
 * @param {Array} rows - Todas las filas
 * @returns {number} Número del último asiento
 */
export const getLastAsientoNumber = (rows) => {
  if (rows.length === 0) return 0;
  return Math.max(...rows.map(r => r.noAsiento || 0));
};

/**
 * Validar que un asiento tenga al menos 2 movimientos
 * @param {Array} asientoRows - Filas del asiento
 * @returns {boolean} True si es válido
 */
export const isAsientoValid = (asientoRows) => {
  return asientoRows.length >= 2;
};

/**
 * Calcular total de movimientos por fecha
 * @param {Array} rows - Todas las filas
 * @param {string} fecha - Fecha a filtrar
 * @returns {Object} Totales de debe y haber
 */
export const getTotalsByDate = (rows, fecha) => {
  return rows
    .filter(row => row.fecha === fecha)
    .reduce((acc, row) => {
      acc.debe += parseFloat(row.debe) || 0;
      acc.haber += parseFloat(row.haber) || 0;
      return acc;
    }, { debe: 0, haber: 0 });
};

/**
 * Obtener resumen de movimientos por cuenta
 * @param {Array} rows - Todas las filas
 * @returns {Array} Resumen por cuenta
 */
export const getMovementsByCuenta = (rows) => {
  const summary = {};
  
  rows.forEach(row => {
    const cuenta = row.cuenta;
    if (!cuenta) return;
    
    if (!summary[cuenta]) {
      summary[cuenta] = {
        cuenta,
        clasificacion: row.clasificacion,
        totalDebe: 0,
        totalHaber: 0,
        movimientos: 0
      };
    }
    
    summary[cuenta].totalDebe += parseFloat(row.debe) || 0;
    summary[cuenta].totalHaber += parseFloat(row.haber) || 0;
    summary[cuenta].movimientos += 1;
  });
  
  return Object.values(summary);
};

/**
 * Formatear concepto con límite de caracteres
 * @param {string} concepto - Concepto del movimiento
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Concepto formateado
 */
export const formatConcepto = (concepto, maxLength = 50) => {
  if (!concepto) return '';
  if (concepto.length <= maxLength) return concepto;
  return concepto.slice(0, maxLength - 3) + '...';
};