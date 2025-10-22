// utils/validators.js
// Funciones de validación reutilizables

import { PASSWORD_REQUIREMENTS, VALIDATION_MESSAGES } from '../constants';

// ==================== VALIDACIÓN DE CONTRASEÑA ====================

/**
 * Validar requisitos de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} Estado de cada requisito
 */
export const validatePassword = (password) => {
  return {
    length: password.length >= PASSWORD_REQUIREMENTS.minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

/**
 * Verificar si la contraseña cumple todos los requisitos
 * @param {string} password - Contraseña a verificar
 * @returns {boolean} True si es válida
 */
export const isPasswordValid = (password) => {
  const requirements = validatePassword(password);
  return Object.values(requirements).every(req => req === true);
};

/**
 * Obtener mensaje de error de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {string|null} Mensaje de error o null si es válida
 */
export const getPasswordError = (password) => {
  if (!password) {
    return VALIDATION_MESSAGES.password.required;
  }
  
  const requirements = validatePassword(password);
  
  if (!requirements.length) return VALIDATION_MESSAGES.password.length;
  if (!requirements.uppercase) return VALIDATION_MESSAGES.password.uppercase;
  if (!requirements.lowercase) return VALIDATION_MESSAGES.password.lowercase;
  if (!requirements.number) return VALIDATION_MESSAGES.password.number;
  if (!requirements.special) return VALIDATION_MESSAGES.password.special;
  
  return null;
};

// ==================== VALIDACIÓN DE USUARIO ====================

/**
 * Validar ID de usuario
 * @param {string} userId - ID a validar
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validateUserId = (userId) => {
  if (!userId || !userId.trim()) {
    return VALIDATION_MESSAGES.userId.required;
  }
  if (userId.length < 4) {
    return VALIDATION_MESSAGES.userId.minLength;
  }
  return null;
};

/**
 * Validar nombre
 * @param {string} name - Nombre a validar
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return VALIDATION_MESSAGES.name.required;
  }
  if (name.length < 3) {
    return VALIDATION_MESSAGES.name.minLength;
  }
  return null;
};

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return VALIDATION_MESSAGES.email.required;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return VALIDATION_MESSAGES.email.invalid;
  }
  return null;
};

/**
 * Validar confirmación de contraseña
 * @param {string} password - Contraseña original
 * @param {string} confirmPassword - Confirmación
 * @returns {string|null} Mensaje de error o null si coinciden
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return VALIDATION_MESSAGES.confirmPassword.mismatch;
  }
  return null;
};

// ==================== VALIDACIÓN DE FORMULARIOS ====================

/**
 * Validar formulario de login
 * @param {Object} formData - Datos del formulario {userId, password}
 * @returns {Object} Objeto con errores por campo
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const userIdError = validateUserId(formData.userId);
  if (userIdError) errors.userId = userIdError;
  
  if (!formData.password) {
    errors.password = VALIDATION_MESSAGES.password.required;
  }
  
  return errors;
};

/**
 * Validar formulario de registro
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Objeto con errores por campo
 */
export const validateRegisterForm = (formData) => {
  const errors = {};
  
  const userIdError = validateUserId(formData.userId);
  if (userIdError) errors.userId = userIdError;
  
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = getPasswordError(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;
  
  return errors;
};

// ==================== VALIDACIÓN DE DATOS CONTABLES ====================

/**
 * Validar que un monto sea numérico y positivo
 * @param {any} value - Valor a validar
 * @returns {boolean} True si es válido
 */
export const isValidAmount = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validar que una fila de balance tenga datos completos
 * @param {Object} row - Fila del balance {cuenta, clasificacion, monto}
 * @returns {boolean} True si está completa
 */
export const isBalanceRowValid = (row) => {
  return !!(
    row.cuenta && 
    row.cuenta.trim() && 
    row.clasificacion && 
    isValidAmount(row.monto)
  );
};

/**
 * Validar que una fila de inventario tenga datos completos
 * @param {Object} row - Fila de inventario {producto, unidades, costoUnitario}
 * @returns {boolean} True si está completa
 */
export const isInventoryRowValid = (row) => {
  return !!(
    row.producto && 
    row.producto.trim() && 
    isValidAmount(row.unidades) && 
    isValidAmount(row.costoUnitario)
  );
};

/**
 * Validar que una fila de proceso tenga datos completos
 * @param {Object} row - Fila de proceso
 * @returns {boolean} True si está completa
 */
export const isProcessRowValid = (row) => {
  return !!(
    row.detalle && 
    row.detalle.trim() && 
    row.producto && 
    row.producto.trim() && 
    isValidAmount(row.cantidad)
  );
};

/**
 * Validar nombre de reporte
 * @param {string} name - Nombre del reporte
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validateReportName = (name) => {
  if (!name || !name.trim()) {
    return 'El nombre del reporte es requerido';
  }
  if (name.length < 3) {
    return 'El nombre debe tener al menos 3 caracteres';
  }
  if (name.length > 100) {
    return 'El nombre no puede exceder 100 caracteres';
  }
  return null;
};

/**
 * Validar fecha
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {string|null} Mensaje de error o null si es válida
 */
export const validateDate = (date) => {
  if (!date) {
    return 'La fecha es requerida';
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  // Verificar que no sea una fecha futura (más de 1 día en el futuro)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (dateObj > tomorrow) {
    return 'La fecha no puede ser futura';
  }
  
  return null;
};

/**
 * Validar periodo (formato YYYY-MM)
 * @param {string} periodo - Periodo a validar
 * @returns {boolean} True si es válido
 */
export const isValidPeriodo = (periodo) => {
  if (!periodo) return false;
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return regex.test(periodo);
};

/**
 * Validar clasificación de cuenta
 * @param {string} clasificacion - Clasificación a validar
 * @returns {boolean} True si es válida
 */
export const isValidClasificacion = (clasificacion) => {
  return ['Activo', 'Pasivo', 'Capital'].includes(clasificacion);
};

// ==================== VALIDACIÓN DE REPORTES ====================

/**
 * Validar datos mínimos para guardar un reporte
 * @param {Object} reportData - Datos del reporte
 * @returns {Object} {isValid: boolean, errors: Array}
 */
export const validateReportData = (reportData) => {
  const errors = [];
  
  const nameError = validateReportName(reportData.name);
  if (nameError) errors.push(nameError);
  
  const dateError = validateDate(reportData.date);
  if (dateError) errors.push(dateError);
  
  if (!reportData.programId || reportData.programId < 1 || reportData.programId > 8) {
    errors.push('Tipo de programa inválido');
  }
  
  if (!reportData.data || (Array.isArray(reportData.data) && reportData.data.length === 0)) {
    errors.push('El reporte debe contener al menos una fila de datos');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};