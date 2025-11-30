'use client';

/**
 * Location Picker Component
 * Purpose: Interactive Google Maps location picker with search
 * Location: shared/ui/molecules/location_picker/location_picker.tsx
 *
 * Features:
 * - Interactive map with marker
 * - Search box with autocomplete
 * - Click to select location
 * - Returns coordinates and formatted address
 * - Google Maps link generation
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../organisms/dialog/dialog';
import { Button } from '../../atoms/button/button';
import { Input } from '../../atoms/input/input';
import { Label } from '../../atoms/label/label';
import { Typography } from '../../atoms/typography/typography';
import { MapPin, Search } from 'lucide-react';

/**
 * Location data structure returned by picker
 */
export interface LocationData {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  google_maps_link: string;
}

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: LocationData) => void;
  apiKey: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

/**
 * Map Search Component
 * Implements Google Places Autocomplete for location search
 */
function MapSearch({ onPlaceSelect }: { onPlaceSelect: (place: any) => void }) {
  const map = useMap();
  const places = useMapsLibrary('places');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !searchInputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };

    autocompleteRef.current = new places.Autocomplete(searchInputRef.current, options);
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place) {
        onPlaceSelect(place);
      }
    });
  }, [places, onPlaceSelect]);

  return (
    <div className="absolute top-4 left-4 right-4 z-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center gap-2">
        <Search className="h-4 w-4 text-dimgray dark:text-whitesmoke-300 ml-2" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for a location..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-noble-black-500 dark:text-white placeholder:text-dimgray dark:placeholder:text-whitesmoke-300"
        />
      </div>
    </div>
  );
}

/**
 * Map Content Component
 * Handles map interactions and geocoding
 */
function MapContent({
  defaultCenter,
  defaultZoom,
  onLocationChange,
}: {
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}) {
  const geocodingLib = useMapsLibrary('geocoding');
  const [selectedPosition, setSelectedPosition] = useState(defaultCenter);

  /**
   * Reverse geocode coordinates to get formatted address
   */
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocodingLib) return;

      try {
        const geocoder = new geocodingLib.Geocoder();
        const result = await geocoder.geocode({ location: { lat, lng } });

        if (result.results[0]) {
          onLocationChange(lat, lng, result.results[0].formatted_address);
        } else {
          onLocationChange(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        onLocationChange(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    },
    [geocodingLib, onLocationChange]
  );

  /**
   * Handle map click to select location
   */
  const handleMapClick = useCallback(
    (event: any) => {
      if (event.detail.latLng) {
        const lat = event.detail.latLng.lat;
        const lng = event.detail.latLng.lng;
        setSelectedPosition({ lat, lng });
        reverseGeocode(lat, lng);
      }
    },
    [reverseGeocode]
  );

  /**
   * Handle place selection from search
   */
  const handlePlaceSelect = useCallback((place: any) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setSelectedPosition({ lat, lng });
      onLocationChange(lat, lng, place.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  }, [onLocationChange]);

  // Initial geocoding when component mounts
  useEffect(() => {
    if (geocodingLib) {
      reverseGeocode(defaultCenter.lat, defaultCenter.lng);
    }
  }, [geocodingLib, defaultCenter, reverseGeocode]);

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={defaultZoom}
      gestureHandling="greedy"
      disableDefaultUI={false}
      onClick={handleMapClick}
      mapId="location-picker-map"
    >
      <MapSearch onPlaceSelect={handlePlaceSelect} />
      <AdvancedMarker position={selectedPosition} />
    </Map>
  );
}

/**
 * Location Picker Dialog Component
 */
export function LocationPicker({
  open,
  onOpenChange,
  onLocationSelect,
  apiKey,
  defaultCenter = { lat: 13.7563, lng: 100.5018 }, // Bangkok
  defaultZoom = 12,
}: LocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number }>(defaultCenter);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [showMap, setShowMap] = useState(false);

  /**
   * Handle location change from map
   */
  const handleLocationChange = useCallback((lat: number, lng: number, addr: string) => {
    setSelectedPosition({ lat, lng });
    setAddress(addr);
  }, []);

  /**
   * Generate Google Maps link from coordinates
   */
  const generateGoogleMapsLink = (lat: number, lng: number): string => {
    return `https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=16`;
  };

  /**
   * Handle location confirmation
   */
  const handleConfirm = () => {
    setIsLoading(true);

    const locationData: LocationData = {
      address: address || `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`,
      coordinates: {
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
      },
      google_maps_link: generateGoogleMapsLink(selectedPosition.lat, selectedPosition.lng),
    };

    onLocationSelect(locationData);
    setIsLoading(false);
    onOpenChange(false);
  };

  /**
   * Reset state when dialog opens/closes
   */
  useEffect(() => {
    if (open) {
      setSelectedPosition(defaultCenter);
      setAddress('');
      setShowMap(false); // Reset to setup screen
      setApiError(false);
    }
  }, [open, defaultCenter]);

  if (!apiKey) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              Google Maps Not Configured
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <Typography variant="body-m" className="text-dimgray dark:text-whitesmoke-300">
              Google Maps API key is not configured. Please add it to your environment variables.
            </Typography>
            <div className="bg-whitesmoke-100 dark:bg-gray-800 p-4 rounded-lg">
              <Typography variant="body-s" className="font-mono">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
              </Typography>
            </div>
            <Typography variant="body-s" className="text-dimgray dark:text-whitesmoke-300">
              See GOOGLE_MAPS_SETUP.md for detailed setup instructions.
            </Typography>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-600" />
            Select Location
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-[500px] w-full bg-whitesmoke-100 dark:bg-gray-800">
          {!showMap ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md text-center">
                <Typography variant="heading-s" className="text-primary-600 mb-2">
                  Google Maps API Setup Required
                </Typography>
                <Typography variant="body-s" className="text-dimgray dark:text-whitesmoke-300 mb-4">
                  To use the interactive map picker, please enable the following APIs in Google Cloud Console:
                </Typography>
                <ul className="text-left space-y-2 mb-4 bg-whitesmoke-100 dark:bg-gray-800 p-3 rounded">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">1.</span>
                    <Typography variant="body-s">Maps JavaScript API</Typography>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">2.</span>
                    <Typography variant="body-s">Places API</Typography>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">3.</span>
                    <Typography variant="body-s">Geocoding API</Typography>
                  </li>
                </ul>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    onClick={() => window.open('https://console.cloud.google.com/apis/library', '_blank')}
                    className="bg-primary-600 hover:bg-primary-700 text-white w-full"
                  >
                    Open Google Cloud Console
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMap(true)}
                    className="w-full"
                  >
                    Try Loading Map Anyway
                  </Button>
                </div>
                <Typography variant="body-s" className="text-dimgray dark:text-whitesmoke-300 mt-3">
                  See <span className="font-mono">GOOGLE_MAPS_SETUP.md</span> for detailed instructions
                </Typography>
              </div>
            </div>
          ) : (
            <APIProvider
              apiKey={apiKey}
              onLoad={() => {
                console.log('✅ Google Maps API loaded successfully');
                setApiError(false);
              }}
              onError={(error) => {
                console.error('❌ Google Maps API error:', error);
                setApiError(true);
              }}
            >
              <MapContent
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                onLocationChange={handleLocationChange}
              />
            </APIProvider>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <Label>Selected Address</Label>
            <Typography variant="body-s" className="text-dimgray dark:text-whitesmoke-300 mt-1">
              {address || 'Click on the map or search to select a location'}
            </Typography>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Latitude</Label>
              <Input
                value={selectedPosition.lat.toFixed(6)}
                readOnly
                className="bg-whitesmoke-100 dark:bg-gray-800"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                value={selectedPosition.lng.toFixed(6)}
                readOnly
                className="bg-whitesmoke-100 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !address}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {isLoading ? 'Confirming...' : 'Confirm Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
