// services/api.js
// Servicio centralizado para comunicación con el backend

import { API_URL } from '../constants';

/**
 * Clase para manejar todas las peticiones a la API
 */
class ApiService {
  
  // ==================== AUTENTICACIÓN ====================
  
  /**
   * Iniciar sesión
   * @param {string} userId - ID del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Datos del usuario
   */
  async login(userId, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // ==================== REPORTES ====================

  /**
   * Obtener reportes de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de reportes
   */
  async getReports(userId) {
    try {
      const response = await fetch(`${API_URL}/reports?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener reportes');
      }

      return data.reports || [];
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      throw error;
    }
  }

  /**
   * Obtener un reporte específico
   * @param {number} reportId - ID del reporte
   * @returns {Promise<Object>} Datos del reporte
   */
  async getReportById(reportId) {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener reporte');
      }

      return data.report;
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      throw error;
    }
  }

  /**
   * Guardar un reporte
   * @param {Object} reportData - Datos del reporte
   * @returns {Promise<Object>} Reporte guardado
   */
  async saveReport(reportData) {
    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar reporte');
      }

      return data;
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      throw error;
    }
  }

  /**
   * Actualizar un reporte existente
   * @param {number} reportId - ID del reporte
   * @param {Object} reportData - Datos actualizados
   * @returns {Promise<Object>} Reporte actualizado
   */
  async updateReport(reportId, reportData) {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar reporte');
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      throw error;
    }
  }

  /**
   * Eliminar un reporte
   * @param {number} reportId - ID del reporte
   * @returns {Promise<Object>} Confirmación
   */
  async deleteReport(reportId) {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar reporte');
      }

      return data;
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      throw error;
    }
  }

  // ==================== CATÁLOGO DE CUENTAS ====================

  /**
   * Obtener catálogo de cuentas
   * @returns {Promise<Array>} Lista de cuentas
   */
  async getCuentas() {
    try {
      const response = await fetch(`${API_URL}/cuentas`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener cuentas');
      }

      return data.cuentas || [];
    } catch (error) {
      console.error('Error al cargar catálogo de cuentas:', error);
      throw error;
    }
  }

  /**
   * Agregar nueva cuenta al catálogo
   * @param {Object} cuentaData - Datos de la cuenta
   * @returns {Promise<Object>} Cuenta creada
   */
  async addCuenta(cuentaData) {
    try {
      const response = await fetch(`${API_URL}/cuentas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuentaData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al agregar cuenta');
      }

      return data;
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
      throw error;
    }
  }

  // ==================== REPORTES POR PERIODO ====================

  /**
   * Obtener reportes de un periodo específico
   * @param {string} userId - ID del usuario
   * @param {string} periodo - Periodo en formato YYYY-MM
   * @returns {Promise<Array>} Reportes del periodo
   */
  async getReportsByPeriodo(userId, periodo) {
    try {
      const response = await fetch(
        `${API_URL}/reports?userId=${userId}&periodo=${periodo}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener reportes del periodo');
      }

      return data.reports || [];
    } catch (error) {
      console.error('Error al cargar reportes del periodo:', error);
      throw error;
    }
  }

  /**
   * Obtener reportes por tipo de programa
   * @param {string} userId - ID del usuario
   * @param {number} programId - ID del programa (1-8)
   * @returns {Promise<Array>} Reportes del programa
   */
  async getReportsByProgram(userId, programId) {
    try {
      const response = await fetch(
        `${API_URL}/reports?userId=${userId}&programId=${programId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener reportes del programa');
      }

      return data.reports || [];
    } catch (error) {
      console.error('Error al cargar reportes del programa:', error);
      throw error;
    }
  }
}

// Exportar instancia única (Singleton)
export const apiService = new ApiService();

// También exportar la clase por si se necesita crear instancias personalizadas
export default ApiService;