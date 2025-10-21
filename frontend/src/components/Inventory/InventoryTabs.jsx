import React from 'react';
import { Package, ClipboardList } from 'lucide-react';

export default function InventoryTabs({ activeModule, onModuleChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => onModuleChange('inventory')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeModule === 'inventory'
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
          onClick={() => onModuleChange('inProcess')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeModule === 'inProcess'
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
  );
}