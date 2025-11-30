'use client';

import React from 'react';
import { cn } from '@shared/ui/utils';
import { Button } from '@shared/ui/atoms/button';
import { Tag } from '@shared/ui/atoms/tag';
import { Card } from '@shared/ui/molecules/card';
import { MapPin, Clock, Coins } from 'lucide-react';

/**
 * ClassCard component for displaying fitness class information
 * Uses design system components with grey strokes and brand colors
 *
 * @param image - URL of the class image
 * @param title - Name of the class
 * @param studio - Studio name
 * @param location - Location/area
 * @param time - Class time
 * @param credits - Credit cost
 * @param tags - Activity tags
 * @param horizontal - Layout mode (horizontal/vertical)
 */
interface ClassCardProps {
  image: string;
  title: string;
  studio: string;
  location: string;
  time: string;
  credits: number;
  tags?: string[];
  horizontal?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  image,
  title,
  studio,
  location,
  time,
  credits,
  tags,
  horizontal = false,
}) => {
  // Horizontal layout variant
  if (horizontal) {
    return (
      <Card
        variant="flat"
        padding="none"
        className="overflow-hidden border border-noble-black-200 hover:border-brand-blue/50 transition-all duration-300 flex h-32 md:h-40 group"
      >
        {/* Image Section - Responsive width: smaller on mobile */}
        <div className="relative w-28 md:w-48 shrink-0 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Credits Badge */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-xs font-bold text-brand-navy flex items-center gap-0.5 md:gap-1 border border-noble-black-200">
            <Coins className="w-2.5 h-2.5 md:w-3 md:h-3 text-brand-red" />
            {credits}
          </div>
        </div>

        {/* Content Section - Responsive padding */}
        <div className="flex-1 p-2.5 md:p-4 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm md:text-lg font-bold text-brand-navy line-clamp-1 group-hover:text-brand-blue transition-colors">
                  {title}
                </h3>
                <p className="text-noble-black-400 text-xs md:text-sm font-medium line-clamp-1">{studio}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-sm md:text-lg font-bold text-brand-navy">{time.split(', ')[1]}</span>
                <span className="text-[10px] md:text-xs text-noble-black-300">Today</span>
              </div>
            </div>

            {/* Location & Tags - Hide tags on mobile to save space */}
            <div className="mt-1.5 md:mt-2 flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-noble-black-400">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                <span className="line-clamp-1 truncate">{location}</span>
              </div>
              <div className="hidden md:flex gap-1">
                {tags?.slice(0, 2).map(tag => (
                  <Tag key={tag} variant="gray" size="sm" className="text-xs">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button - Smaller on mobile */}
          <div className="flex justify-end">
            <Button
              size="sm"
              className="bg-brand-red hover:bg-brand-red/90 text-white px-3 md:px-6 text-xs md:text-sm rounded-full h-7 md:h-8"
            >
              Reserve
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Vertical layout variant (default)
  return (
    <Card
      variant="flat"
      padding="none"
      className="overflow-hidden border border-noble-black-200 hover:border-brand-blue/50 transition-all duration-300 flex flex-col h-full group"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Credits Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-brand-navy flex items-center gap-1 border border-noble-black-200">
          <Coins className="w-4 h-4 text-brand-red" />
          {credits}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Tags */}
        <div className="mb-2 flex flex-wrap gap-2">
          {tags?.map(tag => (
            <Tag key={tag} variant="gray" size="sm">
              {tag}
            </Tag>
          ))}
        </div>

        {/* Title & Studio */}
        <h3 className="text-lg font-bold text-brand-navy mb-1 line-clamp-1 group-hover:text-brand-blue transition-colors">
          {title}
        </h3>
        <p className="text-brand-blue font-medium text-sm mb-3">{studio}</p>

        {/* Location & Time */}
        <div className="mt-auto space-y-2 text-sm text-noble-black-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="mt-4 w-full bg-brand-red hover:bg-brand-red/90 text-white rounded-full"
        >
          Book Now
        </Button>
      </div>
    </Card>
  );
};
