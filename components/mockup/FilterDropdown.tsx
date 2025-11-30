'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@shared/ui/utils';
import { ChevronDown, Check } from 'lucide-react';

/**
 * FilterDropdownProps - Props for the FilterDropdown component
 * @param label - The label displayed on the dropdown button
 * @param options - Array of options with id and label
 * @param selected - Array of selected option ids
 * @param onSelectionChange - Callback when selection changes
 * @param isActive - Whether this filter is in active/selected state
 */
interface FilterDropdownProps {
    label: string;
    options: { id: string; label: string }[];
    selected: string[];
    onSelectionChange: (selected: string[]) => void;
    isActive?: boolean;
}

/**
 * FilterDropdown - Multi-select dropdown filter component
 * Displays a pill-shaped button that opens a dropdown with checkbox options
 */
export function FilterDropdown({
    label,
    options,
    selected,
    onSelectionChange,
    isActive = false,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /**
     * Handle click outside to close dropdown
     */
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Toggle selection of an option
     * @param optionId - The id of the option to toggle
     */
    const toggleOption = (optionId: string) => {
        if (selected.includes(optionId)) {
            onSelectionChange(selected.filter(id => id !== optionId));
        } else {
            onSelectionChange([...selected, optionId]);
        }
    };

    /**
     * Get display label - shows count if multiple selected
     */
    const getDisplayLabel = () => {
        if (selected.length === 0) return label;
        if (selected.length === 1) {
            const selectedOption = options.find(opt => opt.id === selected[0]);
            return selectedOption?.label || label;
        }
        return `${label} (${selected.length})`;
    };

    const hasSelection = selected.length > 0;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border',
                    isActive || hasSelection
                        ? 'border-noble-black-600 text-noble-black-600'
                        : 'border-noble-black-300 text-noble-black-400 hover:border-noble-black-400 hover:text-noble-black-500'
                )}
            >
                {getDisplayLabel()}
                <ChevronDown
                    className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white rounded-xl border border-noble-black-200 shadow-lg py-2 z-50">
                    {options.map((option) => {
                        const isSelected = selected.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                onClick={() => toggleOption(option.id)}
                                className={cn(
                                    'flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors',
                                    isSelected
                                        ? 'text-brand-navy bg-brand-blue/5'
                                        : 'text-noble-black-500 hover:bg-noble-black-50'
                                )}
                            >
                                {/* Checkbox */}
                                <div
                                    className={cn(
                                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                        isSelected
                                            ? 'bg-brand-navy border-brand-navy'
                                            : 'border-noble-black-300'
                                    )}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="font-medium">{option.label}</span>
                            </button>
                        );
                    })}

                    {/* Clear All Button */}
                    {selected.length > 0 && (
                        <>
                            <div className="border-t border-noble-black-100 my-2" />
                            <button
                                onClick={() => onSelectionChange([])}
                                className="w-full px-4 py-2 text-sm text-brand-red hover:bg-red-50 text-left font-medium"
                            >
                                Clear all
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
