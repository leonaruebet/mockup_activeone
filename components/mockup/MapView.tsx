'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * Location data for map markers
 */
export interface MapLocation {
    id: string;
    title: string;
    studio: string;
    lat: number;
    lng: number;
    credits: number;
    time: string;
}

/**
 * MapView Props
 */
interface MapViewProps {
    locations: MapLocation[];
    onClose: () => void;
    onLocationSelect?: (location: MapLocation) => void;
    selectedLocationId?: string;
}

/**
 * MapView component - Displays locations on a Mapbox map
 */
export function MapView({
    locations,
    onClose,
    onLocationSelect,
    selectedLocationId
}: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    // Initialize map
    useEffect(() => {
        if (mapRef.current) return; // Already initialized
        if (!mapContainerRef.current) return;

        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

        if (!accessToken) {
            setMapError('Mapbox API token required. Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local');
            return;
        }

        try {
            mapboxgl.accessToken = accessToken;

            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [100.5018, 13.7563], // Bangkok
                zoom: 12,
            });

            mapRef.current = map;

            map.on('load', () => {
                console.log('Map loaded!');
                setMapLoaded(true);

                // Add navigation controls
                map.addControl(new mapboxgl.NavigationControl(), 'top-right');

                // Add markers
                locations.forEach((location) => {
                    const el = document.createElement('div');
                    el.style.cssText = `
                        width: 36px;
                        height: 36px;
                        background: #f35549;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                    el.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    `;

                    const popup = new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
                            <div style="padding: 8px; min-width: 150px;">
                                <strong style="color: #1a365d;">${location.title}</strong>
                                <p style="color: #666; font-size: 12px; margin: 4px 0;">${location.studio}</p>
                                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888;">
                                    <span>${location.time}</span>
                                    <span style="font-weight: bold; color: #1a365d;">${location.credits} credits</span>
                                </div>
                            </div>
                        `);

                    const marker = new mapboxgl.Marker(el)
                        .setLngLat([location.lng, location.lat])
                        .setPopup(popup)
                        .addTo(map);

                    el.addEventListener('click', () => {
                        onLocationSelect?.(location);
                    });

                    markersRef.current.push(marker);
                });

                // Fit to show all markers
                if (locations.length > 1) {
                    const bounds = new mapboxgl.LngLatBounds();
                    locations.forEach(loc => bounds.extend([loc.lng, loc.lat]));
                    map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
                }
            });

            map.on('error', (e) => {
                console.warn('Map error:', e);
            });

        } catch (error) {
            console.error('Map init error:', error);
            setMapError('Failed to initialize map');
        }

        return () => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, [locations, onLocationSelect]);

    // Handle selected location
    useEffect(() => {
        if (!mapRef.current || !mapLoaded || !selectedLocationId) return;

        const loc = locations.find(l => l.id === selectedLocationId);
        if (loc) {
            mapRef.current.flyTo({
                center: [loc.lng, loc.lat],
                zoom: 15,
                duration: 800
            });
        }
    }, [selectedLocationId, locations, mapLoaded]);

    return (
        <div className="relative w-full h-full bg-gray-100">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
                <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Loading State */}
            {!mapLoaded && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-500 text-sm">Loading map...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="flex flex-col items-center gap-4 text-center p-6 max-w-sm">
                        <Navigation className="w-12 h-12 text-gray-400" />
                        <div>
                            <p className="text-gray-600 font-medium mb-1">Unable to load map</p>
                            <p className="text-gray-500 text-sm">{mapError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            {mapLoaded && (
                <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        <span>{locations.length} locations</span>
                    </div>
                </div>
            )}
        </div>
    );
}
