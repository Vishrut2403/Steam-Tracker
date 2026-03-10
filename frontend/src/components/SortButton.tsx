import React from 'react';
import type { SortField, SortDirection } from '../types/games.types';

interface SortButtonProps {
  field: SortField;
  label: string;
  currentField: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const SortButton: React.FC<SortButtonProps> = ({
  field,
  label,
  currentField,
  currentDirection,
  onSort
}) => {
  const isActive = currentField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
        isActive
          ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
          : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50'
      }`}
    >
      <span>{label}</span>
      {isActive && (
        <span className="text-blue-400 font-bold text-xs">
          {currentDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );
};