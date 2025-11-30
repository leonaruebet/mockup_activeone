'use client';

import React, { useState } from 'react';
import { cn } from '@shared/ui/utils';
import { Button } from '@shared/ui/atoms/button';
import { X, Check } from 'lucide-react';

/**
 * Filter option type
 */
interface FilterOption {
    id: string;
    label: string;
}

/**
 * Filter category configuration
 */
interface FilterCategory {
    key: string;
    label: string;
    options: FilterOption[];
}

/**
 * MobileFilterSheet Props
 */
interface MobileFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    categories: FilterCategory[];
    selectedFilters: Record<string, string[]>;
    onFiltersChange: (filters: Record<string, string[]>) => void;
}

/**
 * MobileFilterSheet - Bottom sheet filter UI for mobile
 * Provides multi-select filter functionality matching web dropdowns
 */
export function MobileFilterSheet({
    isOpen,
    onClose,
    categories,
    selectedFilters,
    onFiltersChange,
}: MobileFilterSheetProps) {
    const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.key || '');
    const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(selectedFilters);

    /**
     * Toggle a filter option
     */
    const toggleFilter = (categoryKey: string, optionId: string) => {
        const current = localFilters[categoryKey] || [];
        const updated = current.includes(optionId)
            ? current.filter(id => id !== optionId)
            : [...current, optionId];

        setLocalFilters({
            ...localFilters,
            [categoryKey]: updated,
        });
    };

    /**
     * Apply filters and close
     */
    const applyFilters = () => {
        onFiltersChange(localFilters);
        onClose();
    };

    /**
     * Clear all filters
     */
    const clearFilters = () => {
        const clearedFilters: Record<string, string[]> = {};
        categories.forEach(cat => {
            clearedFilters[cat.key] = [];
        });
        setLocalFilters(clearedFilters);
    };

    /**
     * Count total selected filters
     */
    const getTotalSelected = () => {
        return Object.values(localFilters).reduce((sum, arr) => sum + arr.length, 0);
    };

    if (!isOpen) return null;

    const activeOptions = categories.find(c => c.key === activeCategory)?.options || [];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 md:hidden"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden max-h-[80vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-noble-black-200">
                    <h2 className="text-lg font-bold text-brand-navy">Filters</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-noble-black-100"
                    >
                        <X className="w-5 h-5 text-noble-black-500" />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex border-b border-noble-black-200 overflow-x-auto no-scrollbar">
                    {categories.map((category) => {
                        const isActive = activeCategory === category.key;
                        const count = (localFilters[category.key] || []).length;

                        return (
                            <button
                                key={category.key}
                                onClick={() => setActiveCategory(category.key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                                    isActive
                                        ? "text-brand-navy border-brand-navy"
                                        : "text-noble-black-400 border-transparent"
                                )}
                            >
                                {category.label}
                                {count > 0 && (
                                    <span className="w-5 h-5 flex items-center justify-center bg-brand-navy text-white text-xs rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Options List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {activeOptions.map((option) => {
                            const isSelected = (localFilters[activeCategory] || []).includes(option.id);

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => toggleFilter(activeCategory, option.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                                        isSelected
                                            ? "bg-brand-blue/10 border-brand-blue text-brand-navy"
                                            : "bg-white border-noble-black-200 text-noble-black-500"
                                    )}
                                >
                                    <span className="font-medium">{option.label}</span>
                                    {isSelected && (
                                        <div className="w-5 h-5 bg-brand-navy rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-3 px-4 py-4 border-t border-noble-black-200 bg-white">
                    <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex-1 border-noble-black-200 text-noble-black-500 rounded-full"
                    >
                        Clear all
                    </Button>
                    <Button
                        onClick={applyFilters}
                        className="flex-1 bg-brand-navy text-white rounded-full hover:bg-brand-navy/90"
                    >
                        Apply {getTotalSelected() > 0 && `(${getTotalSelected()})`}
                    </Button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
