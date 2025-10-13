// constants/index.js
// Configuración y constantes del sistema

import { 
  Calculator, 
  Package, 
  BookOpen, 
  FileText, 
  DollarSign, 
  ClipboardList, 
  BarChart3, 
  PieChart 
} from 'lucide-react';

// ==================== API ====================
export const API_URL = 'http://localhost:5000/api';

// ==================== SUBPROGRAMAS ====================
export const SUBPROGRAMAS = [
  { 
    id: 1, 
    name: 'Balance de Saldos', 
    icon: Calculator, 
    color: 'bg-blue-500',
    description: 'Registro de cuentas contables con clasificación'
  },
  { 
    id: 2, 
    name: 'Inventario y Productos en Proceso', 
    icon: Package, 
    color: 'bg-green-500',
    description: 'Control de inventarios y productos en fabricación'
  },
  { 
    id: 3, 
    name: 'Registros Contables', 
    icon: BookOpen, 
    color: 'bg-purple-500',
    description: 'Asientos contables del periodo'
  },
  { 
    id: 4, 
    name: 'Mayores Auxiliares', 
    icon: FileText, 
    color: 'bg-orange-500',
    description: 'Movimientos por cuenta individual'
  },
  { 
    id: 5, 
    name: 'Cálculo de Costos de Venta', 
    icon: DollarSign, 
    color: 'bg-pink-500',
    description: 'Determinación del costo de productos vendidos'
  },
  { 
    id: 6, 
    name: 'Hoja de Trabajo', 
    icon: ClipboardList, 
    color: 'bg-cyan-500',
    description: 'Consolidación de balances y ajustes'
  },
  { 
    id: 7, 
    name: 'Estado de Resultados', 
    icon: BarChart3, 
    color: 'bg-indigo-500',
    description: 'Utilidad o pérdida del periodo'
  },
  { 
    id: 8, 
    name: 'Balance General', 
    icon: PieChart, 
    color: 'bg-emerald-500',
    description: 'Estado de situación financiera'
  }
];

// ==================== CATÁLOGO DE CUENTAS ====================
export const CUENTAS_INICIALES = [
  { cuenta: 'Caja', clasificacion: 'Activo' },
  { cuenta: 'Bancos', clasificacion: 'Activo' },
  { cuenta: 'Clientes', clasificacion: 'Activo' },
  { cuenta: 'Inventarios', clasificacion: 'Activo' },
  { cuenta: 'Equipo de Transporte', clasificacion: 'Activo' },
  { cuenta: 'Mobiliario y Equipo', clasificacion: 'Activo' },
  { cuenta: 'Edificio', clasificacion: 'Activo' },
  { cuenta: 'Terrenos', clasificacion: 'Activo' },
  { cuenta: 'Proveedores', clasificacion: 'Pasivo' },
  { cuenta: 'Documentos por Pagar', clasificacion: 'Pasivo' },
  { cuenta: 'Acreedores Diversos', clasificacion: 'Pasivo' },
  { cuenta: 'Hipotecas por Pagar', clasificacion: 'Pasivo' },
  { cuenta: 'Capital Social', clasificacion: 'Capital' },
  { cuenta: 'Utilidad del Ejercicio', clasificacion: 'Capital' },
  { cuenta: 'Reserva Legal', clasificacion: 'Capital' }
];

// ==================== CLASIFICACIONES ====================
export const CLASIFICACIONES = ['Activo', 'Pasivo', 'Capital'];

// ==================== TIPOS DE ORDENAMIENTO ====================
export const SORT_OPTIONS = [
  { value: 'recent', label: 'Más reciente primero' },
  { value: 'oldest', label: 'Más antiguo primero' },
  { value: 'alphabetical', label: 'Orden alfabético' },
  { value: 'type', label: 'Por tipo de reporte' }
];

// ==================== ICONOS DE REPORTES ====================
export const REPORT_ICONS = {
  balance: Calculator,
  inventory: Package,
  costs: DollarSign,
  results: BarChart3,
  calendar: FileText,
  weekly: FileText,
  chart: BarChart3
};

// ==================== VALIDACIONES ====================
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
};

export const VALIDATION_MESSAGES = {
  userId: {
    required: 'El ID de usuario es requerido',
    minLength: 'El ID debe tener al menos 4 caracteres'
  },
  name: {
    required: 'El nombre es requerido',
    minLength: 'El nombre debe tener al menos 3 caracteres'
  },
  email: {
    required: 'El correo electrónico es requerido',
    invalid: 'Formato de correo inválido'
  },
  password: {
    required: 'La contraseña es requerida',
    length: 'La contraseña debe tener al menos 8 caracteres',
    uppercase: 'Debe incluir al menos una mayúscula',
    lowercase: 'Debe incluir al menos una minúscula',
    number: 'Debe incluir al menos un número',
    special: 'Debe incluir al menos un carácter especial'
  },
  confirmPassword: {
    mismatch: 'Las contraseñas no coinciden'
  }
};

// ==================== BALANCE TOLERANCE ====================
export const BALANCE_TOLERANCE = 0.01; // Diferencia aceptable en centavos