'use client';

import React from 'react';
import { cn } from '@shared/ui/utils';
import { Button } from '@shared/ui/atoms/button';
import { Checkbox } from '@shared/ui/atoms/checkbox';
import { Label } from '@shared/ui/atoms/label';
import { Slider } from '@shared/ui/atoms/slider';
import { Card } from '@shared/ui/molecules/card';
import { ChevronDown } from 'lucide-react';

/**
 * FilterSection component - collapsible filter group
 * Uses design system components with grey strokes
 *
 * @param title - Section title
 * @param children - Filter content
 * @param defaultOpen - Whether section is open by default
 */
interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="border-b border-noble-black-200 py-4">
            <button
                className="flex items-center justify-between w-full text-left mb-2 group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-brand-navy group-hover:text-brand-blue transition-colors">
                    {title}
                </span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-noble-black-300 transition-transform",
                        isOpen && "transform rotate-180"
                    )}
                />
            </button>
            {isOpen && (
                <div className="mt-2 space-y-3 animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};

/**
 * FilterSidebar component - sidebar with filter options
 * Uses design system components with grey strokes and brand colors
 */
export const FilterSidebar: React.FC = () => {
    const [creditsRange, setCreditsRange] = React.useState([10]);

    return (
        <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24">
                {/* White Card Container with Grey Stroke */}
                <Card
                    variant="flat"
                    padding="none"
                    className="bg-white border border-noble-black-200 rounded-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-noble-black-200">
                        <h2 className="text-lg font-bold text-brand-navy">Filters</h2>
                        <Button variant="link" className="text-sm text-brand-blue hover:text-brand-red p-0 h-auto">
                            Reset
                        </Button>
                    </div>

                    {/* Filter Content */}
                    <div className="p-4">
                        {/* Activities Filter */}
                        <FilterSection title="Activities">
                            {['Yoga', 'Pilates', 'Cycling', 'Boxing', 'Strength', 'Dance'].map((activity) => (
                                <div key={activity} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`activity-${activity}`}
                                        className="border-noble-black-200 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"
                                    />
                                    <Label
                                        htmlFor={`activity-${activity}`}
                                        className="text-noble-black-500 hover:text-brand-navy cursor-pointer text-sm"
                                    >
                                        {activity}
                                    </Label>
                                </div>
                            ))}
                        </FilterSection>

                        {/* Time Filter */}
                        <FilterSection title="Time">
                            {['Morning (6AM - 12PM)', 'Afternoon (12PM - 5PM)', 'Evening (5PM - 9PM)'].map((time) => (
                                <div key={time} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`time-${time}`}
                                        className="border-noble-black-200 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"
                                    />
                                    <Label
                                        htmlFor={`time-${time}`}
                                        className="text-noble-black-500 hover:text-brand-navy cursor-pointer text-sm"
                                    >
                                        {time}
                                    </Label>
                                </div>
                            ))}
                        </FilterSection>

                        {/* Credits Filter */}
                        <FilterSection title="Credits">
                            <div className="px-1 pt-2">
                                <Slider
                                    min={1}
                                    max={20}
                                    step={1}
                                    value={creditsRange}
                                    onValueChange={setCreditsRange}
                                    className="[&_[data-radix-slider-track]]:bg-noble-black-200 [&_[data-radix-slider-range]]:bg-brand-blue [&_[data-radix-slider-thumb]]:border-brand-blue"
                                />
                                <div className="flex justify-between text-xs text-noble-black-400 mt-2">
                                    <span>1</span>
                                    <span className="text-brand-navy font-medium">{creditsRange[0]}</span>
                                    <span>20+</span>
                                </div>
                            </div>
                        </FilterSection>

                        {/* Amenities Filter */}
                        <FilterSection title="Amenities">
                            {['Shower', 'Lockers', 'Towels', 'Parking'].map((amenity) => (
                                <div key={amenity} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`amenity-${amenity}`}
                                        className="border-noble-black-200 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"
                                    />
                                    <Label
                                        htmlFor={`amenity-${amenity}`}
                                        className="text-noble-black-500 hover:text-brand-navy cursor-pointer text-sm"
                                    >
                                        {amenity}
                                    </Label>
                                </div>
                            ))}
                        </FilterSection>
                    </div>
                </Card>
            </div>
        </div>
    );
};
