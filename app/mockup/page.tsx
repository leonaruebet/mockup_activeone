'use client';

import React, { useState } from 'react';
import { cn } from '@shared/ui/utils';
import { Button } from '@shared/ui/atoms/button';
import { Input } from '@shared/ui/atoms/input';
import { Card } from '@shared/ui/molecules/card';
import { Tag } from '@shared/ui/atoms/tag';
import { SearchBar } from '@shared/ui/molecules/search_bar';
import { Logo } from '@shared/ui/molecules/logo/logo';
import { DateStrip } from '../../components/mockup/DateStrip';
import { ClassCard } from '../../components/mockup/ClassCard';
import { MobileNav } from '../../components/mockup/MobileNav';
import { MobileHome } from '../../components/mockup/MobileHome';
import { FilterDropdown } from '../../components/mockup/FilterDropdown';
import { Search, MapPin, Map, Coins, Bell, User, List, X, Navigation } from 'lucide-react';

/** Filter options for each dropdown category */
const FILTER_OPTIONS = {
    fitness: [
        { id: 'gym', label: 'Gym' },
        { id: 'yoga', label: 'Yoga Studio' },
        { id: 'pilates', label: 'Pilates Studio' },
        { id: 'crossfit', label: 'CrossFit Box' },
        { id: 'martial-arts', label: 'Martial Arts' },
        { id: 'dance', label: 'Dance Studio' },
    ],
    activities: [
        { id: 'hiit', label: 'HIIT' },
        { id: 'strength', label: 'Strength Training' },
        { id: 'cardio', label: 'Cardio' },
        { id: 'yoga', label: 'Yoga' },
        { id: 'pilates', label: 'Pilates' },
        { id: 'cycling', label: 'Cycling' },
        { id: 'swimming', label: 'Swimming' },
        { id: 'boxing', label: 'Boxing' },
    ],
    amenities: [
        { id: 'showers', label: 'Showers' },
        { id: 'lockers', label: 'Lockers' },
        { id: 'parking', label: 'Parking' },
        { id: 'towels', label: 'Towels Provided' },
        { id: 'wifi', label: 'Free WiFi' },
        { id: 'cafe', label: 'Cafe/Juice Bar' },
    ],
    distance: [
        { id: '1km', label: 'Within 1 km' },
        { id: '3km', label: 'Within 3 km' },
        { id: '5km', label: 'Within 5 km' },
        { id: '10km', label: 'Within 10 km' },
        { id: 'any', label: 'Any distance' },
    ],
};

/** Class data with location coordinates for map */
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
        lat: 13.7380,
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
        lat: 13.7450,
        lng: 100.5610,
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
        lat: 13.7466,
        lng: 100.5347,
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
        lng: 100.5920,
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
        lat: 13.7290,
        lng: 100.5780,
    },
];

/**
 * MockupMapWeb - Pure CSS/React map mockup for web (no external libraries)
 */
interface MockupMapWebProps {
    locations: typeof CLASS_DATA;
    selectedId?: string;
    onSelectLocation: (id: string) => void;
    onClose: () => void;
}

const MockupMapWeb: React.FC<MockupMapWebProps> = ({
    locations,
    selectedId,
    onSelectLocation,
    onClose
}) => {
    /**
     * Calculate position for pins based on lat/lng
     * Map bounds: lat 13.71-13.75, lng 100.53-100.60
     */
    const getPosition = (lat: number, lng: number) => {
        const minLat = 13.71, maxLat = 13.75;
        const minLng = 100.53, maxLng = 100.60;
        const x = ((lng - minLng) / (maxLng - minLng)) * 100;
        const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
        return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) };
    };

    const selectedLocation = locations.find(l => l.id === selectedId);

    return (
        <div className="relative w-full h-full bg-noble-black-50 overflow-hidden">
            {/* Map Background - Styled grid pattern */}
            <div className="absolute inset-0" style={{
                backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
            }} />

            {/* Roads mockup - more detailed for web */}
            <div className="absolute inset-0">
                {/* Horizontal roads */}
                <div className="absolute top-[20%] left-0 right-0 h-3 bg-noble-black-200/40" />
                <div className="absolute top-[40%] left-0 right-0 h-2 bg-noble-black-200/30" />
                <div className="absolute top-[60%] left-0 right-0 h-4 bg-noble-black-200/50" />
                <div className="absolute top-[80%] left-0 right-0 h-2 bg-noble-black-200/30" />
                {/* Vertical roads */}
                <div className="absolute left-[15%] top-0 bottom-0 w-2 bg-noble-black-200/30" />
                <div className="absolute left-[35%] top-0 bottom-0 w-3 bg-noble-black-200/40" />
                <div className="absolute left-[55%] top-0 bottom-0 w-4 bg-noble-black-200/50" />
                <div className="absolute left-[75%] top-0 bottom-0 w-2 bg-noble-black-200/35" />
                <div className="absolute left-[90%] top-0 bottom-0 w-3 bg-noble-black-200/40" />
            </div>

            {/* Area labels */}
            <div className="absolute top-[15%] left-[20%] text-noble-black-300 text-xs font-medium">Asoke</div>
            <div className="absolute top-[30%] left-[50%] text-noble-black-300 text-xs font-medium">Sukhumvit</div>
            <div className="absolute top-[50%] left-[70%] text-noble-black-300 text-xs font-medium">Thong Lo</div>
            <div className="absolute top-[70%] left-[30%] text-noble-black-300 text-xs font-medium">Siam</div>
            <div className="absolute top-[85%] left-[80%] text-noble-black-300 text-xs font-medium">Phra Khanong</div>

            {/* Location Pins */}
            {locations.map((location) => {
                const pos = getPosition(location.lat, location.lng);
                const isSelected = location.id === selectedId;
                return (
                    <button
                        key={location.id}
                        onClick={() => onSelectLocation(location.id)}
                        onMouseEnter={() => onSelectLocation(location.id)}
                        className={cn(
                            "absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 group",
                            isSelected ? "z-20 scale-110" : "z-10 hover:scale-105"
                        )}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                        <div className="relative flex flex-col items-center">
                            {/* Pin */}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-3 border-white transition-colors",
                                isSelected ? "bg-brand-navy" : "bg-brand-red"
                            )}>
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            {/* Pin tail */}
                            <div className={cn(
                                "w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent -mt-1 transition-colors",
                                isSelected ? "border-t-brand-navy" : "border-t-brand-red"
                            )} />

                            {/* Tooltip on hover */}
                            <div className={cn(
                                "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-noble-black-200 p-3 min-w-[200px] opacity-0 pointer-events-none transition-opacity",
                                isSelected && "opacity-100"
                            )}>
                                <p className="font-bold text-brand-navy text-sm">{location.title}</p>
                                <p className="text-xs text-noble-black-400">{location.studio}</p>
                                <div className="flex items-center justify-between mt-2 text-xs">
                                    <span className="text-noble-black-400">{location.time}</span>
                                    <span className="font-bold text-brand-navy flex items-center gap-1">
                                        <Coins className="w-3 h-3 text-brand-red" />
                                        {location.credits}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                );
            })}

            {/* Current location indicator */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 bg-brand-blue rounded-full border-3 border-white shadow-lg animate-pulse" />
                <div className="absolute inset-0 bg-brand-blue/30 rounded-full animate-ping" />
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 left-4 z-30 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-noble-black-50 transition-colors border border-noble-black-200"
            >
                <X className="w-5 h-5 text-noble-black-500" />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-1 z-30">
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-noble-black-500 hover:bg-noble-black-50 border border-noble-black-200 transition-colors">
                    <span className="text-xl font-bold">+</span>
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-noble-black-500 hover:bg-noble-black-50 border border-noble-black-200 transition-colors">
                    <span className="text-xl font-bold">−</span>
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-30 bg-white rounded-lg shadow-lg px-4 py-3 border border-noble-black-200">
                <div className="flex items-center gap-3 text-sm text-noble-black-500">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-brand-red rounded-full" />
                        <span>Studios ({locations.length})</span>
                    </div>
                    <div className="w-px h-4 bg-noble-black-200" />
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-brand-blue rounded-full animate-pulse" />
                        <span>You</span>
                    </div>
                </div>
            </div>

            {/* Map attribution mockup */}
            <div className="absolute bottom-4 right-4 z-30 text-[10px] text-noble-black-300">
                Map data © ActiveOne
            </div>
        </div>
    );
};

/**
 * MockupPage - Main mockup page for ActiveOne fitness class booking
 * Uses design system components with grey strokes and brand colors (#f35549, #62bad0)
 */
export default function MockupPage() {
    /** State for filter selections */
    const [fitnessFilters, setFitnessFilters] = useState<string[]>([]);
    const [activitiesFilters, setActivitiesFilters] = useState<string[]>([]);
    const [amenitiesFilters, setAmenitiesFilters] = useState<string[]>([]);
    const [distanceFilters, setDistanceFilters] = useState<string[]>([]);

    /** State for map view */
    const [isMapView, setIsMapView] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>();

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Mobile View */}
            <MobileHome />
            <MobileNav />

            {/* Desktop View */}
            <div className="hidden md:block">
                {/* App Header */}
                <nav className="sticky top-0 z-50 bg-white border-b border-noble-black-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 gap-8">
                            {/* Logo */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Logo size="xs" variant="mainColor" />
                                <span className="text-lg font-bold text-brand-navy hidden md:block">ActiveOne</span>
                            </div>

                            {/* Search Bar - White with Grey Stroke */}
                            <div className="flex-1 max-w-2xl hidden md:block">
                                <div className="flex items-center bg-white rounded-full border border-noble-black-200 overflow-hidden">
                                    {/* Search Input Section */}
                                    <div className="flex-1">
                                        <SearchBar
                                            placeholder="Search for studios, classes, or activities"
                                            showClearButton={false}
                                            className="[&_input]:border-0 [&_input]:bg-transparent [&_input]:rounded-none [&_input]:focus-visible:ring-0 [&_form]:pr-0"
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px h-6 bg-noble-black-200"></div>
                                    {/* Location Section */}
                                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-noble-black-50 transition-colors">
                                        <MapPin className="w-4 h-4 text-brand-blue" />
                                        <span className="text-sm text-brand-navy font-medium whitespace-nowrap">Bangkok</span>
                                    </button>
                                </div>
                            </div>

                            {/* User Actions */}
                            <div className="flex items-center gap-6 shrink-0">
                                {/* Credits Badge */}
                                <div className="flex items-center gap-2 bg-brand-blue/10 px-3 py-1.5 rounded-full border border-brand-blue/20">
                                    <Coins className="w-4 h-4 text-brand-blue" />
                                    <span className="font-bold text-brand-navy">45 Credits</span>
                                </div>

                                {/* Notifications */}
                                <button className="relative text-noble-black-400 hover:text-brand-navy transition-colors">
                                    <Bell className="w-6 h-6" />
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-brand-red rounded-full border-2 border-white"></span>
                                </button>

                                {/* User Avatar */}
                                <div className="w-8 h-8 rounded-full bg-noble-black-100 overflow-hidden border border-noble-black-200">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Sub Topbar - Dropdown Filters */}
                <div className="sticky top-16 z-40 bg-white border-b border-noble-black-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            {/* Filter Dropdowns */}
                            <div className="flex items-center gap-4">
                                <FilterDropdown
                                    label="Fitness"
                                    options={FILTER_OPTIONS.fitness}
                                    selected={fitnessFilters}
                                    onSelectionChange={setFitnessFilters}
                                    isActive={fitnessFilters.length > 0}
                                />
                                <FilterDropdown
                                    label="Activities"
                                    options={FILTER_OPTIONS.activities}
                                    selected={activitiesFilters}
                                    onSelectionChange={setActivitiesFilters}
                                />
                                <FilterDropdown
                                    label="Amenities"
                                    options={FILTER_OPTIONS.amenities}
                                    selected={amenitiesFilters}
                                    onSelectionChange={setAmenitiesFilters}
                                />
                                <FilterDropdown
                                    label="Distance"
                                    options={FILTER_OPTIONS.distance}
                                    selected={distanceFilters}
                                    onSelectionChange={setDistanceFilters}
                                />
                            </div>
                            {/* Map View Toggle Button */}
                            <Button
                                variant="outline"
                                onClick={() => setIsMapView(!isMapView)}
                                className={cn(
                                    "rounded-full",
                                    isMapView
                                        ? "bg-brand-navy text-white border-brand-navy hover:bg-brand-navy/90"
                                        : "border-noble-black-200 text-brand-navy hover:bg-noble-black-100 hover:border-brand-blue"
                                )}
                            >
                                {isMapView ? (
                                    <>
                                        <List className="w-4 h-4 mr-2" />
                                        List View
                                    </>
                                ) : (
                                    <>
                                        <Map className="w-4 h-4 mr-2" />
                                        Map View
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content - Split View when Map is active */}
                <div className={cn(
                    "flex",
                    isMapView ? "h-[calc(100vh-8rem)]" : ""
                )}>
                    {/* Class List Section */}
                    <main className={cn(
                        "py-8 overflow-y-auto",
                        isMapView
                            ? "w-1/2 px-6 border-r border-noble-black-200"
                            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
                    )}>
                        <div>
                            {/* Header */}
                            <div className="mb-6">
                                <h1 className={cn(
                                    "font-bold text-brand-navy mb-1",
                                    isMapView ? "text-2xl" : "text-3xl"
                                )}>
                                    Explore Classes
                                </h1>
                                <p className="text-noble-black-400">Found {CLASS_DATA.length} classes near you</p>
                            </div>

                            {/* Date Selection */}
                            <DateStrip />

                            {/* Class List */}
                            <div className="space-y-4">
                                {CLASS_DATA.map((classItem) => (
                                    <div
                                        key={classItem.id}
                                        className={cn(
                                            "transition-all duration-200",
                                            isMapView && selectedLocationId === classItem.id && "ring-2 ring-brand-blue rounded-xl"
                                        )}
                                        onMouseEnter={() => isMapView && setSelectedLocationId(classItem.id)}
                                        onMouseLeave={() => isMapView && setSelectedLocationId(undefined)}
                                    >
                                        <ClassCard
                                            horizontal
                                            image={classItem.image}
                                            title={classItem.title}
                                            studio={classItem.studio}
                                            location={classItem.location}
                                            time={classItem.time}
                                            credits={classItem.credits}
                                            tags={classItem.tags}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button */}
                            <div className="mt-8 text-center">
                                <Button
                                    variant="outline"
                                    className="px-6 border-noble-black-200 text-noble-black-500 hover:bg-noble-black-100 hover:text-brand-navy hover:border-brand-blue rounded-full"
                                >
                                    Load more classes
                                </Button>
                            </div>
                        </div>
                    </main>

                    {/* Map Section - Only visible when Map View is active */}
                    {isMapView && (
                        <div className="w-1/2 h-full">
                            <MockupMapWeb
                                locations={CLASS_DATA}
                                selectedId={selectedLocationId}
                                onSelectLocation={(id) => setSelectedLocationId(id)}
                                onClose={() => setIsMapView(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
