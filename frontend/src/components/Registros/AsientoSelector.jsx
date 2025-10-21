import React from 'react';
import { Plus } from 'lucide-react';
import { checkAsientoBalance } from '../../utils/registrosUtils';

export default function AsientoSelector({ 
  currentAsiento, 
  asientosList, 
  currentAsientoRows,
  onChangeAsiento, 
  onNewAsiento 
}) {
  const asientoBalance = checkAsientoBalance(currentAsientoRows);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Asiento No.:</label>
          <select
            value={currentAsiento}
            onChange={(e) => onChangeAsiento(parseInt(e.target.value))}
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
          onClick={onNewAsiento}
          disabled={!asientoBalance.isBalanced || currentAsientoRows.length < 2}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Nuevo Asiento
        </button>
      </div>
    </div>
  );
}