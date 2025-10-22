// utils/formatters.js
// Funciones para formatear datos de visualización

// ==================== FORMATO DE MONEDA ====================

/**
 * Formatear número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: MXN)
 * @returns {string} Cantidad formateada
 */
export const formatCurrency = (amount, currency = 'MXN') => {
  const value = parseFloat(amount) || 0;
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formatear número como moneda sin símbolo
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada sin símbolo
 */
export const formatAmount = (amount) => {
  const value = parseFloat(amount) || 0;
  return value.toFixed(2);
};

/**
 * Formatear número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
  const value = parseFloat(number) || 0;
  return new Intl.NumberFormat('es-MX').format(value);
};

// ==================== FORMATO DE FECHAS ====================

/**
 * Formatear fecha a formato local
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('es-MX', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Formatear fecha a formato completo
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada con día de la semana
 */
export const formatDateLong = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('es-MX', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

/**
 * Formatear fecha a formato YYYY-MM-DD
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha en formato ISO
 */
export const formatDateISO = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toISOString().split('T')[0];
};

/**
 * Obtener periodo en formato YYYY-MM desde una fecha
 * @param {string|Date} dateString - Fecha
 * @returns {string} Periodo en formato YYYY-MM
 */
export const getPeriodoFromDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return `${year}-${month}`;
};

/**
 * Formatear periodo YYYY-MM a texto legible
 * @param {string} periodo - Periodo en formato YYYY-MM
 * @returns {string} Periodo formateado (ej: "Enero 2025")
 */
export const formatPeriodo = (periodo) => {
  if (!periodo) return '';
  
  const [year, month] = periodo.split('-');
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthIndex = parseInt(month) - 1;
  return `${monthNames[monthIndex]} ${year}`;
};

// ==================== FORMATO DE TEXTO ====================

/**
 * Capitalizar primera letra
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Truncar texto con ellipsis
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Formatear nombre de usuario (First Last -> F. Last)
 * @param {string} fullName - Nombre completo
 * @returns {string} Nombre formateado
 */
export const formatUserName = (fullName) => {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return fullName;
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  
  return `${firstName.charAt(0)}. ${lastName}`;
};

// ==================== FORMATO DE REPORTES ====================

/**
 * Formatear tipo de reporte para visualización
 * @param {number} programId - ID del programa
 * @returns {string} Nombre del programa
 */
export const formatReportType = (programId) => {
  const types = {
    1: 'Balance de Saldos',
    2: 'Inventario y Productos',
    3: 'Registros Contables',
    4: 'Mayores Auxiliares',
    5: 'Costos de Venta',
    6: 'Hoja de Trabajo',
    7: 'Estado de Resultados',
    8: 'Balance General'
  };
  
  return types[programId] || 'Desconocido';
};

/**
 * Generar nombre de archivo para exportación
 * @param {string} reportName - Nombre del reporte
 * @param {string} extension - Extensión del archivo
 * @returns {string} Nombre de archivo
 */
export const generateFileName = (reportName, extension = 'xlsx') => {
  const date = new Date();
  const timestamp = date.toISOString().split('T')[0];
  const cleanName = reportName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
  
  return `${cleanName}_${timestamp}.${extension}`;
};

// ==================== FORMATO DE CLASIFICACIONES ====================

/**
 * Obtener color por clasificación
 * @param {string} clasificacion - Clasificación de cuenta
 * @returns {string} Clase CSS de color
 */
export const getClasificacionColor = (clasificacion) => {
  const colors = {
    'Activo': 'text-blue-600 bg-blue-50',
    'Pasivo': 'text-red-600 bg-red-50',
    'Capital': 'text-green-600 bg-green-50'
  };
  
  return colors[clasificacion] || 'text-gray-600 bg-gray-50';
};

/**
 * Obtener ícono por tipo de movimiento
 * @param {string} tipo - Tipo de movimiento (debe/haber)
 * @returns {string} Emoji o símbolo
 */
export const getMovementIcon = (tipo) => {
  return tipo === 'debe' ? '↑' : '↓';
};

// ==================== FORMATO DE ESTADÍSTICAS ====================

/**
 * Formatear porcentaje
 * @param {number} value - Valor decimal (0.5 = 50%)
 * @param {number} decimals - Número de decimales
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 2) => {
  const percentage = (parseFloat(value) || 0) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formatear diferencia con signo
 * @param {number} value - Valor de diferencia
 * @returns {string} Diferencia formateada con + o -
 */
export const formatDifference = (value) => {
  const num = parseFloat(value) || 0;
  const sign = num >= 0 ? '+' : '';
  return `${sign}${formatCurrency(num)}`;
};

/**
 * Formatear cantidad abreviada (1000 -> 1K)
 * @param {number} value - Valor a abreviar
 * @returns {string} Valor abreviado
 */
export const formatCompactNumber = (value) => {
  const num = parseFloat(value) || 0;
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// ==================== CONVERSIONES ====================

/**
 * Parsear string de moneda a número
 * @param {string} currencyString - String con formato de moneda
 * @returns {number} Valor numérico
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString === 'number') return currencyString;
  if (!currencyString) return 0;
  
  // Remover símbolos de moneda, comas, y espacios
  const cleaned = currencyString
    .replace(/[^0-9.-]/g, '');
  
  return parseFloat(cleaned) || 0;
};

/**
 * Convertir objeto a query string
 * @param {Object} params - Parámetros
 * @returns {string} Query string
 */
export const objectToQueryString = (params) => {
  return Object.keys(params)
    .filter(key => params[key] !== null && params[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};