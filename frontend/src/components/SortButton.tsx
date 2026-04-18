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
					? 'bg-[#5a7fa3] border border-[#5a7fa3] text-[#e5e5e5]'
					: 'bg-[#1a1a1a] border border-[#333333] text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#e5e5e5] hover:border-[#5a7fa3]'
			}`}
		>
			<span>{label}</span>
			{isActive && (
				<span className="text-[#e5e5e5] font-bold text-xs">
					{currentDirection === 'asc' ? '↑' : '↓'}
				</span>
			)}
		</button>
	);
};