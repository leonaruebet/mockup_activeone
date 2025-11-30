'use client';

import React from 'react';
import { cn } from '@shared/ui/utils';
import { Button } from '@shared/ui/atoms/button';
import { Card } from '@shared/ui/molecules/card';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/molecules/popover';
import { Calendar } from '@shared/ui/organisms/calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

/**
 * DateStrip component - horizontal date selector with calendar popup
 * Uses design system components with grey strokes and brand colors
 */
export const DateStrip: React.FC = () => {
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

    // Generate dates for the week starting from selected date's week
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    /**
     * Handles date selection from the strip
     * @param date - The selected date
     */
    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    /**
     * Handles date selection from the calendar popup
     * @param date - The selected date from calendar
     */
    const handleCalendarSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            setIsCalendarOpen(false);
        }
    };

    /**
     * Navigate to previous week
     */
    const handlePrevWeek = () => {
        setSelectedDate(addDays(selectedDate, -7));
    };

    /**
     * Navigate to next week
     */
    const handleNextWeek = () => {
        setSelectedDate(addDays(selectedDate, 7));
    };

    return (
        <Card
            variant="flat"
            padding="sm"
            className="mb-4 md:mb-6 bg-white border border-noble-black-200 overflow-x-auto no-scrollbar"
        >
            <div className="flex items-center gap-2 md:gap-4">
                {/* Previous Week Button */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handlePrevWeek}
                    className="text-noble-black-300 hover:text-brand-navy hover:bg-noble-black-100 shrink-0 w-7 h-7 md:w-9 md:h-9"
                >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </Button>

                {/* Date Buttons - Evenly distributed across available space */}
                <div className="flex-1 flex justify-between md:justify-center md:gap-6">
                    {dates.map((date, index) => {
                        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                            <button
                                key={index}
                                onClick={() => handleDateClick(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center transition-all duration-200",
                                    "w-10 h-10 md:w-12 md:h-12",
                                    isSelected
                                        ? "bg-brand-red text-white rounded-full shadow-sm"
                                        : "hover:bg-noble-black-50 text-noble-black-400 hover:text-brand-navy rounded-full"
                                )}
                            >
                                <span className={cn(
                                    "text-[8px] md:text-[10px] font-medium uppercase leading-tight",
                                    isSelected ? "text-white/90" : "text-noble-black-300"
                                )}>
                                    {format(date, 'EEE')}
                                </span>
                                <span className={cn(
                                    "text-sm md:text-base font-bold leading-tight",
                                    isSelected ? "text-white" : "text-noble-black-500"
                                )}>
                                    {format(date, 'd')}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Next Week Button */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleNextWeek}
                    className="text-noble-black-300 hover:text-brand-navy hover:bg-noble-black-100 shrink-0 w-7 h-7 md:w-9 md:h-9"
                >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>

                {/* Divider - Hidden on mobile */}
                <div className="hidden md:block w-px h-10 bg-noble-black-200"></div>

                {/* Calendar Picker Button - Icon only on mobile, full on desktop */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="text-brand-navy hover:bg-noble-black-100 hover:text-brand-blue font-medium whitespace-nowrap shrink-0 px-2 md:px-4"
                        >
                            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                            <span className="hidden md:inline text-sm font-semibold">{format(selectedDate, 'MMM d, yyyy')}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 bg-white border border-noble-black-200 rounded-xl shadow-lg"
                        align="end"
                    >
                        <div className="p-3">
                            {/* Calendar Header */}
                            <div className="mb-3 text-center">
                                <span className="text-sm font-semibold text-brand-navy">
                                    Select Date
                                </span>
                            </div>
                            {/* Calendar Component */}
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleCalendarSelect}
                                className="rounded-lg bg-white"
                                classNames={{
                                    selected: "bg-brand-red text-white hover:bg-brand-red hover:text-white focus:bg-brand-red focus:text-white rounded-full",
                                    today: "bg-noble-black-100 text-brand-navy rounded-full",
                                }}
                            />
                            {/* Quick Actions */}
                            <div className="mt-3 pt-3 border-t border-noble-black-200 flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCalendarSelect(new Date())}
                                    className="flex-1 text-brand-blue hover:bg-brand-blue/10"
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCalendarSelect(addDays(new Date(), 1))}
                                    className="flex-1 text-noble-black-500 hover:bg-noble-black-100"
                                >
                                    Tomorrow
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </Card>
    );
};
