'use client';

import React, { useState } from 'react';
import { cn } from '@shared/ui/utils';
import { Button } from '@shared/ui/atoms/button';
import { Search, MapPin, Coins, Bell, ChevronDown, Map, List, X } from 'lucide-react';
import { ClassCard } from './ClassCard';
import { DateStrip } from './DateStrip';
import { MobileFilterSheet } from './MobileFilterSheet';
import { Logo } from '@shared/ui/molecules/logo/logo';

/** Filter categories configuration - aligned with web version (no Distance) */
const FILTER_CATEGORIES = [
    {
        key: 'fitness',
        label: 'Fitness',
        options: [
            { id: 'gym', label: 'Gym' },
            { id: 'yoga', label: 'Yoga Studio' },
            { id: 'pilates', label: 'Pilates Studio' },
            { id: 'crossfit', label: 'CrossFit Box' },
            { id: 'martial-arts', label: 'Martial Arts' },
            { id: 'dance', label: 'Dance Studio' },
        ],
    },
    {
        key: 'activities',
        label: 'Activities',
        options: [
            { id: 'hiit', label: 'HIIT' },
            { id: 'strength', label: 'Strength Training' },
            { id: 'cardio', label: 'Cardio' },
            { id: 'yoga', label: 'Yoga' },
            { id: 'pilates', label: 'Pilates' },
            { id: 'cycling', label: 'Cycling' },
            { id: 'swimming', label: 'Swimming' },
            { id: 'boxing', label: 'Boxing' },
        ],
    },
    {
        key: 'amenities',
        label: 'Amenities',
        options: [
            { id: 'showers', label: 'Showers' },
            { id: 'lockers', label: 'Lockers' },
            { id: 'parking', label: 'Parking' },
            { id: 'towels', label: 'Towels Provided' },
            { id: 'wifi', label: 'Free WiFi' },
            { id: 'cafe', label: 'Cafe/Juice Bar' },
        ],
    },
];

/** Class data with coordinates for map */
const CLASS_DATA = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop',
        title: 'HIIT Body Blast',
        studio: 'The Lab Bangkok',
        location: 'Sukhumvit 31',
        time: 'Today, 18:00',
        credits: 4,
        tags: ['HIIT', 'Strength'],
        lat: 13.7350,
        lng: 100.5680,
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2069&auto=format&fit=crop',
        title: 'Vinyasa Flow',
        studio: 'Yoga Elements',
        location: 'Thong Lo',
        time: 'Today, 19:30',
        credits: 3,
        tags: ['Yoga', 'Flexibility'],
        lat: 13.7320,
        lng: 100.5850,
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
        title: 'Muay Thai Fundamentals',
        studio: 'RSM Academy',
        location: 'Asoke',
        time: 'Today, 10:00',
        credits: 5,
        tags: ['Martial Arts', 'Cardio'],
        lat: 13.7380,
        lng: 100.5600,
    },
    {
        id: '4',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
        title: 'Reformer Pilates',
        studio: 'Absolute You',
        location: 'Siam Paragon',
        time: 'Today, 12:00',
        credits: 6,
        tags: ['Pilates', 'Core'],
        lat: 13.7460,
        lng: 100.5350,
    },
    {
        id: '5',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
        title: 'CrossFit WOD',
        studio: 'Training Ground',
        location: 'Phra Khanong',
        time: 'Today, 17:00',
        credits: 5,
        tags: ['CrossFit', 'Strength'],
        lat: 13.7150,
        lng: 100.5950,
    },
    {
        id: '6',
        image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop',
        title: 'Rhythm Cycling',
        studio: 'Absolute Cycle',
        location: 'Commons Thonglor',
        time: 'Today, 18:30',
        credits: 4,
        tags: ['Cycling', 'Cardio'],
        lat: 13.7280,
        lng: 100.5780,
    },
];

/**
 * MockupMapMobile - Simple mockup map for mobile with pins
 * No external libraries required
 */
interface MockupMapMobileProps {
    locations: typeof CLASS_DATA;
    selectedId: string | null;
    onSelectLocation: (id: string) => void;
    onClose: () => void;
}

const MockupMapMobile: React.FC<MockupMapMobileProps> = ({
    locations,
    selectedId,
    onSelectLocation,
    onClose
}) => {
    // Simple relative positioning for pins on the mockup map
    // Map bounds roughly: lat 13.71-13.75, lng 100.53-100.60
    const getPosition = (lat: number, lng: number) => {
        const minLat = 13.71, maxLat = 13.75;
        const minLng = 100.53, maxLng = 100.60;
        const x = ((lng - minLng) / (maxLng - minLng)) * 100;
        const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
        return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
    };

    const selectedLocation = locations.find(l => l.id === selectedId);

    return (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-noble-black-200 bg-white">
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-noble-black-100"
                >
                    <X className="w-5 h-5 text-noble-black-500" />
                </button>
                <span className="font-semibold text-brand-navy">Map View</span>
                <div className="w-8" /> {/* Spacer for centering */}
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-noble-black-50 overflow-hidden">
                {/* Map Background - Styled grid pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }} />

                {/* Roads mockup */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-0 right-0 h-2 bg-noble-black-200/50" />
                    <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-noble-black-200/40" />
                    <div className="absolute left-1/4 top-0 bottom-0 w-1.5 bg-noble-black-200/40" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-2 bg-noble-black-200/50" />
                </div>

                {/* Location Pins */}
                {locations.map((location) => {
                    const pos = getPosition(location.lat, location.lng);
                    const isSelected = location.id === selectedId;
                    return (
                        <button
                            key={location.id}
                            onClick={() => onSelectLocation(location.id)}
                            className={cn(
                                "absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200",
                                isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"
                            )}
                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        >
                            <div className={cn(
                                "relative flex flex-col items-center",
                            )}>
                                {/* Pin */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white",
                                    isSelected ? "bg-brand-navy" : "bg-brand-red"
                                )}>
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                                {/* Pin tail */}
                                <div className={cn(
                                    "w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent -mt-1",
                                    isSelected ? "border-t-brand-navy" : "border-t-brand-red"
                                )} />
                            </div>
                        </button>
                    );
                })}

                {/* Current location indicator */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-brand-blue rounded-full border-2 border-white shadow-lg animate-pulse" />
                </div>

                {/* Legend */}
                <div className="absolute bottom-3 left-3 bg-white rounded-lg shadow-md px-3 py-2 border border-noble-black-200">
                    <div className="flex items-center gap-2 text-xs text-noble-black-500">
                        <div className="w-3 h-3 bg-brand-red rounded-full" />
                        <span>{locations.length} studios nearby</span>
                    </div>
                </div>

                {/* Zoom controls mockup */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <button className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-noble-black-500 border border-noble-black-200">
                        <span className="text-lg font-bold">+</span>
                    </button>
                    <button className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-noble-black-500 border border-noble-black-200">
                        <span className="text-lg font-bold">−</span>
                    </button>
                </div>
            </div>

            {/* Selected Location Card */}
            {selectedLocation && (
                <div className="bg-white border-t border-noble-black-200 p-3 shadow-lg">
                    <div className="flex gap-3">
                        <img
                            src={selectedLocation.image}
                            alt={selectedLocation.title}
                            className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-brand-navy text-sm line-clamp-1">{selectedLocation.title}</h3>
                            <p className="text-xs text-noble-black-400">{selectedLocation.studio}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-noble-black-400">
                                <MapPin className="w-3 h-3" />
                                <span>{selectedLocation.location}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 text-xs">
                                    <Coins className="w-3 h-3 text-brand-red" />
                                    <span className="font-bold text-brand-navy">{selectedLocation.credits}</span>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-brand-red hover:bg-brand-red/90 text-white text-xs px-4 h-7 rounded-full"
                                >
                                    Reserve
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * MobileHome component - mobile homepage view
 * Aligned with web version using same components, filters, and structure
 */
export const MobileHome: React.FC = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [isMapView, setIsMapView] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        fitness: [],
        activities: [],
        amenities: [],
    });

    /**
     * Get count of filters for a specific category
     */
    const getFilterCount = (key: string) => {
        return selectedFilters[key]?.length || 0;
    };

    /**
     * Get total filter count
     */
    const getTotalFilterCount = () => {
        return Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);
    };

    return (
        <div className="pb-24 md:hidden bg-white min-h-screen">
            {/* Mobile Header - Aligned with Web */}
            <div className="sticky top-0 bg-white z-40 border-b border-noble-black-200">
                {/* Top Row - Logo, Credits, Notifications */}
                <div className="flex items-center justify-between px-3 py-2.5">
                    {/* Logo */}
                    <div className="flex items-center gap-1">
                        <Logo width={24} height={24} variant="mainColor" />
                        <span className="text-sm font-bold text-brand-navy">ActiveOne</span>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Credits Badge */}
                        <div className="flex items-center gap-1 bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
                            <Coins className="w-3 h-3 text-brand-blue" />
                            <span className="font-bold text-brand-navy text-xs">45</span>
                        </div>

                        {/* Notifications */}
                        <button className="relative text-noble-black-400 p-1">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-brand-red rounded-full border border-white"></span>
                        </button>
                    </div>
                </div>

                {/* Search Bar - Same style as web but compact */}
                <div className="px-3 pb-2">
                    <div className="flex items-center bg-white rounded-full border border-noble-black-200 overflow-hidden">
                        <div className="flex-1 flex items-center px-2.5 min-w-0">
                            <Search className="w-3.5 h-3.5 text-noble-black-400 mr-1.5 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search studios, classes..."
                                className="flex-1 py-2 bg-transparent text-xs text-brand-navy placeholder:text-noble-black-400 focus:outline-none min-w-0"
                            />
                        </div>
                        {/* Location */}
                        <button className="flex items-center gap-1 px-2 py-1.5 border-l border-noble-black-200 shrink-0">
                            <MapPin className="w-3 h-3 text-brand-blue" />
                            <span className="text-[10px] font-medium text-brand-navy">BKK</span>
                        </button>
                    </div>
                </div>

                {/* Filter Pills - Horizontal Scroll - Aligned with web (no "Filters" button) */}
                <div className="px-3 pb-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-3 px-3">
                        {/* Individual Filter Pills - same as web */}
                        {FILTER_CATEGORIES.map((category) => {
                            const count = getFilterCount(category.key);
                            return (
                                <button
                                    key={category.key}
                                    onClick={() => setShowFilters(true)}
                                    className={cn(
                                        "flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap border transition-colors shrink-0",
                                        count > 0
                                            ? "bg-brand-navy text-white border-brand-navy"
                                            : "bg-white text-noble-black-400 border-noble-black-300"
                                    )}
                                >
                                    {category.label}
                                    {count > 0 ? (
                                        <span className="ml-0.5">({count})</span>
                                    ) : (
                                        <ChevronDown className="w-2.5 h-2.5" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Map View Toggle */}
                        <button
                            onClick={() => setIsMapView(!isMapView)}
                            className={cn(
                                "flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap border transition-colors shrink-0",
                                isMapView
                                    ? "bg-brand-navy text-white border-brand-navy"
                                    : "bg-white text-noble-black-400 border-noble-black-300"
                            )}
                        >
                            {isMapView ? (
                                <>
                                    <List className="w-3 h-3" />
                                    List
                                </>
                            ) : (
                                <>
                                    <Map className="w-3 h-3" />
                                    Map
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-3 py-3">
                {/* Header */}
                <div className="mb-3">
                    <h1 className="text-lg font-bold text-brand-navy mb-0.5">Explore Classes</h1>
                    <p className="text-xs text-noble-black-400">Found {CLASS_DATA.length} classes near you</p>
                </div>

                {/* Date Selection - Using same DateStrip component */}
                <DateStrip />

                {/* Class List - Using same ClassCard component */}
                <div className="space-y-2.5">
                    {CLASS_DATA.map((classItem) => (
                        <ClassCard
                            key={classItem.id}
                            horizontal
                            image={classItem.image}
                            title={classItem.title}
                            studio={classItem.studio}
                            location={classItem.location}
                            time={classItem.time}
                            credits={classItem.credits}
                            tags={classItem.tags}
                        />
                    ))}
                </div>

                {/* Load More Button */}
                <div className="mt-4 text-center">
                    <Button
                        variant="outline"
                        className="w-full border-noble-black-200 text-noble-black-500 hover:bg-noble-black-100 hover:text-brand-navy rounded-full text-sm py-2"
                    >
                        Load more classes
                    </Button>
                </div>
            </div>

            {/* Filter Bottom Sheet */}
            <MobileFilterSheet
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                categories={FILTER_CATEGORIES}
                selectedFilters={selectedFilters}
                onFiltersChange={setSelectedFilters}
            />

            {/* Map View Overlay */}
            {isMapView && (
                <MockupMapMobile
                    locations={CLASS_DATA}
                    selectedId={selectedLocationId}
                    onSelectLocation={setSelectedLocationId}
                    onClose={() => {
                        setIsMapView(false);
                        setSelectedLocationId(null);
                    }}
                />
            )}
        </div>
    );
};
