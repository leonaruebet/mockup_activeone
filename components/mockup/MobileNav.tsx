'use client';

import React from 'react';
import { cn } from '@shared/ui/utils';
import { Home, Search, PlusCircle, Calendar, User } from 'lucide-react';

/**
 * MobileNav component - bottom navigation bar for mobile
 * Uses design system components with grey strokes and brand colors
 */
export const MobileNav: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('Search');

    const navItems = [
        { name: 'Home', icon: Home },
        { name: 'Search', icon: Search },
        { name: 'Upgrade', icon: PlusCircle },
        { name: 'Upcoming', icon: Calendar },
        { name: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-noble-black-200 py-1.5 px-2 pb-safe md:hidden z-50">
            <div className="flex justify-around items-center">
                {navItems.map((item) => {
                    const isActive = activeTab === item.name;
                    const isUpgrade = item.name === 'Upgrade';

                    return (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "flex flex-col items-center gap-0.5 min-w-[48px] py-0.5 rounded-lg transition-colors",
                                isUpgrade && "relative"
                            )}
                        >
                            {/* Special styling for Upgrade button */}
                            {isUpgrade ? (
                                <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center -mt-3 shadow-lg border-2 border-white">
                                    <item.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                                </div>
                            ) : (
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-brand-red" : "text-noble-black-300"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            )}
                            <span
                                className={cn(
                                    "text-[9px] font-medium transition-colors",
                                    isActive ? "text-brand-navy" : "text-noble-black-400",
                                    isUpgrade && "text-brand-red font-semibold"
                                )}
                            >
                                {item.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
